const csv = require('csv-parser');
const fs = require('fs');
const tables = require('./tables');
var stripBomStream; // = require('strip-bom-stream');
var path = require("path");
const https = require('https');

async function loadStripBomStream() {
    const { default: stripBomStream } = await import('strip-bom-stream');
    return stripBomStream;
}
  

async function batchUpload(filename){

    stripBomStream = await loadStripBomStream();
    await downloadRemoteFile("https:\\sportzbattle.blob.core.windows.net\\uploads\\" + filename, path.join(__dirname,'..','temp', filename));
    var records = await parseUploadFile(path.join(__dirname,'..','temp', filename));

    for (let row of records){
        await tables.addItem('questions2',row);
    }

    return records.length;
}

function downloadRemoteFile(filename, destination_path) {
    return new Promise(function (resolve, reject) {
        const file = fs.createWriteStream(destination_path);

        https.get(filename, (res) => {
            res.pipe(file);
            res.on('end', () => {
                console.log('file downloaded sucesfully')
                resolve();
            })
        }).on('error', (err) => {
            console.error(err);
            reject(err);
        })
    });
}

function parseUploadFile(filename) {
    return new Promise(function (resolve, reject) {
    var records = [];
    fs.createReadStream(filename)
        .pipe(stripBomStream())
        .pipe(csv())
        .on('data', (row) => { records.push(row); })
        .on('end', () => {
           console.log('CSV file parsed!');
           console.log('sample', records[0]);
           resolve(records);
        })
        .on('error',(err) => {
            console.error(err);
            reject(err);
        });
    });
}

module.exports = {
    batchUpload: batchUpload
};
