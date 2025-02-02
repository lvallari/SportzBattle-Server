var express = require('express');
var router = express.Router();
const common = require('../helpers/common');
const tables = require('../helpers/tables');
const verify = require('../helpers/verify');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/*
router.post('/startTrial', function (req, res, next) {
    console.log('/startTrial', req.body);

    var mailObj = {
        to: req.body.email,
        from: "info@lifebalancetool.com",
        templateId: "d-c28b40f0367140a8bb101ef2daa5bb62",
        dynamic_template_data: {
            name: req.body.name,
            linkurl: req.body.linkurl
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});
*/

router.post('/passwordReset', function (req, res, next) {
    //console.log('sendgrid/passwordReset', req.body);

    var mailObj = {
        to: req.body.email,
        from: "admin@sportzbattle.com",
        templateId: "d-3bd6d39d632940c6a342dac043d46aba",
        dynamic_template_data: {
            name: req.body.name,
            link_url: req.body.link_url
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});

router.post('/requestInfo', function (req, res, next) {
    //console.log('sendgrid/passwordReset', req.body);

    var mailObj = {
        to: req.body.email,
        from: "admin@sportzbattle.com",
        templateId: "d-d230f4ff0dc04f3abcb88d0a7ecd2415",
        dynamic_template_data: {
            username: req.body.username,
            verification_link: req.body.verification_link,
            prize: req.body.prize,
            rank: req.body.rank,
            date: req.body.date
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});

router.post('/tokensAwarded', function (req, res, next) {
    //console.log('sendgrid/passwordReset', req.body);

    var mailObj = {
        to: req.body.email,
        from: "admin@sportzbattle.com",
        templateId: "d-ceaa15217fbd46b0a7510d1951a971ae",
        dynamic_template_data: {
            username: req.body.username,
            number_tokens: req.body.number_tokens,
            message_number_one: req.body.message_number == 1 ? true:false,
            message_number_two: req.body.message_number == 2 ? true:false,
            message_number_three: req.body.message_number == 3 ? true:false
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});

function sendMail(request){

    //console.log('sendMail', request);
    //sendgrid.API(request, function (error, response) {
    sgMail.send(request).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error)
        //console.log(error.response.body.errors[0].message)
    })
    
}

module.exports = router;
