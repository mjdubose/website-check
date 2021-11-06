// Dependencies
const http = require('http');
const {URL} = require('url');

//The server should respond to all requets with a string

// Start the server and have it listen on port 3000
const objToString = (obj) => {
    let string = '{';
    for (const prop in obj) {
        string = string + ' ' + prop + ": " + obj[prop] + ",";
    }

    if (string.length === 1){
        return '';
    }
        string = string.substring(0, string.length - 1);
        string = string + ' }';

    return string;
}


const server = http.createServer(function (req, res) {
    const baseURL = req.protocol + '://' + req.headers.host + '/';

    //get the url and parse it.
    const parsedUrl = new URL(req.url, baseURL);
    //get the path from the url;
    let path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as an object;
    const queryStringObject = Object.fromEntries(parsedUrl.searchParams);

    //get the http method
    const method = req.method.toLowerCase();

    //send the response
    res.end('Hello World\n ');

    //log the request
    console.log('request received on path: ' + trimmedPath + ' with method ' + method + ' with these query param parameters ' + objToString(queryStringObject));

});

server.listen(3000, function () {
    console.log('The server is listening on port 3000 now');
});