var express = require('express');
var router = express.Router();
const verify = require('../helpers/verify');


router.post('/email', function (req, res, next) {
    
    verify.confirmEmailCode(req.body.user_id, req.body.code).then(function(result){
        if (result == true) res.status(200).send({ result: true });
        else res.status(200).send({ result: false });
    });

});

router.post('/phone', function (req, res, next) {
    
    verify.confirmPhoneCode(req.body.user_id, req.body.code).then(function(result){
        if (result == true) res.status(200).send({ result: true });
        else res.status(200).send({ result: false });
    });

});

module.exports = router;