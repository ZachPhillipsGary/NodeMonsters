function Monster(newUUID, newMonsterID, newName, newPowers, newChance, newMaxHealth, newCurrentHealth){
	var UUID = newUUID; 
	var monsterID = newMonsterID;
	var maxHealth = newMaxHealth; 
	var damage = newDamage;
	var chance = newChance;
	this.name = newName;
	this.currentHealth = newCurrentHealth; 
}

Monster.prototype.changeMonsterName= function(newMonsterName){
	this.name = newMonsterName; 
}

Monster.prototype.updateHealth = function(damage){
	this.currentHealth += damage; 
}

Monster.prototype.autoHeal = function(){
	this.currentHealth = this.maxHealth; 
}

