// Dependencies
const http = require('http');
const {URL} = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

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

    //get the headers as an object;
    const headers = req.headers;

    //get the http method
    const method = req.method.toLowerCase();

    //get the payload if any

    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data',(data)=>{
        buffer += decoder.write(data);
    })
    req.on('end',()=>{
       buffer += decoder.end();
       res.end('Hello World\n');
       console.log('Request received with this payload: ', buffer);
    });
});

server.listen(3000, () => {
    console.log('The server is listening on port 3000 now');
});