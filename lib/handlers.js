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

//TODO Only let an authenticated user access their object.
handlers._users.get = (data, callback) => {
//Check that the phone number provided is valid
    const phone = typeof (data.queryStringObject.phone === 'string') && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                //remove hashed pw from user object before sending back
                delete data.hashedPassword;
                callback(200, data);
                return;
            }
            callback(404);
        });
        return;
    }
    callback(400, {'Error': 'Missing required query param'});
};

//Users put
//required data: phone
//optional data: firstName, lastName, password ( at least one must be specified)
//TODO only let an authenticated user update their own object

handlers._users.put = (data, callback) => {
    //check for the required field
    const phone = typeof (data.payload.phone === 'string') && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        //Error if nothing sent to update;
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
        return;
    }
    callback(400, {'Error': 'Missing required fields'});
};


//Users delete
//required field phone
//@TODO only let an authenticated users delete their object
//@TODO delete any other related files to this user
handlers._users.delete = (data, callback) => {
//Check that the phone number provided is valid
    const phone = typeof (data.queryStringObject.phone === 'string') && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
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
        return;
    }
    callback(400, {'Error': 'Missing required query param'});
};

// define the handlers

//ping handler
handlers.ping = (data, callback) => {
    callback(200)
};


handlers.notFound = (data, callback) => {
    callback(404)
};

module.exports = handlers;