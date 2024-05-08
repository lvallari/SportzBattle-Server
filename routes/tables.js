var express = require('express');
var router = express.Router();
const conn = require('../db');


// POST add an object 
router.post('/:table/add', function(req, res, next){
  var data = req.body;
  //console.log('insert object ', data);
  var sql = `INSERT INTO ${req.params.table} SET ?`;
  conn.query(sql, data, (err, result) => {
      if(err) throw err;
      res.status(200).send({id: result.insertId});
      releaseConnection(conn);
  });
});

//GET 
router.get('/:table', function (req, res, next) {

  let field = req.query.field;
  let val = req.query.val;
  let field2 = req.query.field2;
  let val2 = req.query.val2;
  let field3 = req.query.field3;
  let val3 = req.query.val3;
  let columns = req.query.columns;
  let table2 = req.query.table2;
  let order = req.query.order;
  let limit = req.query.limit;
  let c1 = req.query.c1;
  let c2 = req.query.c2;

  let sqlstr = '';

  if (columns) sqlstr = 'SELECT ' + columns + ' ';
  else sqlstr = 'SELECT * ';

  sqlstr += `FROM ${req.params.table}`;

  //if inner join
  if (table2) {
    sqlstr += ` RIGHT JOIN ` + table2 + ` ON ${req.params.table}.` + c1 + `=` + table2 + '.' + c2;
  }

  if (order){
    sqlstr +=  ' ORDER BY ' + field + ' ' + order;
  }

  else if (field) {
    sqlstr += ` WHERE ` + field + `='` + val + `'`;
    if (field2) {
      sqlstr += ` AND ` + field2 + `='` + val2 + `'`;
      if (field3) {
        sqlstr += ` AND ` + field3 + `='` + val3 + `'`;
      }
    }
    //console.log(sqlstr);
  }

  if (limit){
    sqlstr +=  ' LIMIT ' + limit;
  }
  //else sqlstr += ` FROM ${req.params.table}`;
  conn.query(sqlstr, function (err, rows) {
    if (err) throw err;

    res.status(200).send(rows);
    releaseConnection(conn);

  });

});

// Update item
router.put('/:table/update/:id', (req, res) => {
  //console.log('go request to update item --- ', req.params.table, req.body);
  var id_field = getID_field(req.params.table);
  var data = req.body;
  var sql = `UPDATE ${req.params.table} SET ? WHERE ${id_field} = ${req.params.id}`;
  conn.query(sql, data, (err, result) => {
      if(err) throw err;
      //console.log(result);
      res.status(200).send({id: req.params.id});
      releaseConnection(conn);
  });
});

// DELETE by filter 
router.delete('/:table/delete', function (req, res, next) {
  let field = req.query.field;
  let val = req.query.val;
  let field2 = req.query.field2;
  let val2 = req.query.val2;

  let sqlstr = '';
  //console.log('go request to get individual item --- ', req.params.table);
  if (field) {
    sqlstr = `DELETE FROM ${req.params.table} WHERE ` + field + `=` + val;
    if (field2) sqlstr += ` AND ` + field2 + `='` + val2 + `'`;
    //console.log(sqlstr);
  }

  console.log('sqlstr',sqlstr);
  conn.query(sqlstr, function (err, rows) {
    if (err) throw err;

    res.status(200).send(rows);
    releaseConnection(conn);
  });
});


// GET verses 
router.post('/getVerses', function (req, res, next) {
  var keywords = req.body.keywords.split(' ').filter((x => { return x.length > 3}));

  var keywords_string = ``;
  keywords.forEach((x,i) => {
    if (i == 0) keywords_string += `keywords LIKE '%${x}%'`;
    else keywords_string += `OR keywords LIKE '%${x}%'`;
  });

  sqlstr = `SELECT * FROM verses WHERE ` + keywords_string;
  console.log('sqlstr',sqlstr);
  
  conn.query(sqlstr, function (err, rows) {
    if (err) throw err;

    res.status(200).send(rows);
    releaseConnection(conn);
  });
});

function getID_field(table){
  if (table == 'questions') return 'question_id';
  else return 'id';
}

function releaseConnection(con){
    con.getConnection( function(err, connection){
      connection.release();
    });
}

/*
function update(platform, id, field, val){
  var data = {};
  data[field] = val;
  var sql = `UPDATE ${platform} SET ? WHERE id = ${id}`;
  conn.query(sql, data, (err, result) => {
      if(err) throw err;
      else console.log('update image success!');
  });
}
*/

module.exports = router;