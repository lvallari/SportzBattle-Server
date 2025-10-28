var common = require('./common');
var apis = require('./apis');
var questions = require('./questions');
var tables = require('./tables');

const { sendMessageQuestGame } = require('../socket');

async function createGameQuest20(){

    //check there is no other scheduled game
    var games = await tables.getByField('quest20_games', 'status', 'scheduled');
    console.log('******',games.length,' have status "scheduled"', games);
    
    if (games.length > 0) return games[0].quest20_game_id;

    
    var game_question_ids = await apis.getGame20QuestQuestions();
    
    var game_object = {
        question_ids: JSON.stringify(game_question_ids),
        game_time: common.getNextIntervalTime(10).toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
        created_timestamp: Date.now(),
        status: 'scheduled'
    }
   
    var new_game_id= await tables.addItem('quest20_games', game_object);
    console.log('ADDED scheduled game!!!', game_object, new_game_id);
    return new_game_id;
}


async function start(){

    //delete all other active games
    var active_games = await tables.getByField('quest20_games','status','active');
    for (let game of active_games){
        console.log('deleting game...',game.quest20_game_id);
        await tables.deleteItem('quest20_games','quest20_game_id', game.quest20_game_id);
    }


    var gamex = await tables.getByField('quest20_games','status','scheduled');
    console.log('gamex', gamex);
    var game = gamex[0];

    //if there is no scheduled game, exit
    if(!game) return {};

    //set status to 'active'
    var object = {
        quest20_game_id: game.quest20_game_id,
        status: 'active'
    }

    await tables.updateItem('quest20_games', 'quest20_game_id', object);

    sendMessageQuestGame({message: 'starting-soon'});
    
    await delay(10000);


    //3 games
    //for (let game_number of [1]){
        //console.log('playing game #', game_number);
        //var game_question_ids = await apis.getGame20QuestQuestions();
        var game_question_ids = JSON.parse(game.question_ids); 
        console.log('game_question_ids',game_question_ids);
    //console.log('20 quest engine started');
    
        var ctr = 0;
        for (let question_id of game_question_ids){
            //console.log('game_question_ids[question_id]',game_question_ids[ctr],question_id);
            console.log('This is question #', ctr+1);
            await getQuestion(question_id, ctr, game.quest20_game_id);
            await delay(29000); // waits 29 seconds
            ctr += 1;

            //check how many players are still active, if none, end the game
            var players = await tables.getByField('quest20_players','quest20_game_id', game.quest20_game_id);
            var active_players = players.filter(x => { return x.status == 'playing'}).length;

            if (active_players == 0) break;
        }
        sendMessageQuestGame({message: 'game-over'});
        /*
        await delay(5000);
        if (game_number < 3) {
            sendMessageQuestGame({ message: 'intermission' });
            await delay(180000); // waits 3 minutes
        }
        */
    //}

    //end game
    var object = {
        quest20_game_id: game.quest20_game_id,
        status: 'ended'
    }

    await tables.updateItem('quest20_games', 'quest20_game_id', object);
    
}


async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function getQuestion(question_id, index, game_id){
    var res = await tables.getByField('questions2','question_id', question_id);
    var questionx = res[0];
    console.log('correct_answer', questionx.correct_answer);
    var question = {
        message: 'question',
        question_id: questionx.question_id,
        question: common.crypt('sb',questionx.question),
        answers: common.shuffle([questionx.correct_answer, questionx.option1, questionx.option2, questionx.option3]),
        key: common.crypt('sb',questionx.correct_answer),
        value_points: 100,//questionx.value_points,
        category: questionx.category,
        duration: getQuestionDuration(index),
        difficulty: questionx.difficulty,
        game_id: game_id
    }

    question.hiding_order = common.crypt('sb',JSON.stringify(common.getHidingOrder(question.answers, questionx.correct_answer)));
    console.log('sent quest20-question', question);

    //get user who submitted question
    if (questionx.submitted_by_user_id) {
        var userx = await tables.getByField('users', 'user_id', questionx.submitted_by_user_id);
        var user = userx[0];

        question.submitted_by_user = user.username;
    }

    sendMessageQuestGame(question);
}

function getQuestionDuration(index){
    if (index <= 4) return 10;
    else if (index >= 5 && index <= 15) return 8;
    else return 7;
}

module.exports = {
    start:start,
    createGameQuest20:createGameQuest20
};
