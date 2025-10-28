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
        users.username AS username, users.image AS user_image, users.user_id, users.points AS points_host     
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

        //get question ids for game
        var question_ids = await getGameH2HQuestions(data.sport);
        object.question_ids = JSON.stringify(question_ids);


        await tables.addItem('h2h_games', object);
        return { msg: 'success'}

    }
    catch(e){
        console.log('error:', e);
        return {error: e};
    }
}

async function getGameH2HQuestions(sport){
    try {
    var league;
    if (sport == 'basketball') league = 'NBA';
    else if (sport == 'football') league = 'NFL';
    else if (sport == 'baseball') league = 'MLB';

    var question_idsx = await getQuestionsIdsByLeague(league);
    //console.log('------',question_idsx);
    
    //easy questions
    var easy_questions = question_idsx.filter(x => {return x.difficulty <= 1});
    var medium_questions = question_idsx.filter(x => {return x.difficulty >=2 || x.difficulty <=3});
    var hard_questions = question_idsx.filter(x => {return x.difficulty >=3 || x.difficulty <=4});
    
    //var question_ids = question_idsx.map(x => { return x.question_id; });
    var easy_ids = getRandomIds(3,easy_questions.map(x => { return x.question_id; }));
    var medium_ids = getRandomIds(3,medium_questions.map(x => { return x.question_id; }));
    var hard_ids = getRandomIds(3,hard_questions.map(x => { return x.question_id; }));

    return [easy_ids[0], medium_ids[0], hard_ids[0]];
    }
    catch (e){
        console.log('error', e);
        return [];
    }
}

async function getGame20QuestQuestions(){
    try {

    //console.log('------',question_idsx);
    
    //easy questions
    var very_easy_questions = await getQuestionsByDifficulty([0,1]);
    var easy_questions = await getQuestionsByDifficulty([2,3]);
    var medium_questions = await getQuestionsByDifficulty([4,6]);
    var hard_questions = await getQuestionsByDifficulty([7,7]);
    
    //console.log('very easy questions', very_easy_questions.slice(0,3));
    //var question_ids = question_idsx.map(x => { return x.question_id; });
    var very_easy_ids = getRandomIds(3, very_easy_questions.map(x => { return x.question_id; }));
    var easy_ids = getRandomIds(4, easy_questions.map(x => { return x.question_id; }));
    var medium_ids = getRandomIds(8, medium_questions.map(x => { return x.question_id; }));
    var hard_ids = getRandomIds(5, hard_questions.map(x => { return x.question_id; }));

    return very_easy_ids.concat(easy_ids).concat(medium_ids).concat(hard_ids);
    }
    catch (e){
        console.log('error', e);
        return [];
    }
}

async function getQuestionsIdsByLeague(league){
return new Promise(function (resolve, reject) {
        
        var sql = `SELECT 
        questions2.question_id, questions2.difficulty 
        FROM questions2 
        WHERE questions2.category='${league}'`;
        
        conn.query(sql, (err, result) => {

            if (err) {
                console.log('error',err);
                return reject(err);
            }
            
            resolve(result);
        });
    });
}

async function getQuestionsByDifficulty(range){
return new Promise(function (resolve, reject) {
        
        var sql = `SELECT 
        questions2.question_id, questions2.difficulty, questions2.question 
        FROM questions2 
        WHERE questions2.difficulty >= '${range[0]}' AND questions2.difficulty <= '${range[1]}'`;
        
        conn.query(sql, (err, result) => {

            if (err) {
                console.log('error',err);
                return reject(err);
            }

            var resultx = common.shuffle(result);
            
            resolve(resultx);
        });
    });
}

async function getQuestionsFromArray(ids){
return new Promise(function (resolve, reject) {
        var sql = `SELECT * FROM questions2 WHERE question_id IN (${ids.join(',')})`;
        
        conn.query(sql, (err, result) => {

            if (err) {
                console.log('error',err);
                return reject(err);
            }
            
            resolve(result);
        });
    });
}

function getRandomIds(number,array) {

    const indexes = new Set();

  while (indexes.size < number && indexes.size < array.length) {
    const randomIndex = Math.floor(Math.random() * array.length);
    indexes.add(array[randomIndex]);
  }

  return Array.from(indexes);
}

async function awardPoints(user_id, points){
    var userx = await tables.getByField('users','user_id', user_id);
    var user = userx[0];

    var points = user.points += points;

    var object = {
        user_id: user.user_id,
        points: points
    }

    await tables.updateItem('users','user_id', object);

    return {msg: 'points updated'}
}

