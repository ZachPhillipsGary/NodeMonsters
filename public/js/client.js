function client(appIDs,username,password) {
  var c = document.getElementById(appIDs);
  //intialize client
  var socket = io();
  //authorize user
  socket.emit('login', {
    "username":username,
    "password":password
  });
  socket.on('map event', function(msg){
    //render map
    console.log(msg);
  for (var i = 0; i < msg.map.length; i++) {
    for (var l = 0; l < msg.map[i].length; l++) {
      var ctx = c.getContext("2d");
      ctx.fillStyle = msg.map[i][l];
      ctx.fillRect(i*10,l*10,i*10,l*10);
    }
  }
  });

}
var init = new client("myCanvas","abc","234");
