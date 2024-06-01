var conn = require('../db');
var tables = require('./tables');
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

module.exports = {
    createUser:createUser,
    getActivityByUser:getActivityByUser 
}