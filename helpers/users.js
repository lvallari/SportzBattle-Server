var conn = require('../db');
var tables = require('./tables');
var common = require('./common');
var sendgrid = require('./sendgrid');

async function createUser(data){
    //return new Promise(function (resolve, reject) {

        var response = await tables.addItem('users', data); //.then(function(response){
        console.log('response', response);
        var user = data;
        user.user_id = response;
        //sendgrid.verifyEmail(data);
            //resolve(response);
        //})
        //.catch(function(e){
        //    return reject(e);
        //});
        return user;
    //});
}

function getActivityByUser(user_id){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        user_activity.*,
        games.*,
        questions.category  
        FROM user_activity 
        RIGHT JOIN questions ON user_activity.question_id=questions.question_id 
        RIGHT JOIN games ON user_activity.game_id=games.game_id
        WHERE user_activity.user_id=${user_id}`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getUserDailyHighScore(user_id){
    var t0 = common.getEpochTimeForTodayAtMidnight();
    return new Promise(function (resolve, reject) {
        var sql = `SELECT score FROM games  
        WHERE user_id=${user_id} AND timestamp > ${t0}
        ORDER BY score DESC LIMIT 1`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getGamesByVenue(venue_id){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        games.*,
        venues.*,
        users.username AS username, users.image AS user_image
        FROM games 
        RIGHT JOIN venues ON venues.venue_id=games.venue_id 
        RIGHT JOIN users ON games.user_id=users.user_id
        WHERE games.venue_id=${venue_id}`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getAllGames(){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        games.*,
        venues.*,
        users.username AS username, users.image AS user_image
        FROM games 
        RIGHT JOIN venues ON venues.venue_id=games.venue_id 
        RIGHT JOIN users ON games.user_id=users.user_id`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getUsersByVenue(venue_id){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        games.*,
        users.username AS username, users.email, users.user_id, users.image 
        FROM games 
        RIGHT JOIN users ON games.user_id=users.user_id
        WHERE games.venue_id=${venue_id}`;
        conn.query(sql, (err, result) => {

            if (err) return reject(err);
            
           //. console.log('players',result);
            var players = [];
            result.forEach(x => {
                var record = players.find(n => {return n.user_id == x.user_id});
                if (!record){
                    var object = {
                        user_id: x.user_id,
                        email: x.email,
                        username: x.username,
                        image: x.image
                    }
                    players.push(object);
                }
            })
            resolve(players);
        });
    });
}

function updateBadgesCounter(user_id, category){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        users.*
        FROM users 
        WHERE users.user_id=${user_id}`;
        conn.query(sql, (err, result) => {

            if (err) return reject(err);
            
            var user = result[0];
            console.log('user', user);

            if (!user.counters_badges) user.counters_badges = '0-0-0';

            var nba_ctr = Number(user.counters_badges.split('-')[0]);
            var nfl_ctr = Number(user.counters_badges.split('-')[1]);
            var mlb_ctr = Number(user.counters_badges.split('-')[2]);

            var award = 'none';
            //var award_icon = '';

            if (category == 'NBA') {
                nba_ctr += 1;
                if (nba_ctr == 5) {
                    award = 'hardwood';
                    nba_ctr = 0;
                    //award_icon = 'https://sportzbattle.blob.core.windows.net/system/basketball.png';
                }
            }
            if (category == 'NFL') {
                nfl_ctr += 1;
                if (nfl_ctr == 5) {
                    award = 'gridion';
                    nfl_ctr = 0;
                    //award_icon = 'https://sportzbattle.blob.core.windows.net/system/football.png';
                }
            }
            if (category == 'MLB') {
                mlb_ctr += 1;
                if (mlb_ctr == 5) {
                    award = 'park';
                    mlb_ctr = 0;
                    //award_icon = 'https://sportzbattle.blob.core.windows.net/system/baseball.png';
                }
            }

            //Note: badge object is create from front end request

            //update user_record
            var user_object = {
                user_id: user_id,
                counters_badges: nba_ctr + '-' + nfl_ctr + '-' + mlb_ctr
            }

            tables.updateItem('users', 'user_id', user_object);

            resolve({ award: award });
        });
    });
}

module.exports = {
    createUser:createUser,
    getActivityByUser:getActivityByUser,
    getGamesByVenue:getGamesByVenue,
    getUsersByVenue:getUsersByVenue,
    getAllGames:getAllGames,
    getUserDailyHighScore:getUserDailyHighScore,
    updateBadgesCounter:updateBadgesCounter
}