var conn = require('../db');
const tables = require('./tables');
const common = require('./common');

async function getGamesForLobby(){
    try {
    var games = await getGames();

    var levels = await tables.getAll('skill_levels');

    for (let g of games){
        try { 
            //get expiration readable time
            g.expires_in = common.getReadableTimeUntilExpiration(g.expiration_timestamp);
            //get host level
            await getLevelForUser(g, levels); 
        }
        catch (e) { console.log('e',e)}
    }

    //filter out expired games
    var gamesx = games.filter(x => {return x.expires_in != 'Expired'});

    return gamesx;
    }
    catch(e){
        console.log('error:', e);
        return {error: e};
    }
}

async function getGames(){
return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        h2h_games.*,
        users.username AS username, users.image AS user_image, users.user_id   
        FROM h2h_games 
        LEFT JOIN users ON h2h_games.created_by_user_id=users.user_id
        `;
        conn.query(sql, (err, result) => {

            if (err) {
                console.log('error',err);
                return reject(err);
            }
            
            resolve(result);
        });
    });
}

async function getLevelForUser(item, levels){
    var games = await tables.getByField('games','user_id', item.user_id);
    var all_time_points = 0;
    games.forEach(x => {
        all_time_points += x.score;
    });

    item.all_time_points = all_time_points;
    common.assignLevel(item,levels);

}



async function createGameH2H(data){
    try {
    
        var object = data;
        //set expiration date
        object.created_timestamp = Date.now();
        object.expiration_timestamp = common.getTomorrowMidnightTimestamp();

        console.log("Timestamp:", common.getTomorrowMidnightTimestamp());
        console.log("Readable:", new Date(common.getTomorrowMidnightTimestamp()).toString());

        await tables.addItem('h2h_games', object);
        return { msg: 'success'}

    }
    catch(e){
        console.log('error:', e);
        return {error: e};
    }
}


module.exports = {
    getGamesForLobby:getGamesForLobby,
    createGameH2H:createGameH2H
}