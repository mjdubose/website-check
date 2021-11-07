// Dependencies
const http = require('http');
const https = require('https');
const {URL} = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require ('./config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

//The server should respond to all requests with a string
// Instantiate the HTTP server

const httpServer = http.createServer(function (req, res) {
    unifiedServer(req,res);
});
//start the server
httpServer.listen(config.httpPort, () => {
    console.log('The server is listening on port: '+config.httpPort);
});

//Instantiate the HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req,res);
});

//start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log('The server is listening on port: '+config.httpsPort);
});

//function to handle both http and https
const unifiedServer = (req,res)=>{

    const baseURL = req.protocol + '://' + req.headers.host + '/';

    //get the url and parse it.
    const parsedUrl = new URL(req.url, baseURL);
    //get the path from the url;
    let path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as an object;
    const queryStringObject = Object.fromEntries(parsedUrl.searchParams);

    //get the headers as an object;
    const headers = req.headers;

    //get the http method
    const method = req.method.toLowerCase();

    //get the payload if any

    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    })
    req.on('end', () => {
        buffer += decoder.end();

        //chose the handler this request should go to
        //if not found, use notFound handler

        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //construct the data object to send to the handler;

        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        //route the request to the handler specified in the router;
        chosenHandler(data, (statusCode, payload) => {
            //use the status code returned by the handler or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            //use the payload returned by the handler or default to an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            //convert the payload to a string

            const payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ',statusCode, payloadString);

        });
    });

}

//define a request router
const router = {
    ping: handlers.ping,
    users: handlers.users
}