async function getH2HGame(game_id){
    var gamex = await tables.getByField('h2h_games','h2h_game_id', game_id);
    var game = gamex[0];

    //get questions
    try{
        var question_ids = JSON.parse(game.question_ids);
        var questions_raw = await getQuestionsFromArray(question_ids);

        questions_raw = questions_raw.sort((a,b) => {
            return a.difficulty - b.difficulty;
        });

        var questions = [];
        for (let x of questions_raw){
            var question = {
                    message: 'question',
                    question_id: x.question_id,
                    question: common.crypt('sb',x.question),
                    answers: common.shuffle([x.correct_answer, x.option1, x.option2, x.option3]),
                    key: common.crypt('sb',x.correct_answer),
                    category: x.category,
                    difficulty: x.difficulty
                }
            question.hiding_order = common.crypt('sb',JSON.stringify(common.getHidingOrder(question.answers, x.correct_answer)));

            //get user who submitted question
            if (questionx.submitted_by_user_id) {
                var userx = await tables.getByField('users', 'user_id', questionx.submitted_by_user_id);
                var user = userx[0];

                question.submitted_by_user = user.username;
            }

            questions.push(question);      
        };

        
        game.questions = questions;

        game.expires_in = common.getReadableTimeUntilExpiration(game.expiration_timestamp);

        return {
            game: game
        }

    }
    catch(e){
        return { error: "the game has no questions"}
    }

}

async function getUsersByGameH2h(h2h_game_id){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        books.*,
        users.image AS user_image, users.name AS user_name 
        FROM books 
        LEFT JOIN users ON users.user_id=books.user_id 
        WHERE books.h2h_game_id=${h2h_game_id}`;
        
        conn.query(sql, (err, result) => {

            if (err) {
                console.log('error',err);
                return reject(err);
            }

            //attach user levels??
            
            resolve(result);
        });
    });
}

async function getGamesH2HByUser(user_id){

    var games = await getGamesH2HByUser_Aux(user_id);

    for (let item of games){
        var books = await tables.getByField('books','h2h_game_id', item.h2h_game_id);
        //sort by points
        books = books.sort((a,b) => { return a.score - b.score;});
        
        books.forEach((x, i) => { 
        x.position = i+1;
        });

      //find user position
      var record = books.find(x => { return x.user_id == user_id });
      if (record) {
        item.user_position = record.position;
        item.number_of_players = books.length;
      }
 
    }

    return games;

}

async function getGamesH2HByUser_Aux(user_id){
return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        books.*,
        h2h_games.*,
        users.username, users.image, users.points AS points_host     
        FROM books 
        LEFT JOIN h2h_games ON h2h_games.h2h_game_id=books.h2h_game_id 
        LEFT JOIN users ON users.user_id=h2h_games.created_by_user_id
        WHERE books.user_id=${user_id}`;
        conn.query(sql, (err, result) => {

            if (err) {
                console.log('error',err);
                return reject(err);
            }
            
            resolve(result);
        });
    });
}

async function quest20PlayerStatus(user_id, status){
    //get current game
    var gamex = await tables.getByField('quest20_games','status','active');
    var game = gamex[0];

    var playersx = await tables.getByField('quest20_players','quest20_game_id', game.quest20_game_id);
    var player = playersx.find(x => { return x.user_id == user_id});

    var player_object = {
        quest20_player_id: player.quest20_player_id,
        status: status
    }

    await tables.updateItem('quest20_players', 'quest20_player_id', player_object);
    console.log('********** Updated user', user_id, ' to ', status);
}

async function getQuest20Players(status){
    //get current game
    var gamex = await tables.getByField('quest20_games','status',status);
    console.log(gamex, status);
    var game = gamex[0];

    if (game){
    var players = await tables.getByField('quest20_players','quest20_game_id', game.quest20_game_id);
    return players;
    }
    else return [];
}

module.exports = {
    getGamesForLobby:getGamesForLobby,
    createGameH2H:createGameH2H,
    awardPoints: awardPoints,
    getH2HGame:getH2HGame,
    getUsersByGameH2h:getUsersByGameH2h,
    getGamesH2HByUser:getGamesH2HByUser,
    getGame20QuestQuestions:getGame20QuestQuestions,
    quest20PlayerStatus:quest20PlayerStatus,
    getQuest20Players:getQuest20Players
}