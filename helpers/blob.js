const { BlobServiceClient } = require("@azure/storage-blob");
const { Blob } = require("@azure/storage-blob");
const tables = require('./tables');

const account = "sportzbattle";
const sas = process.env.AZURE_STORAGE_SAS;

const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net${sas}`
);

async function getFilesByAdvertisementAccount(advertisement_account_id) {
    const containerClient = blobServiceClient.getContainerClient('advertisements');

    let i = 1;
    let iter = await containerClient.listBlobsFlat();

    console.log('iter',iter);
    var files = [];
    for await (const blob of iter) {
        //console.log(`Blob ${i++}: ${blob.name}`);
        if (blob.name.indexOf(advertisement_account_id + '/') == 0) files.push(blob.name);
    }
    
    return files;
}

async function getActiveAdvertisementFiles() {
    
    //get active accounts
    var accounts = await tables.getByField('advertisement_accounts','is_active',1);
    var accounts_ids = accounts.map(x => { return x.advertisement_account_id});
    
    const containerClient = blobServiceClient.getContainerClient('advertisements');

    let i = 1;
    let iter = await containerClient.listBlobsFlat();

    //console.log('iter',iter);
    var files = [];
    
    for await (const blob of iter) {
        //console.log(`Blob ${i++}: ${blob.name}`);
        var tags = blob.name.split('/');
        if (accounts_ids.indexOf(Number(tags[0])) > -1) files.push(blob.name);
    }
    
    return files;
}

module.exports = {
    getFilesByAdvertisementAccount:getFilesByAdvertisementAccount,
    getActiveAdvertisementFiles:getActiveAdvertisementFiles
}