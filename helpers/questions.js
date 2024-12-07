var conn = require('../db');

/*
select a.* from random_data a, (select max(id)*rand() randid  from random_data) b
where a.id >= b.randid limit 1;
*/

function getRandom() {
    return new Promise(function (resolve, reject) {
        var sql = `
        SELECT a.* FROM questions2 a, (select max(question_id)*rand() randid  from questions2) b where a.question_id >= b.randid limit 1`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
/*
function getUserActivityForCurrentQuestion(question_id){
    return new Promise(function (resolve, reject) {
        var sql = `
        SELECT user_activity.*, games.`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
*/

module.exports = {
    getRandom:getRandom
};