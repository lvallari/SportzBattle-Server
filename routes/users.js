var express = require('express');
var router = express.Router();
var users = require('../helpers/users');
const tables = require('../helpers/tables');

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
  })

  //res.send('respond with a resource');
});

module.exports = router;
