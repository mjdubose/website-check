//helpers for various tasks

const crypto = require('crypto');
const config = require('../config');

const helpers = {};
helpers.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    }
    return false;
};

//parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
    try {
        return JSON.parse(str);
    } catch (err) {
        return {};
    }
}

helpers.createRandomString = (strLength)=>{
    strLength = typeof(strLength)=== 'number'  && strLength >0 ? strLength : false;
    if (strLength){
        //Define all possible characters that could go into string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz123456789';
        let str = '';
        for (let i = 1; i<= strLength; i++){
            //Get a random character from the possibleCharacters string
            let randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str+= randomChar;
        }
        return str;
    } else {
        return false;
    }
}


module.exports = helpers;