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


module.exports = helpers;