var express = require('express');
var router = express.Router();
const users = require('../helpers/users');
const stats = require('../helpers/stats');
const tables = require('../helpers/tables');
const reports = require('../helpers/reports');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createUser', function(req, res, next) {
  var user_data = req.body;
  users.createUser(user_data).then(function(data){
      res.status(200).send(data);
  });
});


router.post('/validateCode', function(req, res, next) {
  var user_response = req.body.code;
  var user_phone = req.body.phone;

  tables.getByField('login_sessions','phone', user_phone).then(function(data){
    //console.log('data', data);
    var session_object = data.filter(x => {return x.phone == user_phone && x.code == user_response})[0];

    //if code is correct
    if (session_object){      
      //TODO delete session_object
      tables.deleteItem('login_sessions', session_object.id).then(function(){
        //console.log('login sessions item deleted')
      })
      
      res.status(200).send({status:'verified'});
    }

    else res.status(200).send({status:'failed'});

  })

  //res.send('respond with a resource');
});

router.get('/activity', function(req, res, next) {
  var user_id = req.query.id;

  users.getActivityByUser(user_id).then(data => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(201).send(err);
  });
  //res.send('respond with a resource');
});

router.get('/stats', function(req, res, next) {
  var user_id = req.query.id;

  stats.getUserStats(user_id).then(data => {
    res.status(200).send(data);
  }).catch((err) => {
    console.log('err',err);
    res.status(201).send(err);
  });
  //res.send('respond with a resource');
});

router.get('/gamesByVenue', function(req, res, next) {
  var venue_id = req.query.id;

  users.getGamesByVenue(venue_id).then(data => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(201).send(err);
  });
  //res.send('respond with a resource');
});

router.get('/usersByVenue', function(req, res, next) {
  var venue_id = req.query.id;

  users.getUsersByVenue(venue_id).then(data => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(201).send(err);
  });
  //res.send('respond with a resource');
});

router.get('/downloadUsersByVenue', function(req, res, next) {
  var venue_id = req.query.id;
  reports.getCSVOfUsersEmails(venue_id).then(data => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(201).send(err);
  });
});



module.exports = router;
