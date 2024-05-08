const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


function planHasBeenUpdated(data){
    var mailObj = {
        to: data.email,
        from: "info@lifebalancetool.com",
        templateId: "d-f996397603a941819402c7cab4f8bfb1",
        dynamic_template_data: data
    }

    sendMail(mailObj);
}

function planHasBeenCancelled(data){
    var mailObj = {
        to: data.email,
        from: "info@lifebalancetool.com",
        templateId: "d-9d04ea6073504666be0cc88c4d9c932a",
        dynamic_template_data: data
    }

    sendMail(mailObj);
}


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

module.exports = {
    planHasBeenUpdated: planHasBeenUpdated,
    planHasBeenCancelled:planHasBeenCancelled
};
