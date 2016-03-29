

function Player(newX,newY, newInventory, newName, newUUID){
	//Private var 
	var UUID = newUUID; 
	this.win = 0; 
	this.x = newX;
	this.y = newY; 
	this.inventory = newInventory; 
	this.name = newName; 

}



Player.prototype.deleteMonster = function(targetName){
	for(var i = this.inventory.length - 1; i >= 0; i--) {
    	if(this.inventory[i].name === targetName) {
       		this.inventory.splice(i, 1);
    	}
	}
}


Player.prototype.addMonster = function(newMonster){
	this.inventory.push(newMonster);
}

Player.prototype.addWin = function(){
	this.win += 1; 

}

Player.prototoype.changeCord = function(newX, newY){
	this.x = newX;
	this.y = newY; 

}

Player.prototype.changeName= function(newName){
	this.name = newName; 
}

