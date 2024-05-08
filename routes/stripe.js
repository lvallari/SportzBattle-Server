var express = require('express');
var router = express.Router();
//var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);
var tables = require('../helpers/tables');
var sendgrid = require('../helpers/sendgrid');

router.post('/session', function(req, res, next) {

    var stripe_price_id = '';
    var plan = req.body.plan;
    var billing_period = req.body.billing_period;

    
    
    //LIVE ids
    if (plan == 1){
        if (billing_period == 'monthly') stripe_price_id = 'price_1NnxeMDOPsdeVsvEDE7kKwZF';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1Nnxf3DOPsdeVsvE5khb823g';
    }
    else if (plan == 2){
        if (billing_period == 'monthly') stripe_price_id = 'price_1OTBSmDOPsdeVsvE6ldg1wPE';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1OTBTbDOPsdeVsvEC5hbD1hV';
    }
    else if (plan == 3){
        if (billing_period == 'monthly') stripe_price_id = 'price_1OTBVuDOPsdeVsvEjpcMvRu5';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1OTBW8DOPsdeVsvExjDJ13WR';
    }
    else if (plan == 4){
        //if (billing_period == 'monthly') stripe_price_id = 'price_1NhxvVDOPsdeVsvE4EulLch5';
        //else if (billing_period == 'yearly') stripe_price_id = 'price_1NhxvVDOPsdeVsvEBlLx5beV';
    }
    
    
    
    //TEST ids
    /*
    if (plan == 1){
        if (billing_period == 'monthly') stripe_price_id = 'price_1NanVNDOPsdeVsvEwtk5mOYw';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1NanVNDOPsdeVsvE3w08jSvd';
    }
    else if (plan == 2){
        if (billing_period == 'monthly') stripe_price_id = 'price_1NanYZDOPsdeVsvEKsWgWp7G';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1NanYZDOPsdeVsvEllyhIljT';
    }
    else if (plan == 3){
        if (billing_period == 'monthly') stripe_price_id = 'price_1NanbNDOPsdeVsvE4LDPAvGr';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1NanbNDOPsdeVsvEG1oWxhti';
    }
    else if (plan == 4){
        if (billing_period == 'monthly') stripe_price_id = 'price_1NaneCDOPsdeVsvEMUK4xhXt';
        else if (billing_period == 'yearly') stripe_price_id = 'price_1NaneCDOPsdeVsvEETnRdipR';
    }
    */

    
    stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: stripe_price_id,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: 'https://app.lifebalancetool.com/thank-you-purchase?session_id={CHECKOUT_SESSION_ID}&user_id='+req.body.user_id +'&plan='+req.body.plan+'&billing_period='+req.body.billing_period,
        cancel_url: 'https://app.lifebalancetool.com/pricing',
        //https://app.lifebalancetool.com
        //success_url: 'http://localhost:4200/thank-you?session_id={CHECKOUT_SESSION_ID}&listing_id=' + listing_id,
        //cancel_url: 'http://localhost:4200/listings',
        customer_email: req.body.email,
        allow_promotion_codes: true
      }).then((session) => {
        if (session) res.status(200).send(session);
      });

  });

router.post('/updateUser', function (req, res, next) {
  var session_id = req.body.session_id;
  var user_id = req.body.user_id;
  stripe.checkout.sessions.retrieve(session_id).then((session) => {
    if (session) {
      //console.log('session', session);
      //tables.update('users', user_id, 'subscription_active', true);
      //tables.update('users', user_id, 'stripe_id', session.customer);
      res.status(200).send(session);
    }
  });
});

router.post('/getSubscription', function (req, res, next) {
  var subscription_id = req.body.subscription_id;
  stripe.subscriptions.retrieve(subscription_id).then((subscription) => {
    if (subscription) {
      //console.log('session', session);
      //tables.update('users', user_id, 'subscription_active', true);
      //tables.update('users', user_id, 'stripe_id', session.customer);
      res.status(200).send(subscription);
    }
  })
  .catch(function(){

  })

});

router.post('/createPortal', function (req, res, next) {
  
  stripe.billingPortal.sessions.create({
    customer: req.body.customer,
    return_url: req.body.return_url,
  }).then((session) => {
    res.status(200).send(session);
  });
});

