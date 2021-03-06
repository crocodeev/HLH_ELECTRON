'use strict'

//const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;
const fs = require('fs-extra');




let model = {
    notFound:[],
    //task queue
    taskArr:[],
    //path arrays
    arr:[],
    // чтение директорий и сохранение оных в массив, разобраться как это сделать с помощью колбэков
    getFolders: function listDirectories(dir, callback) {
    fs.readdir(dir, (err, fileNames) => {
        if (err) return callback(err);
        if (!fileNames.length) return callback(null, []);

        // We have to keep track of the remaining operations
        let remaining = fileNames.length;

        const subDirs = [];
        fileNames.forEach((name) => {
            const file = path.join(dir, name);
            fs.stat(file, (err, stats) => {
                if (err) return callback(err);
                if (stats.isDirectory()) {
                    subDirs.push(file);
                    listDirectories(file, (err, subSubDirs) => {
                        if (err) return callback(err);
                        subDirs.push(...subSubDirs);
                        let spinnerInfo = document.getElementById('spinnerInfo'); // разобраться с этим callback'ом ибо порнография!!!
                        spinnerInfo.innerText = file;
                        if (!--remaining) {
                            // We've gathered the sub dirs of this sub dir and this was the last file to check, all done.
                            callback(null, subDirs);
                        }
                    });
                } else if (!--remaining) {
                    // File was not a dir and was the last file to check, all done.
                    callback(null, subDirs);
                }
            });
        });
    });
},
    targetFolders:[],
    copy: function (source,destination,callback) {
    let foldername = path.basename(source);
      fs.copySync(source, path.join(destination,foldername));
    },
    find: function (targetFolder) {
        for (let i = 0; i < this.arr.length; i++) {
          //old search logic
          /*if(this.arr[i].toLowerCase().includes(targetFolder.toLowerCase())){
            return this.arr[i];
          }*/
          //new search logic
          let endOfPath = path.basename(this.arr[i]);
          if (endOfPath.toLowerCase() === targetFolder.toLowerCase()) {
            return this.arr[i];
          }

        }
        console.log("Not found " + targetFolder);
    },
    logger: function (destination, message) {
      fs.appendFile(path.join(destination, "log.txt"), message + "\n", (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
    }
}

module.exports.model = model;
