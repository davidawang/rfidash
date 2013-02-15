var Item = require('./item.js'),
	eyes = require('eyes'),
    _ = require('underscore'),
    item = new Item();
    io = require('socket.io').listen(80);

var inventory = io
	.of('/items')
	.on('connection', function(socket) {
		// new clients will get a copy of all the current items
		item.getItems(0, +Infinity, function(res){
			socket.emit('all', JSON.stringify(res));
		});
	});



// function will only run according to the given probability.
var ProcessProbability = function(prob, fn) {
	if (_.random(0, 1) <= prob) {
		fn;
	}
}



var Simulator = function(){

}

Simulator.prototype.start = function() {
	item.init(function(res){
		inventory.emit("init", JSON.stringify(res));
	});
}

Simulator.prototype.simulate = function() {
	var _this = this;

	ProcessProbability(.1, _this.simulate_inventorychange());
	// ProcessProbability(.1, _this.simulate_newitems(_.random(10, 20)));
}


Simulator.prototype.simulate_inventorychange = function() {
	var allowed_deltas = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	var deltas = [];
	var itemids = [];
	var _this = this;

	item.getValidIds(function(id_array) {

		for(var i = 0; i < 10; i++) {
			itemids.push(id_array[_.random(0, id_array.length - 1)]);
			deltas.push(allowed_deltas[_.random(0, allowed_deltas.length - 1)]);
		}
		item.changeInventory(itemids, deltas, function(res) {
			inventory.emit("change", JSON.stringify(res));
		});
	});
}

Simulator.prototype.simulate_newitems = function(number_of_items) {
	item.generateRandomItems(number_of_items, function(res) {
		inventory.emit("new", JSON.stringify(res));
	});
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


Simulator.prototype.end = function(){
	item.end();
}

module.exports = Simulator;