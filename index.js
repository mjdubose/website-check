// Dependencies
const http = require('http');

//The server should responde to all requets with a string

// Start the server and have it listen on port 3000

const server = http.createServer(function(req,res){
    res.end('Hello World');
});

server.listen(3000,function(){
    console.log('The server is listening on port 3000 now');
});