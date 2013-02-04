var Item = require('./item.js'),
	eyes = require('eyes'),
    _ = require('underscore');

var Simulator = function(){
	this.item = function() {
		// if (typeof newItem !== 'undefined') return newItem;
		// else {
		// 	var newItem = new Item();
		// 	return newItem;
		// }
		return new Item();
	}
}

Simulator.prototype.simulate = function() {
	var affected_percent = 20;
}


Simulator.prototype.simulate_inventorychange = function() {
	var allowed_deltas = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	var deltas = [];
	var itemids = [];
	var _this = this;

	var id_array = this.item().getValidIds(0, +Infinity, function(id_array) {
	
		for(var i = 0; i < 10; i++) {
			console.log(i);
			itemids.push(id_array[_.random(0, id_array.length - 1)]);
			deltas.push(allowed_deltas[_.random(0, allowed_deltas.length - 1)]);
		}
		console.log(itemids, deltas);
		_this.item().changeInventory(itemids, deltas);
	});
	




	// console.log(itemids);
	// console.log(deltas);
	
}


	// each time it should randomly simulate between 

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