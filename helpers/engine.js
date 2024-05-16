var common = require('./common');
var questions = require('./questions');
const { sendMessage } = require('../socket');

function start(){
    console.log('engine started');
    var ctr = 0;
    var cycle = 5;
    setInterval(() => {
        if (ctr < cycle) getQuestion();
        if (ctr == (cycle)) sendMessage({message: 'leaderboard'});
        if (ctr == (cycle + 1)) {
            sendMessage({message: 'advertisement'});
            ctr = -1;
        };
        ctr += 1
    },14000);
}

/* 
select a.* from random_data a, (select max(id)*rand() randid  from random_data) b
     where a.id >= b.randid limit 1;
*/

async function getQuestion(){
    var res = await questions.getRandom();
    var questionx = res[0];
    
    var question = {
        question_id: questionx.question_id,
        question: common.crypt('sb',questionx.question),
        answers: common.shuffle([questionx.correct_answer, questionx.option1, questionx.option2, questionx.option3]),
        key: common.crypt('sb',questionx.correct_answer),
        value_points: questionx.value_points
    }

    console.log('sent ', question);
    sendMessage(question);
}

module.exports = {
    start:start
};
