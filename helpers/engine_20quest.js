var common = require('./common');
var apis = require('./apis');
var questions = require('./questions');
var tables = require('./tables');

const { sendMessageQuestGame } = require('../socket');

async function start(){

    sendMessageQuestGame({message: 'starting-soon'});
    
    await delay(30000);


    //3 games
    for (let game_number of [1,2,3]){
        //console.log('playing game #', game_number);
       var game_question_ids = await apis.getGame20QuestQuestions(); 
    //console.log('20 quest engine started');
    
        var ctr = 0;
        for (let question_id of game_question_ids){
            //console.log('game_question_ids[question_id]',game_question_ids[ctr],question_id);
            await getQuestion(game_question_ids[ctr], ctr);
            await delay(19000); // waits 19 seconds
            ctr += 1;
        }
        sendMessageQuestGame({message: 'game-over'});
        await delay(5000);
        if (game_number < 3) {
            sendMessageQuestGame({ message: 'intermission' });
            await delay(180000); // waits 3 minutes
        }
    }
    
}

/* 
select a.* from random_data a, (select max(id)*rand() randid  from random_data) b
     where a.id >= b.randid limit 1;
*/
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function getQuestion(question_id, index){
    var res = await tables.getByField('questions2','question_id', question_id);
    var questionx = res[0];
    //console.log('questionx', questionx);
    var question = {
        message: 'question',
        question_id: questionx.question_id,
        question: common.crypt('sb',questionx.question),
        answers: common.shuffle([questionx.correct_answer, questionx.option1, questionx.option2, questionx.option3]),
        key: common.crypt('sb',questionx.correct_answer),
        value_points: 100,//questionx.value_points,
        category: questionx.category,
        duration: getQuestionDuration(index),
        difficulty: questionx.difficulty
    }

    question.hiding_order = common.crypt('sb',JSON.stringify(common.getHidingOrder(question.answers, questionx.correct_answer)));
    //console.log('sent ', question);
    sendMessageQuestGame(question);
}

function getQuestionDuration(index){
    if (index <= 4) return 10;
    else if (index >= 5 && index <= 15) return 8;
    else return 7;
}

module.exports = {
    start:start
};
