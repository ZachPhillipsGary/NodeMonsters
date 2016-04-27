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
                    ctx.fillStyle = mapObject.map[i][l].color;
                    ctx.fillRect(i * 10, l * 10, 10, 10);
                  }
        }

    }
    //get map updates
    socket.on('map event', function(msg) {
        //render map
        mapState = msg; //cache locally map state
        renderMap(msg);
    });
    //get player updates
    socket.on('player movement', function(msg) {
      mapState[String(msg.username)] = msg;
      console.log('player movement',msg);
      if (mapState.hasOwnProperty('map')) {
              renderMap(mapState);
      } 
                    var ctx = c.getContext("2d");
                    ctx.fillStyle = msg.color;
                    ctx.fillRect(msg.x * 10, msg.y * 10, 10, 10);
    });
    socket.on('died', function(msg) {
    if(msg.player === username) 
          alert("You died! Please re-register to be reborn! Thank you!")

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
                socket.emit('attack', {
                    "username": String(username)
                });
                break;
            default:
        }
    }
    document.addEventListener("keydown", movePlayer);

}