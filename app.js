/*
pocketmonsters server
*/
//begin  library includes
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
//begin app includes
var game = require("game");
var worldMap =  new game.map(70);
var users = [];
//define app paths
app.get('/', function(req, res){
  res.sendfile( __dirname + '/public/game.html');
});
//on connection, authenticate user
io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('map event', { "map": worldMap.printMap() });

  socket.on('disconnect', function(socket){
    console.log('user disconnected',socket);
  });
});

http.listen(3000, function(){
  console.log('listening on :3000');
});
//serve static content from folder
app.use(express.static(path.join(__dirname, 'public')));
