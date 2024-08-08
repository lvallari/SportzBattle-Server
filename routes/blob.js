var express = require('express');
var router = express.Router();
const blob = require('../helpers/blob');


router.get('/getActiveAdvertisementFiles', function (req, res, next) {
    console.log('get active advertisement files');
    
    blob.getActiveAdvertisementFiles().then(function(files){
        res.status(200).send(files);
    })
    .catch(function(e){
        console.log('error getting files',e)
        res.status(201).send(e);
    });

});


router.get('/getFiles/:advertisement_account_id', function (req, res, next) {
    console.log('getFiles');
    const advertisement_account_id = req.params.advertisement_account_id;

    blob.getFilesByAdvertisementAccount(advertisement_account_id).then(function(files){
        res.status(200).send(files);
    })
    .catch(function(e){
        console.log('error getting files')
        res.status(201).send(e);
    });

});


module.exports = router;