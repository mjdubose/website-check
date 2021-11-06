// Dependencies
const http = require('http');
const {URL} = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

//The server should respond to all requets with a string

// Start the server and have it listen on port 3000

const server = http.createServer(function (req, res) {
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
            'payload': buffer
        };

        //route the request to the handler specified in the router;
        chosenHandler(data, (statusCode, payload) => {
            //use the status code returned by the handler or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            //use the payload returned by the handler or default to an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            //convert the payload to a string

            const payloadString = JSON.stringify(payload);

            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ',statusCode, payloadString);

        });
    });
});

server.listen(3000, () => {
    console.log('The server is listening on port 3000 now');
});

//define the handlers
const handlers = {};

// define the handlers

handlers.sample = (data, callback) => {
    //Callback a http status code and payload object

    callback(406, {'name': 'sample handler'})
};

handlers.notFound = (data, callback) => {

    callback(404)
};

//define a request router

const router = {
    sample: handlers.sample
}