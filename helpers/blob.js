const { BlobServiceClient } = require("@azure/storage-blob");
const { Blob } = require("@azure/storage-blob");

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

module.exports = {
    getFilesByAdvertisementAccount:getFilesByAdvertisementAccount
}