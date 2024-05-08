var mysql = require('mysql');
/**
 * Connect to mySQL table
*/

  var pool  = mysql.createPool({
    connectionLimit : 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: "utf8mb4"

  });

  module.exports = pool;