/*
router.post('/attachSubscriptionSchedule', function (req, res, next) {

  console.log('attachSubscriptionSchedule',req.body.subscription);
  
  var subscription_id = req.body.subscription;
  
  //find record
  tables.getByField('subscriptions','stripe_subscription_id', subscription_id).then(function(results){
    var record = results[0];
    console.log('record', record);
    if (record){
      //get subscription schedule
      stripe.subscriptions.retrieve( subscription_id ).then(function(data){
        var stripe_subscription = data;

        //collect subscription schedule id and store in db record
        var subscription_object = {
          id: record.id,
          stripe_subscription_schedule_id: stripe_subscription.schedule
        }

        tables.updateItem('subscriptions', subscription_object);
        
        res.status(201).send({ msg: "Updated subscription to schedule " + stripe_subscription.schedule });

      })
      .catch(function(err){
        console.log(err);
      });
    }
    else res.status(201).send({ msg: "Can not find record with subscription id " + subscription_id });
  })

});
*/

router.post('/webhooks', function (req, res, next) {

  
  
  //this request comes from Stripe Webhooks
  res.status(200).send({});
  var event = req.body;

  //console.log('stripe webhook', event.type);

  if (event.type == 'customer.subscription.created'){
    console.log('Stripe Event: customer.subscription.created');
    //find customer record, set 'active' flag to true
    //console.log('customer.subscription.created');
    //console.log(event.data.object);
    //var customer_id = event.data.object.customer;
    //tables.getByField('user','stripe_customer_id',customer_id).then(function(res){
      //var account = res[0];
      //if (account) tables.update('spotlight_profiles',account.id,'subscription_active',true);
    //});
  }

  if (event.type == 'customer.subscription.updated') {
    console.log('Stripe Event: customer.subscription.updated');

    /*
    var canceled_at = event.data.object.canceled_at;
    var cancel_at = event.data.object.cancel_at;

    if (!cancel_at && !canceled_at) return;
    */

    //subscription
    tables.getByField('users', 'stripe_subscription_id', event.data.object.id).then(function (data) {
      var user = data[0];
      if (user) {

        var product_id = event.data.object.items.data[0].price.product;
        console.log('product_id', product_id);

        var interval = event.data.object.items.data[0].price.recurring.interval;

        if (product_id) {
          stripe.products.retrieve(product_id).then(function (data) {

            var product = data;
            var tier = product.name.replace('Tier ', '');
            var billing_period = interval == 'month' ? 'monthly' : 'yearly';

            var data_object = {
              id: user.id,
              tier: tier,
              billing_period: billing_period,
              subscription_details: product.description,
              email: user.email
            };

            sendgrid.planHasBeenUpdated(data_object);

            //update user in database
            var user_object = {
              id: user.id,
              tier: tier,
              billing_period: billing_period
            };

            console.log('update user in database');
            tables.updateItem('users', user_object);

          });
        }
        else console.log('product not found')

        /*
        var user_object = {
          id: user.id,
          
        }

        tables.updateItem(subscription_object);
        */
      }
    });

  }
  
  if (event.type == 'customer.subscription.deleted'){
    console.log('Stripe Event: customer.subscription.deleted');

    
    //find customer record, set 'active' flag to false
    var customer_id = event.data.object.customer;
    tables.getByField('users','stripe_customer_id',customer_id).then(function(res){
      var user = res[0];
      
      if (user){

        //update status of subscription record
        var user_object = {
          id: user.id,
          tier: -1,
        }

        tables.updateItem('users', user_object);

        var data_object = {
          id: user.id,
          email: user.email,
          name: user.name
        };

        sendgrid.planHasBeenCancelled(data_object);

        //tables.deleteItem('subscriptions',subscription.id);
      }
      //tables.update('users',account.id,'plan','free');
    });
    
  }


  if (event.type == 'subscription_schedule.canceled') {

    /*
    console.log('Stripe Event: subscription_schedule.canceled');
    var customer_id = event.data.object.customer;
    tables.getByField('subscriptions', 'stripe_customer_id', customer_id).then(function (res) {
      var subscription = res[0];

      if (subscription) {

        if (subscription.stripe_subscription_schedule_id){
          //query subscription schedule to get end date
          stripe.subscriptionSchedules.retrieve(subscription.stripe_subscription_schedule_id).then(function(res){
            var subscription_schedule = res;
            if (subscription_schedule){
              
              var subscription_object = {
                id: subscription.id,
                end_date: subscription_schedule.phases.end_date
              }

              tables.updateItem('subscriptions', subscription_object);
            }
          })
          .catch(function(err){
            console.log(err);
          })
        }
        else console.log('subscription record does not have property "stripe_subscription_schedule_id" subscription_id:',subscription.id);
      
      }

      else console.log('could not find subscription for customer ',customer_id);
      
    });
    */
  }
  
});

module.exports = router;