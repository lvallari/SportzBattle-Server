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
            linkurl: req.body.linkurl
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});

/*
router.post('/verifyEmail', function (req, res, next) {
    
    var code = common.generateVerificationCode();

    var mailObj = {
        to: req.body.email,
        from: "info@lifebalancetool.com",
        templateId: "d-74df876039834d0e936f7eff7d575b93",
        dynamic_template_data: {
            email: req.body.email,
            verification_code: code
        }
    }

    sendMail(mailObj);
    res.status(200).send({});

    verify.storeEmailcode(req.body.user_id, code);
    
});
*/

/*
router.post('/thankYouForPurchase', function (req, res, next) {
    
    var mailObj = {
        to: req.body.email,
        from: "info@lifebalancetool.com",
        templateId: "d-211ca56ca95e46e88e03599f1cda9653",
        dynamic_template_data: {
            email: req.body.email,
            tier: req.body.tier,
            billing_period: req.body.billing_period,
            number_clients: req.body.number_clients
        }
    }

    sendMail(mailObj);
    res.status(200).send({});

});
*/

/*
router.post('/yourPlanHasChanged', function (req, res, next) {
    
    var mailObj = {
        to: req.body.email,
        from: "info@lifebalancetool.com",
        templateId: "d-f996397603a941819402c7cab4f8bfb1",
        dynamic_template_data: {
            email: req.body.email,
            verification_code: code
        }
    }

    sendMail(mailObj);
    res.status(200).send({});

});
*/
/*
router.post('/newSignup', function (req, res, next) {  
    //console.log('sendgrid/passwordReset', req.body);

    var mailObj = {
        to: [
            {
                email:"info@lifebalancetool.com"
            },
            {
                email:"amoctezuma81@gmail.com"
            },
            {
                email:"sarah.anne808@gmail.com"
            }
        ],
        from: "info@lifebalancetool.com",
        templateId: "d-dbe66383303946369be4f99aaf95564f",
        dynamic_template_data: {
            name: req.body.name,
            email: req.body.email,
            companyname: req.body.companyname
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});
*/
/*
router.post('/newSubscription', function (req, res, next) {
    //console.log('sendgrid/passwordReset', req.body);

    var mailObj = {
        to: [
            {
                email:"info@lifebalancetool.com"
            },
            {
                email:"amoctezuma81@gmail.com"
            },
            {
                email:"sarah.anne808@gmail.com"
            }
        ],
        from: "info@lifebalancetool.com",
        templateId: "d-9f16ff0b97ee450badbe08228963fb80",
        dynamic_template_data: {
            name: req.body.name,
            email: req.body.email,
            companyname: req.body.companyname
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});
*/
/*
router.post('/newMessage', function (req, res, next) {
    //console.log('sendgrid/passwordReset', req.body);

    var mailObj = {
        to: [
            {
                email:"info@lifebalancetool.com"
            },
            {
                email:"amoctezuma81@gmail.com"
            },
            {
                email:"sarah.anne808@gmail.com"
            }
        ],
        from: "info@lifebalancetool.com",
        templateId: "d-87e120befbf148cdad5ebce2e5e2f66d",
        dynamic_template_data: {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message
        }
    }

    sendMail(mailObj);
    res.status(200).send({});
    
});
*/
/*
router.post('/verifyEmail', function (req, res, next) {
    
    var code = common.generateVerificationCode();

    var mailObj = {
        to: req.body.email,
        from: "info@lifebalancetool.com",
        templateId: "d-c28b40f0367140a8bb101ef2daa5bb62",
        dynamic_template_data: {
            email: req.body.email,
            verification_code: code
        }
    }

    sendMail(mailObj);
    res.status(200).send({});

    //store code in database
    //verify.storeEmailcode(req.body.user_id, code);
    
});
*/

function sendMail(request){

    //console.log('sendMail', request);
    //sendgrid.API(request, function (error, response) {
    sgMail.send(request).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        //console.log(error.response.body)
        console.log(error.response.body.errors[0].message)
    })
    
}

module.exports = router;
