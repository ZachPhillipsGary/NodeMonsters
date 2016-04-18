/*
pocketmonsters server
*/
//begin  library includes
//include HTTP param middleware
var bodyParser = require('body-parser');
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
//define authentication middleware
function authenticate(res, username, password, accepted) {
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
                        // if (bcrypt.compareSync(password, rows[i].password)) {
                        //username is in database and password matches
                        accepted(res);
                    //}
                }
            }
            if (authenticated  == false) {
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
    this.online = true;
    connection.getConnection(function(err, connection) {
        // Use the connection
        connection.query('SELECT * FROM trainer', function(err, rows) {
            //Iterate through rows (safer way than dynamically creating query string)
            for (var i = 0; i < rows.length; i++) {
                if (username === rows[i].name) {

                }
            }

            // And done with the connection.
            connection.release(); // end connection
            //if we reach this point, we couldn't find the user or get a password match
        });
    });
}
//define app paths
app.get('/', function(req, res) {
    console.log(authenticate('zphillips-gary17@wooster.edu', 'b3f7982b5afe9dea79acd3221cc28fa1'));
    res.sendfile(__dirname + '/public/frontPage/game.html');
});
app.post('/game', function(req, res) {
    console.log(req.body);
    //authenticate request
    if (req.body.hasOwnProperty('email') && req.body.hasOwnProperty('password')) {
        var displayGame = function(res) {
            // accepted
            //render game view
            res.sendfile(__dirname + '/public/game.html');
        };
        authenticate(res, req.body.email, req.body.password, displayGame);
    }
});
//on connection
io.on('connection', function(socket) {
    socket.on('login', function(socket) {
        //verify that user has logged in
        console.log('a user connected');

    });
    //update the map
    socket.emit('map event', {
        "map": worldMap.printMap()
    });
    //listen for player action
    socket.on('action', function(msg) {
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
    //set user active value in hashtable to invalid
    socket.on('disconnect', function(socket) {
        if (socket.hasOwnProperty('username')) {
            users[socket.username].online = false;
        }
        //update map
        socket.emit('map event', {
            "map": worldMap.printMap()
        });
        console.log('user disconnected', socket);
    });
});

http.listen(3000, function() {
    console.log('listening on :3000');
});
//serve static content from folder
app.use(express.static(path.join(__dirname, 'public')));