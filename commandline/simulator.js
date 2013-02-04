

var Simulator = function(){
	this.item = function() {
		if (newItem) return newItem;
		else {
			newItem = new Item();
			return newItem;
		}
	}
}

Simulator.prototype.simulate = function() {
	var randomNum = _.random(0, 100);

	// each time it should randomly simulate between 
}

// every few minutes does one of few things:
// 		1) changes inventory of n random items
// 			20% of all inventory
// 		2) adds new items (this should be less frequent)
// 			20% chance
// 		3) delete items (when inventory is gone)
// 			N/A not implemented yet
// 		4) on new socket.io connection, do a return a json of all items
//			call new Item.init()




module.exports = Simulator;