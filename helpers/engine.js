var common = require('./common');
var questions = require('./questions');
var tables = require('./tables');

const { sendMessage } = require('../socket');

function start(){
    console.log('engine started');
    var ctr = 0;
    var cycle = 10;
    setInterval(() => {
        if (ctr < cycle) getQuestion();
        if (ctr == (cycle)) sendMessage({message: 'leaderboard'});
        if (ctr == (cycle + 1)) sendMessage({message: 'qrcode'});
        if (ctr == (cycle + 2)) {
            sendMessage({message: 'advertisement'});
            ctr = -1;
        };
        ctr += 1
    },19000);
}

/* 
select a.* from random_data a, (select max(id)*rand() randid  from random_data) b
     where a.id >= b.randid limit 1;
*/



async function getQuestion(){
    var res = await questions.getRandom();
    var questionx = res[0];
   //console.log('questionx', questionx);
    var question = {
        message: 'question',
        question_id: questionx.question_id,
        question: common.crypt('sb',questionx.question),
        answers: common.shuffle([questionx.correct_answer, questionx.option1, questionx.option2, questionx.option3]),
        key: common.crypt('sb',questionx.correct_answer),
        value_points: 100,//questionx.value_points,
        category: questionx.category
    }

    question.hiding_order = common.crypt('sb',JSON.stringify(common.getHidingOrder(question.answers, questionx.correct_answer)));
    //console.log('sent ', question);
    sendMessage(question);

    //send % of users that answered correctly
    /*
    setTimeout(() => {
        tables.getByField('user_activity','question_id', question.question_id).then(data => {
            var time_threshold = Date.now() - 2000;
            var questions = data.filter(x => {return x.question_timestamp > time_threshold});

            var got_right_ctr = 0;
            questions.forEach(x => {
                if (x.got_it_right == 1) got_right_ctr++;
            })

            var object = {
                message: 'results',
                percent: (100 * got_right_ctr / questions.length).toFixed(2),
                got_right: got_right_ctr,
                total_players: questions.length
            }

            sendMessage(object);
        })
    },11500);
    */
}

module.exports = {
    start:start
};
