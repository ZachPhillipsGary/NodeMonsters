function client(appIDs,chatField,username) {
  $("#"+String(chatField)).prepend("<form action=''><input id='m' autocomplete='off' /><button>Send</button></form>");
  var c = document.getElementById(appIDs);
  //intialize client as private variable for class
  var socket = io();
  //authorize user
  socket.emit('login', {
    "username":username,
  });
  socket.on('map event', function(msg){
    //render map
    console.log(msg);
  for (var i = 0; i < msg.map.length; i++) {
    for (var l = 0; l < msg.map[i].length; l++) {
      var ctx = c.getContext("2d");
      ctx.fillStyle = msg.map[i][l];
      ctx.fillRect(i*10,l*10,10,10);
    }
  }
  });
  //process chat messages
   $('form').submit(function(){
    socket.emit('message', {"msg":$('#m').val(),"username":username});
    $('#m').val('');
    return false;
  });
   socket.on('message', function(msg){
    $("#"+String(chatField)).append($('<li>').text(msg));
  });
  //create player
  /* movePlayer() -- Keyboard event listener */
  function movePlayer(e) {
  switch (e.keyCode) {

     case 38:
      //up
      socket.emit('action', {
          "type":"move",
          "direction":"up"
      });
            break;
       case 40:
      //down
      socket.emit('action', {
          "type":"move",
          "direction":"down"
      });
           break;
      //left
      case 37:
      socket.emit('action', {
          "type":"move",
          "direction":"left"
      });
           break;
      case 39:
      socket.emit('action', {
          "type":"move",
          "direction":"right"
      });
           break;
  default:
  }
  }
  document.addEventListener("keydown",movePlayer);

}
