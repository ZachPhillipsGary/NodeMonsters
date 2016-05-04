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
var worldMap = new game.map(25);
var users = {}; //hash table with user info
//create MYSQL user pool
var connection = mysql.createPool({
    host: 'localhost',
    user: 'game',
    password: 'login101',
    database: 'shootMonster'
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
    var authenticated = false;
    console.log('username+password',username, password);
    connection.getConnection(function(err, connection) {
        if (err) console.log(err)
        console.log('connected!');
        // perform query (or if busy place on query que)
        connection.query('SELECT * FROM auth JOIN status ON auth.uniqueID=status.id;', function(err, rows) {
            if (err) console.log(err)
                //Iterate through rows to find match (safer way than dynamically creating query string)
            console.log(rows[i]);
            for (var i = 0; i < rows.length; i++) {
                if ((username === String(rows[i].email)) && (password === String(rows[i].password))) {
                    console.log('match')
                    //username is in database and password matches
                    authenticated = true;
                    //pass back user data  and result object
                    accepted(res,rows[i]);
                    
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
/*
authenticate --middleware for creating users
@param{object} res --expressjs responce object
@param{string} username 
@param{string} password
@param{function} onSuccess --callback for successful user creation
@param{function} onFailure --callback for failure
*/
function createUser(res,email,password,onSuccess) {
    var alreadyExists =  false;
    var lastID = 0;
    connection.getConnection(function(err, connection) {
                connection.query('SELECT * FROM auth JOIN status ON auth.uniqueID=status.ID;', function(err, rows) {
                    if (err) console.log(err)
                    for (var i = 0; i < rows.length; i++) {
                        if(email == String(rows[i].email)) {
                            alreadyExists = true;
                        }
                        console.log('uniqueID',rows[i].uniqueID)
                        lastID++;  
                    }
                     });
            });

    //we can create the user
    if (alreadyExists === false) {
        var health =  99;
        var damage = Math.floor((Math.random() * 100) + 40);
        var sql = 'INSERT INTO auth (email,password) VALUES (' + connection.escape(email) + ',' + connection.escape(password) + ');';
        var sql2 = 'INSERT INTO status (health,damage) VALUES ('+ connection.escape(health) + ',' + connection.escape(damage) +');' ; 

connection.query(sql, function(err, results) {
    if (err) { console.log (err) }
});
connection.query(sql2, function(err, results) {
        if (err) { console.log (err) }
        if(results) { console (results) }
    onSuccess(res);
});

    } else {
       res.render(__dirname + '/public/frontPage/game.twig', {
        message: "<div align='center' class='alert alert-success'>Error: User already exists!</div>"
      });
    }
}
//include express middleware for GET & POST request parsing so we can access that data as a JS object 
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))

function movePlayer(player, direction) {
    if (users.hasOwnProperty(player)) {
        if (users[player].online = true) {
            var moved  = false; //did we move the player?
           // worldMap.movePlayer(users[player].x, users[player].y, direction, users[player]);
            //because of closures, we must change player x and y from here instead via the map movePlayer method
            switch (direction) {
                case "up":
                console.log('test',worldMap.getTile(users[player].x,users[player].y-1).kind )
              if ( worldMap.getTile(users[player].x,users[player].y-1).kind === 0 ) {
                        users[player].direction = "up";
                        users[player].y--;
                    }
                    break;
                case "down":
                if ( worldMap.getTile(users[player].x,users[player].y+1).kind === 0 ) {
                        users[player].direction = "down";
                        users[player].y++;
                     }
                    break;
                case "left":
                if ( worldMap.getTile(users[player].x-1,users[player].y).kind === 0 ) {
                        users[player].direction = "left";
                        users[player].x--;
                      }  
                    break;
                case "right":
              if ( worldMap.getTile(users[player].x+1,users[player].y).kind === 0 ) {
                        users[player].direction = "right";
                        users[player].x++;
                     }
                    break;
            }
                            console.log(users[player]);

                            console.log(moved);
            if (moved) {
            //send out sucessful move notifcation
            io.emit('player movement', {
                "direction":String(users[player].direction),
                "username":String(player),
                "x":  users[player].x,
                "y":  users[player].y,
                "color": users[player].color
            });
            }
        }
    }
}
//user class
function User(username, health, damage, uID) {
    this.direction = "up"; // store direction
    function getRandomColor() {
     var letters = '0123456789ABCDEF'.split('');
     var color = '#';
     for (var i = 0; i < 6; i++ ) {
         color += letters[Math.floor(Math.random() * 16)];
     }
     return color;
   }
    this.uId = uID;  
    this.color = getRandomColor();
    this.username = username || "";
    this.online = true;
    this.health = health || 0;
    this.damage = damage || 0;  //Quy added damage property 
    this.x = Math.floor(Math.random() * 24) + 1;
    this.y = Math.floor(Math.random() * 24) + 1;
    //place user on map
}
//define app paths
app.get('/', function(req, res) {
      res.render(__dirname + '/public/frontPage/game.twig', {
        message: ""
      });
});
//define signup endpoint
//define app paths
app.post('/signup', function(req, res) {
      if (req.body.hasOwnProperty('email') && req.body.hasOwnProperty('password')) {
        var sucessful = function(res) {
             res.render(__dirname + '/public/frontPage/game.twig', {
        message: "User created!"
      });
        };
        createUser(res,req.body.email,req.body.password,sucessful);
      }
});
//serve login page if user tries to access game view without logging in
app.get('/game', function(req, res) {
      res.render(__dirname + '/public/frontPage/game.twig', {
        message: ""
      });
});
app.post('/game', function(req, res) {
    console.log(req.body);
    //authenticate request
    if (req.body.hasOwnProperty('email') && req.body.hasOwnProperty('password')) {
        var displayGame = function(res,playerData) {
            // accepted
            if (users.hasOwnProperty(String(req.body.email))) {
                users[req.body.email].online = true; //set user to be online
            } else {
                //initalize new user
                users[req.body.email] = new User(playerData.email,playerData.health,playerData.damage,playerData.uniqueID);
            }
            //render game view
            res.render(__dirname + '/public/map.twig', {
                username: String(req.body.email),
                health: String(playerData.health),
                damage: String(playerData.damage)
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
            if (users[String(socket['username'])].online === true) {
                //update the map and send it out to the client
                io.emit('map event', {
                    "map": worldMap.printMap(),
                    "onlineUsers": users
                });
                io.emit('message', "" + String(socket['username']) + " has joined the game.");
            }
        }
    });
   socket.on('attack', function(msg) {
    var playersHurt = []; //store players affected
    //validate input
        if (msg.hasOwnProperty('username')) {
            if (users[String(msg.username)].online == true) {
                attack(msg.username);
            }
        }
    });

    socket.on('message', function(msg) {
        console.log(msg);
        if (msg.hasOwnProperty('username')) {
            console.log(users[String(msg.username)].online);
            if (users[String(msg.username)].online == true) {
                io.emit('message', String(msg.username) + ":" + msg.msg);
            }
        }
    });
    //listen for player action
    socket.on('action', function(msg) {
        console.log(msg)
        if (users[String(msg.username)].online == true) {
            if (msg.hasOwnProperty('type') && msg.hasOwnProperty('direction')) {
                switch (msg.type) {
                    case "move":
                        movePlayer(String(msg.username), msg.direction);
                          io.emit('player movement', {
                "username":users[String(msg.username)].username,
                "x":  users[String(msg.username)].x,
                "y":  users[String(msg.username)].y,
                "color": users[String(msg.username)].color,
                "direction": users[String(msg.username)].direction
                                });
                        break;
                    default:
                        socket.emit('map event', {
                            "map": worldMap.printMap()
                        }); //update canvas
                }
            }


        }
    });


    //set user active value in hashtable to offline
    socket.on('disconnect', function(socket) {
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


/// EXUCUTE FUNCTIONS 

// This function determines the target pixel when a user fires and update health of the target player, if any 
function attack(shooterUsername){
    console.log(users[shooterUsername].direction)
    var targetX = 0;
    var targetY = 0; 
    switch (users[shooterUsername].direction){
        case "up":
            targetX = users[shooterUsername].x;
            targetY = users[shooterUsername].y - 1;
            break; 

        case "down":
            targetX = users[shooterUsername].x;
            targetY = users[shooterUsername].y + 1;
            break; 

        case "left":
            targetX = users[shooterUsername].x - 1;
            targetY = users[shooterUsername].y;
            break; 

        case "right":
            targetX = users[shooterUsername].x + 1;
            targetY = users[shooterUsername].y;
            break; 
    } 

//For now, assuming 2 players can occupy 1 pixel at once
//When set strict rule that only 1 player can occpy a pixel at a time -- remove add break in if statement 
    for(var user in users){
        if (users[user].x == targetX && users[user].y == targetY){
                users[user].health -= users[shooterUsername].damage; 
                if(users[user].health < 0) {
                io.emit('died', {
                "username":String(user),
                "health": users[user].health
            });
                } else {
            users[user].online = false; //kick player
            io.emit('player attacked', {
                "username":String(shooterUsername),
                "attacked":String(user),
                "health": users[user].health
            });
                }
             
        }


    }

}
