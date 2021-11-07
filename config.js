/* create and export configuration variables */

const environments = {};

// Staging (default) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret':'this is a secret'
};

environments.production = {
    'httpPort':5000,
    'httpsPort': 5001,
    'envName':'production',
    'hashingSecret':'this is also a secret'
};

//Determine which environment was passed as a command line argument

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check to see if the environment is one of the above, if not, default to staging

const environmentToExport = typeof(environments[currentEnvironment])  == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;