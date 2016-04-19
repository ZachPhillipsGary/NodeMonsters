/*
pocketmonsters server
*/
//begin library includes

//include HTTP param middleware
var bodyParser = require('body-parser');
//add twig templating system
var twig = require("twig");
//load routing middleware
var express = require('express');
//initalize expressjs
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
//load mysql library
var mysql = require('mysql');
//begin app includes
var game = require("game");
var worldMap = new game.map(50);
var users = {}; //hash table with user info
//create MYSQL user pool
var connection = mysql.createPool({
    host: 'localhost',
    user: 'game',
    password: 'login101',
    database: 'pokemon'
});
//verify connection
connection.getConnection(function(err, connection) {
    if (err) {
        console.log(err);
    }
    // connected! (unless `err` is set)
});
/*
authenticate --authentication middleware
@param{object} res --expressjs responce object
@param{string} username 
@param{string} password
@param{function} accepted --callback for authenicated users 

*/
function authenticate(res, username, password, accepted) {
    console.log(res);
    var authenticated = false;
    console.log(username, password);
    connection.getConnection(function(err, connection) {
        if (err) console.log(err)
        console.log('connected!');
        // perform query (or if busy place on query que)
        connection.query('SELECT * FROM authentication', function(err, rows) {
            if (err) console.log(err)
                //Iterate through rows to find match (safer way than dynamically creating query string)
            for (var i = 0; i < rows.length; i++) {
                console.log(username, rows[i].email);
                if (username == String(rows[i].email)) {
                    console.log('match')
                //    if (bcrypt.compareSync(password, rows[i].password)) 
                        //username is in database and password matches
                        authenticated = true;
                        accepted(res);
                    //}
                }
            }
            if (authenticated == false) {
                //access denied, send back HTTP error
                res.sendStatus(401); 
            };
            // And done with the connection.
            connection.release(); // end connection and place account back in pool

        });
    });
}
//include express middleware for GET & POST request parsing so we can access that data as a JS object 
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))

//user class
function User(username) {
    this.username = username;
    this.online = true;
    // Set user to offline if it doesn't get messed with frequently
    setTimeout(function (parent) { 
        parent.online = false;
    }, 9999,this);
}
//define app paths
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/frontPage/game.html');
});
app.post('/game', function(req, res) {
    console.log(req.body);
    //authenticate request
    if (req.body.hasOwnProperty('email') && req.body.hasOwnProperty('password')) {
        var displayGame = function(res) {
            // accepted
            if (users.hasOwnProperty(String(req.body.email))) {
                users[req.body.email].online = true; //set user to be online
            } else {
                //initalize new user
                users[req.body.email] = new User(req.body.email);
            }
            //render game view
              res.render(__dirname + '/public/map.twig', {
                 username : String(req.body.email)
                });
       
        };
        authenticate(res, req.body.email, req.body.password, displayGame);
    }
});
//on connection
io.on('connection', function(socket) {
    socket.on('login', function(socket) {
        if (socket.hasOwnProperty('username')) {
                    //verify that user has logged in before connecting them
            if (username[String(socket.username)].online === true) {
            //update the map and send it out to the client
              io.emit('map event', {
                "map": worldMap.printMap(),
                "onlineUsers": users
             });
             }
        }
    });
  io.on('message', function(msg){
    if (msg.hasOwnProperty('username')) {
        if (users[string(msg.username)].online) {
             io.emit('message', msg.msg);
        }
    }
   
  });
    //listen for player action
    io.on('action', function(msg) {
        if (msg.hasOwnProperty('type')) {
            switch (msg.type) {
                case "move":
                    //move player
                    break;
                default:
                    socket.emit('map event', {
                        "map": worldMap.printMap()
                    }); //update canvas
            }
        }
    });
    //set user active value in hashtable to offline
    io.on('disconnect', function(socket) {
        if (socket.hasOwnProperty('username')) {
            users[socket.username].online = false;
               io.emit('map event', {
                "map": worldMap.printMap(),
                "onlineUsers": users
             });
        } else {

        }
        console.log('user disconnected', socket);
    });
});

http.listen(3000, function() {
    console.log('listening on :3000');
});
//serve static content from folder
app.use(express.static(path.join(__dirname, 'public')));