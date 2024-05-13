var express = require('express');
var router = express.Router();
const uploader = require('../helpers/uploader');
const conn = require('../db');


router.post('/batchUpload', function (req, res, next) {

    var filename = req.body.filename;
    uploader.batchUpload(filename).then(function(number_of_records){
        res.status(200).send({message: number_of_records + ' records added succesfully'});
    });
    
});

function releaseConnection(con) {
    con.getConnection(function (err, connection) {
        connection.release();
    });
}


module.exports = router;