var express = require('express');
var router = express.Router();
const apis = require('../helpers/apis');

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

module.exports = router;