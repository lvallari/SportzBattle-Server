var conn = require('../db');

function update(table, id, field, val){
    var data = {};
    data[field] = val;
    var sql = `UPDATE ${table} SET ? WHERE id = ${id}`;
    conn.query(sql, data, (err, result) => {
        if(err) throw err;
    });
}

function updateItem(table, id_field, data){
    var sql = `UPDATE ${table} SET ? WHERE ${id_field} = ${data[id_field]}`;
    conn.query(sql, data, (err, result) => {
        if(err) throw err;
    });
}

function addItem(table, obj) {
    return new Promise(function (resolve, reject) {
        var data = obj;
        var sql = `INSERT INTO ${table} SET ?`;
        conn.query(sql, data, (err, result) => {
            if (err) return reject(err);
            resolve(result.insertId);
        });
    });
}

function getByField(table, field, val) {
    return new Promise(function (resolve, reject) {
        var sql = `SELECT * FROM ${table} WHERE ` + field + `='` + val + `'`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getAll(table) {
    return new Promise(function (resolve, reject) {
        var sql = `SELECT * FROM ${table}`;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function get(table, field, order, limit) {
    return new Promise(function (resolve, reject) {
        var sql = `SELECT * FROM ${table} ORDER BY ` + field + ' ' + order + ' LIMIT ' + limit;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function deleteItem(table, id) {
    return new Promise(function (resolve, reject) {
        var sql = `DELETE FROM ${table} WHERE id= ` + id;
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
    /*
    return new Promise(function (resolve, reject) {
    if (field) {
      sqlstr = `DELETE FROM ${req.params.table} WHERE ` + field + `=` + val;
      if (field2) sqlstr += ` AND ` + field2 + `='` + val2 + `'`;
      //console.log(sqlstr);
    }
  
    conn.query(sqlstr, function (err, rows) {
      if (err) throw err;
  
      res.status(200).send(rows);
      releaseConnection(conn);
    });
    */
  }


module.exports = {
    update:update,
    updateItem: updateItem,
    addItem: addItem,
    getAll:getAll,
    getByField:getByField,
    get:get,
    deleteItem:deleteItem
};