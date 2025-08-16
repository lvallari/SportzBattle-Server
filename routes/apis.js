var express = require('express');
var router = express.Router();
const apis = require('../helpers/apis');
const engine_20quest = require('../helpers/engine_20quest');

router.get('/getGamesForLobby', function(req, res, next) {
  apis.getGamesForLobby().then(function(data){
      res.status(200).send(data);
  });
});

router.post('/createGameH2H', function(req, res, next) {
  var data = req.body;
    apis.createGameH2H(data).then(function(data){
      res.status(200).send(data);
  });
});

router.post('/awardPoints', function(req, res, next) {
  var user_id = req.body.user_id;
  var points = req.body.points;
    apis.awardPoints(user_id, points).then(function(data){
      res.status(200).send(data);
  });
});

router.get('/getH2HGame', function(req, res, next) {
  var game_id = req.query.id;
  apis.getH2HGame(game_id).then(function(data){
      res.status(200).send(data);
  });
});

router.get('/getUsersByGameH2h', function(req, res, next) {
  var h2h_game_id = req.query.id;
  apis.getUsersByGameH2h(h2h_game_id).then(function(data){
      res.status(200).send(data);
  });
});


router.get('/getGamesH2HByUser', function(req, res, next) {
  var user_id = req.query.id;
  apis.getGamesH2HByUser(user_id).then(function(data){
      res.status(200).send(data);
  });
});

router.post('/quest20PlayerStatus', function(req, res, next) {
  var user_id = req.body.user_id;
  var status = req.body.status;
  apis.quest20PlayerStatus(user_id, status).then(function(data){
      res.status(200).send(data);
  });
});

router.post('/createGameQuest20', function(req, res, next) {
  engine_20quest.createGameQuest20().then(function(data){
      res.status(200).send({id:data});
  });
});



router.get('/getQuest20Players', function(req, res, next) {
  var status = req.query.status;
  apis.getQuest20Players(status).then(function(data){
      res.status(200).send(data);
  });
});

module.exports = router;