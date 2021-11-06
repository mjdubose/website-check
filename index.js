// Dependencies
const http = require('http');
const {URL} = require('url');

//The server should respond to all requets with a string

// Start the server and have it listen on port 3000

const server = http.createServer(function(req,res){
    const baseURL =  req.protocol + '://' + req.headers.host + '/';

    //get the url and parse it.
    const parsedUrl = new URL(req.url,baseURL);
    //get the path from the url;
    let path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')


    //send the response
    res.end('Hello World\n ');

    //log the request
    console.log('request received on path: '+ trimmedPath);

});

server.listen(3000,function(){
    console.log('The server is listening on port 3000 now');
});