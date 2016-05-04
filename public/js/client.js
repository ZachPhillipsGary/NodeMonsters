function client(appIDs, chatField, username) {
    var mapState; //store last map update for player movement redraws
    $("#" + String(chatField)).prepend("<form action=''><input id='m' autocomplete='off' /><button>Send</button></form>");
    var c = document.getElementById(appIDs);
    //intialize client as private variable for class
    var socket = io();
    //login user
    socket.emit('login', {
        "username": username,
    });
    /*
    renderMap() -- populates the canvas with floor and wall tiles
    @param{object} data from map event messages
    */
    function renderMap(mapObject) {
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height); //clear map
        for (var i = 0; i < mapObject.map.length; i++) {
            for (var l = 0; l < mapObject.map[i].length; l++) {
                if( mapObject.map[i][l].color === "#ffffff") {
                    var image = document.getElementById("grass");
                    ctx.drawImage(image, i * 25, l * 25, 25, 25);
                } else {
                    ctx.fillStyle = mapObject.map[i][l].color;
                    ctx.fillRect(i * 25, l * 25, 25, 25);
                }
                  }
        }

    }
   /*
    renderPlayers() -- populates the canvas with floor and wall tiles
    @param{object} data from map event messages
    */
    function renderPlayers(mapObject) {

        var ctx = c.getContext("2d");
        for (player in mapState["onlineUsers"]) {
                   var ctx = c.getContext("2d");
                   console.log(String(mapState["onlineUsers"][player].direction))
                   var xCord = mapState[ "onlineUsers"][player].x * 25;
                   var yCord = mapState[ "onlineUsers"][player].y * 25;
                  var image = document.getElementById("up");
                   ctx.drawImage(image, xCord, yCord, 25, 25);
                console.log(img)
                ctx.drawImage(img, mapState[ "onlineUsers"][player].x * 25, mapState[ "onlineUsers"][player].y * 25, 25, 25);

                    //ctx.fillStyle = mapState[ "onlineUsers"][player].color;
                    //ctx.fillRect(mapState[ "onlineUsers"][player].x * 25, mapState[ "onlineUsers"][player].y * 25, 25, 25);
        }
    }
    //get map updates
    socket.on('map event', function(msg) {
        //render map
        mapState = msg; //cache locally map state
        console.log(msg);
        renderMap(msg);
        renderPlayers(msg);
    });
    //get player updates
    socket.on('player movement', function(msg) {
        console.log(msg);
      mapState["onlineUsers"][String(msg.username)] = msg;
      console.log('player movement',msg);
      if (mapState.hasOwnProperty('map')) {
              renderMap(mapState);
              renderPlayers(mapState);
      } 

    });
    socket.on('died', function(msg) {
    if(msg['username'] === username) 
          document.write("You died! Please re-register to be reborn! Thank you!")

    });
    socket.on('player attacked', function(msg) {
      console.log(msg)
    if(msg.attacked === username) 
          $( "#health" ).text(msg.health);
    });
    //get player updates
    socket.on('map event', function(msg) {
        //render map
        mapState = msg; //cache locally map state
        renderMap(msg);
    });
    //process chat messages
    $('form').submit(function() {
        console.log('message')
        socket.emit('message', {
            "msg": $('#m').val(),
            "username": username
        });
        $('#m').val('');
        return false;
    });
    socket.on('message', function(msg) {
        $("#" + String(chatField)).append($('<li>').text(msg));
    });
    //create player
    /* movePlayer() -- Keyboard event listener */
    function movePlayer(e) {
        switch (e.keyCode) {

            case 38:
                console.log("move");
                //up
                socket.emit('action', {
                    "type": "move",
                    "direction": "up",
                    "username": String(username)
                });
                break;
            case 40:
                //down
                socket.emit('action', {
                    "type": "move",
                    "direction": "down",
                    "username": String(username)

                });
                break;
                //left
            case 37:
                socket.emit('action', {
                    "type": "move",
                    "direction": "left",
                    "username": String(username)

                });
                break;
            case 39:
                socket.emit('action', {
                    "type": "move",
                    "direction": "right",
                    "username": String(username)

                });
                break;
            case 32:
            console.log('attack!');
                socket.emit('attack', {
                    "username": String(username)
                });
                break;
            default:
        }
    }
    document.addEventListener("keydown", movePlayer);

}