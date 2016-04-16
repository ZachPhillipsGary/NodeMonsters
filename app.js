/*
pocketmonsters server
*/
//begin  library includes
var express = require('express');
//initalize expressjs
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
//include crypto library
var bcrypt = require('bcrypt');
// Generate a salt
var salt = bcrypt.genSaltSync(10);
//load mysql library
var mysql = require('mysql');
//begin app includes
var game = require("game");
var worldMap =  new game.map(50);
var users = {}; //hash table with user info
//create MYSQL pool
var connection = mysql.createPool({
  host     : 'localhost',
  user     : 'game',
  password : 'login101',
  database : 'pokemon'
});
//verify connection
connection.getConnection(function(err, connection) {
  if (err) {
    console.log(err);
  }
  // connected! (unless `err` is set)
});
function authenticate(username,password) {
  connection.getConnection(function(err, connection) {
    // Use the connection
    connection.query( 'SELECT * FROM authentication', function(err, rows) {
      //Iterate through rows (safer way than dynamically creating query string)
      for (var i = 0; i < rows.length; i++) {
       if ( username === rows[i].email ) {
          if (bcrypt.compareSync(password, rows[i].password)) {
              //username is in database and password matches
                connection.release(); // end connection
                return true;
        }
       }
      }
      // And done with the connection.
    connection.release(); // end connection
    //if we reach this point, we couldn't find the user or get a password match
    return false;
    });
  });
}
//user class
function User(username) {
  this.online  = true;
  pool.getConnection(function(err, connection) {
    // Use the connection
    connection.query( 'SELECT * FROM trainer', function(err, rows) {
      //Iterate through rows (safer way than dynamically creating query string)
      for (var i = 0; i < rows.length; i++) {
       if ( username === rows[i].name ) {
            console.log(rows[i])
        }
       }
     
      // And done with the connection.
    connection.release(); // end connection
    //if we reach this point, we couldn't find the user or get a password match
    return false; 
    });
  });
}
//define app paths
app.get('/', function(req, res){
  res.sendfile( __dirname + '/public/frontPage/game.html');
});
app.post('/game', function(req, res){
  //authenticate request
  if (req.hasOwnProperty('username') && req.hasOwnProperty('password')) {
    if (authenticate(req.username,req.password)) {
        if (users.hasOwnProperty(String(req.username))) {
                users[String(req.username)].online = true; // set user to online
        } else {
            users[String(req.username)] = new User(String(req.username)); // add user to active users list
            users[String(req.username)].online = true; // set user to online
        } 
        //render game view
        res.sendfile( __dirname + '/public/game.html');
      } else {
        res.send(401);//return error if login fails
      }
    }
});
//on connection
io.on('connection', function(socket){
  socket.on('login', function(socket){
    //verify that user has logged in
    console.log('a user connected');

  });
  //update the map
  socket.emit('map event', { "map": worldMap.printMap() });
  //listen for player action
  socket.on('action', function(msg){
    if (msg.hasOwnProperty('type')) {
    switch (msg.type) {
      case "move":
        //move player
        break;
      default:
      socket.emit('map event', { "map": worldMap.printMap() }); //update canvas
    }
  }
});
  //set user active value in hashtable to invalid
  socket.on('disconnect', function(socket){
    if (socket.hasOwnProperty('username')) {
          users[socket.username].online = false;
    }
    //update map
    socket.emit('map event', { "map": worldMap.printMap() });
    console.log('user disconnected',socket);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});
//serve static content from folder
app.use(express.static(path.join(__dirname, 'public')));
