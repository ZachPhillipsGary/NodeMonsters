/*
pocketmonsters server
*/
//begin  library includes
var express = require('express');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
//initalize expressjs
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bcrypt = require('bcrypt');
//connect to database;
var mysql = require('mysql');
//begin app includes
var game = require("game");
var worldMap =  new game.map(50);
var users = [];
passport.use(new LocalStrategy(
  function(username, password, done) {
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'game',
      password : 'login101',
      database : 'pokemon'
    });
    //connect to mySQL db
    connection.connect();
    const mySQLQuery = "SELECT * FROM authentication WHERE email = "+username;
    connection.query(mySQLQuery,function(err,rows,fields) {
      if(err) throw err;
      if (rows.length === 0) {
          return done(null, false, { message: 'Incorrect username.' });
      }
      //check password
      if (rows[0].password == password) {
        return done(null, user);
      }
        return done(null, false, { message: 'Incorrect password.' });
    })
    });
  }
));
//define app paths
app.get('/', function(req, res){
  res.sendfile( __dirname + '/public/game.html');
});
app.post('/game', function(req, res){
  //authenticate request
  passport.authenticate('local', { successRedirect: '/game',
                                   failureRedirect: '/',
                                   failureFlash: true });
  res.sendfile( __dirname + '/public/game.html');
});
//on connection, authenticate user
io.on('connection', function(socket){
  console.log(socket);
  socket.on('login', function(socket){


  });
  console.log('a user connected');
  socket.emit('map event', { "map": worldMap.printMap() });
  //listen for player action
  socket.on('action', function(msg){
  //determine type of action
  //determine if action is valid
  //perform action
  socket.emit('map event', { "map": worldMap.printMap() });
    });
  socket.on('disconnect', function(socket){
    console.log('user disconnected',socket);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});
//serve static content from folder
app.use(express.static(path.join(__dirname, 'public')));
