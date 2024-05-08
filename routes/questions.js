var express = require('express');
var router = express.Router();
const conn = require('../db');


router.post('/get', function (req, res, next) {

    var filters = req.body.filters;
    var page = req.body.page;
    var offset = page * 100;

    console.log('filters categories ', filters.categories);
    console.log('filters difficulties ', filters.difficulties);
    var sql;


    if (filters.categories.all && filters.difficulties.all && !filters.query) sql = `SELECT * FROM questions LIMIT 100 OFFSET ${offset};`;
    else {
        var filters_added = 0;
        sql = `SELECT * FROM questions WHERE `;
        if (!filters.difficulties.all) {
            //filter out by difficulties
            
            if (filters.difficulties.one) { sql += 'difficulty=1'; filters_added++ }
            if (filters.difficulties.two) { sql += (filters_added > 0 ? ' OR difficulty=2' : 'difficulty=2'); filters_added++; }
            if (filters.difficulties.three) { sql += (filters_added > 0 ? ' OR difficulty=3' : 'difficulty=3'); filters_added++; }
            if (filters.difficulties.four) { sql += (filters_added > 0 ? ' OR difficulty=4' : 'difficulty=4'); filters_added++;}
            if (filters.difficulties.five) { sql += (filters_added > 0 ? ' OR difficulty=5' : 'difficulty=5'); filters_added++; }
            if (filters.difficulties.six) { sql += (filters_added > 0 ? ' OR difficulty=6' : 'difficulty=6'); filters_added++; }
            if (filters.difficulties.seven) { sql += (filters_added > 0 ? ' OR difficulty=7' : 'difficulty=7'); filters_added++;}
            if (filters.difficulties.zero) { sql += (filters_added > 0 ? ' OR difficulty=0' : 'difficulty=0'); filters_added++;}
            
        }
        if (!filters.categories.all) {
            //filter out by categories
            if (filters.categories.nfl) { sql += (filters_added > 0 ? ` AND category='NFL'` : `category='NFL'`); filters_added++; }
            if (filters.categories.nba) { sql += (filters_added > 0 ? ` AND category='NBA'` : `category='NBA'`); filters_added++; }
            if (filters.categories.mlb) { sql += (filters_added > 0 ? ` AND category='MLB'` : `category='MLB'`); }
        }

        if (filters.query) {
            sql += (filters_added > 0 ? ` AND question LIKE '%${filters.query.toLowerCase()}%'` : `question LIKE '%${filters.query.toLowerCase()}%'`);
        }

        sql += ` LIMIT 100 OFFSET ${offset};`;
        console.log('sql', sql);
    }

    conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
        releaseConnection(conn);
    });
});

function releaseConnection(con) {
    con.getConnection(function (err, connection) {
        connection.release();
    });
}


module.exports = router;