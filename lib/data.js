//library for storing and reading data

const fs = require('fs');
const path = require('path');

//Container for this module
const lib = {};

//define base folder of the lib
lib.baseDir = path.join(__dirname, '/../.data');

lib.create = (dir, filename, data, callback) => {
    // try to open the file for writing
    fs.open(lib.baseDir + '/' + dir + '/' + filename + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            //Convert data to string
            const stringData = JSON.stringify(data);
            //write to file and close it

            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            })
        } else {
            callback('Could not create new file, it may already exist');
        }
    })
}

lib.read = (dir, filename, callback) => {
    fs.readFile(lib.baseDir + '/' + dir + '/' + filename + '.json', 'utf8', function (err, data) {
        callback(err, data);
    });
}

lib.update = (dir, filename, data, callback) => {
//Open the file for writing
    fs.open(lib.baseDir + '/' + dir + '/' + filename + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            //Truncate the file
            fs.truncate(lib.baseDir + '/' + dir + '/' + filename + '.json', fileDescriptor, function (err) {
                if (!err) {

                    //write to the file and close it;
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to file');
                        }
                    })


                } else {
                    callback('Error truncating file.');
                }
            });

        } else {
            callback('Could not open the file for updating. It may not exist yet.');
        }

    });

};

lib.delete = (dir, filename, callback)=>{
    fs.unlink(lib.baseDir + '/' + dir + '/' + filename + '.json',function(err, ){
       if(!err){
           callback(false);
       } else{
           callback('Error deleting file');
       }
    });
}

module.exports = lib;