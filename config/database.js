var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'brickhoff',  //your username
  database : 'foodie'         //the name of your db
});

module.exports = connection;