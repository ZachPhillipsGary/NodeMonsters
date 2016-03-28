function client(appIDs,username,password) {
  var c = document.getElementById(appIDs);
  //intialize client as public object variable
  this.socket = io();
  //authorize user
  this.socket.emit('login', {
    "username":username,
    "password":password
  });
  this.socket.on('map event', function(msg){
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
  //create player
  var p = new player({
    "x":1,
    "y":1,
    "color":"#FFC0CB", //make pink by default
    "health":100,
    "maxhealth":100,
    "monsters":{},
    "canvas":appIDs,
    "parentSocketConnection": this.socket,
  });
}
