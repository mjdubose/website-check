const _data = require('./data');
const helpers = require('./helpers');

// these are the request handlers
//define the handlers
const handlers = {};

handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'delete', 'put'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

//container for users sub-methods
handlers._users = {};

//Users Post - required fields = firstName, lastName, phone, password, tosAgreement
//optional data: none
handlers._users.post = (data, callback) => {
//Check that all required fields are filled out
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement === true;

    if (firstName && lastName && password && phone && tosAgreement) {
        // make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);
                //create user object

                if (!hashedPassword) {
                    callback(500, {'Error': 'Could not hash the users password'});
                    return;
                }

                const userObject = {
                    'firstName': firstName,
                    'lastName': lastName,
                    'phone': phone,
                    'hashedPassword': hashedPassword,
                    'tosAgreement': tosAgreement
                }

                //store the user
                _data.create('users', phone, userObject, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500, {'Error': 'Could not add new user'});
                    }
                })
            } else {
                //User already exists
                callback(400, {'Error': 'User with that same phone number already exists'});
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

//Users -get
// required data: phone
//optional data: none
handlers._users.get = (data, callback) => {
//Check that the phone number provided is valid
    const phone = typeof (data.queryStringObject.phone === 'string') && data.queryStringObject.phone && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    //Get token from headers
    if (phone) {
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        //verify that the token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        //remove hashed pw from user object before sending back
                        delete data.hashedPassword;
                        callback(200, data);
                        return;
                    }
                    callback(404);
                });
            } else {
                callback(403, {'Error': 'Token is invalid for user'});
            }
        });
        return;
    }
    callback(400, {'Error': 'Missing required query param'});
};

//Users put
//required data: phone
//optional data: firstName, lastName, password ( at least one must be specified)
handlers._users.put = (data, callback) => {
    //check for the required field
    const phone = typeof (data.payload.phone === 'string') && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        //verify that the token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
                if (firstName || lastName || password) {
                    //Lookup user
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            //update the fields necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            //store the updated user
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                    return;
                                }
                                console.log(err);
                                callback(500, {'Error': 'Could not update the user'});
                            });
                            return;
                        }
                        callback(400, {"Error": "the specified user does not exist"});
                    });
                    return;
                }
                callback(400, {"Error": "Missing fields to update"});
            } else {
                callback(403, {'Error': 'Token is invalid for user'});
            }
        });
        return;
    }
    callback(400, {'Error': 'Missing required fields'});
};


//Users delete
//required field phone
handlers._users.delete = (data, callback) => {
//Check that the phone number provided is valid
    const phone = typeof (data.queryStringObject.phone === 'string') && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        //verify that the token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200);
                                return;
                            }
                            callback(500, {"Error": "Could not delete the specified user"});
                        });
                        return;
                    }
                    callback(400, {"Error": "Could not find the specified user"});
                });

            } else {
                callback(403, {'Error': 'Token is invalid for user'});
            }
            return;
        });
    }
    callback(400, {'Error': 'Missing required query param'});
};


//tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'delete', 'put'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}

//container for tokens methods

handlers._tokens = {};

//required data is phone and password
//optional is none

handlers._tokens.post = (data, callback) => {
    const phone = typeof (data.payload.phone === 'string') && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        //Lookup the user who matches that phone number
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                //hash the sent password, and compare it to the password stored in the user object.
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.hashedPassword) {
                    //if valid create a new token with a random name. Set the expiration date to one hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone': phone,
                        "id": tokenId,
                        'expires': expires
                    };

                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create the new token'});
                        }
                    });

                } else {
                    callback(400, {"Error": "Password did not match the specified users stored password"});
                }
            } else {
                callback(400, {"Error": "Could not find the specified user"});
            }
        })
    } else {
        callback(400, {"Error": "Missing required field(s)"});
    }
};

// Tokens -put
//Required data : id, extend
//optional params :none

handlers._tokens.put = (data, callback) => {
    const id = typeof (data.payload.id === 'string') && data.payload.id && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                if (tokenData.expires > Date.now()) {
                    //Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    //store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                            return;
                        }
                        callback(500, {'Error': 'Could not update the token\'s expiration'});
                    });
                } else {
                    callback(400, {'Error': 'Specified token has expired'});
                }
            } else {
                callback(400, {'Error': 'Specified token does not exist'});
            }
        });
        return;
    }
    callback(400, {'Error': 'Missing required query param'});
};

// Tokens -get
//Required data : id
//optional params :none
handlers._tokens.get = (data, callback) => {
    const id = typeof (data.queryStringObject.id === 'string') && data.queryStringObject.id && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
                return;
            }
            callback(404);
        });
        return;
    }
    callback(400, {'Error': 'Missing required query param'});

};
handlers._tokens.delete = (data, callback) => {
    const id = typeof (data.queryStringObject.id === 'string') && data.queryStringObject.id && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                        return;
                    }
                    callback(500, {"Error": "Could not delete the specified token"});
                });
                return;
            }
            callback(400, {"Error": "Could not find the specified token"});
        });
        return;
    }
    callback(400, {'Error': 'Missing required  param'});

};

//verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            //check that the token is for the given user and has not expired
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
                return;
            }
            callback(false);
        } else {
            callback(false);
        }
    });
}


//ping handler
handlers.ping = (data, callback) => {
    callback(200)
};


handlers.notFound = (data, callback) => {
    callback(404)
};

module.exports = handlers;