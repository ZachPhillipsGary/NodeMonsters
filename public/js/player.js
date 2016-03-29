function player(properties){
  //define public vars
  this.monsters = [];
  this.x = 0;
  this.y = 0;
  this.health = 0;
  this.maxhealth = 0;
  this.color = "#FFFFFF";
  //define constructor
  if (properties.hasOwnProperty("x")) {
    this.x = properties.x;
  }
  if (properties.hasOwnProperty("y")) {
    this.y = properties.y;
  }
  if (properties.hasOwnProperty("color")) {
    this.color = properties.color;
  }
  if (properties.hasOwnProperty("health")) {
    this.health = properties.health;
  }
  if (properties.hasOwnProperty("maxhealth")) {
    this.maxhealth = properties.maxhealth;
  }
  if (properties.hasOwnProperty("monsters")) {
    if (Array.isArray(properties.monsters)) {

    }
  }
  if (properties.hasOwnProperty('canvas')) {
    this.canvas = properties.canvas;
  }
  if (properties.hasOwnProperty('parentSocketConnection')) {
  this.parentSocketConnection =  properties.parentSocketConnection;
  }
  this.draw();
  function movePlayer(e){
  switch (e.keyCode) {
    case 38:
      //up
      e.target.socketConnection.socket.emit('action', {
          "type":"move",
          "direction":"up"
      });
      break;
      case 38:
        //up
        break;
    default:
  }
  //send action to server



  }
  /*
Keyboard event listener
  */
document.addEventListener("keydown",movePlayer);
}
player.prototype.draw = function () {
  var canvas = document.getElementById(String(this.canvas));
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = String(this.color);
  ctx.fillRect(this.x*10,this.y*10,10,10);
}
