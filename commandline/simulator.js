var Item = require('./item.js'),
	eyes = require('eyes'),
    _ = require('underscore'),
    io = require('socket.io').listen(8080);

var inventory = io
	.of('/items')
	.on('connection', function(socket) {
		// new clients will get a copy of all the current items
		item.getItems(0, +Infinity, function(res){
			socket.emit('all', JSON.stringify(res));
		});
	});


var Simulator = function(socketio_instance){
	var item_instance;
	var io = socketio_instance;

	this.io = function() {
		return io;
	}

	this.item = function() {
		if (item_instance) {
			console.log('hi');
			return item_instance
		} else {
			item_instance = new Item();
			return item_instance;
		}
	}
	this.item();
}

Simulator.prototype.start = function() {
	this.item().init(function(res){
		inventory.emit("init", JSON.stringify(res));
	});
}

Simulator.prototype.simulate = function() {
	var _this = this;

	// function will only run according to the given probability.
	var ProcessProbability(prob, fn) {
		if (_.random(0, 1) <= prob) fn();
	}

	ProcessProbability(.9, _this.simulate_inventorychange());
	ProcessProbability(0.25, _this.simulate_newitems(_.random(10, 20)));
}


Simulator.prototype.simulate_inventorychange = function() {
	var allowed_deltas = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	var deltas = [];
	var itemids = [];
	var _this = this;

	this.item().getValidIds(function(id_array) {

		for(var i = 0; i < 10; i++) {
			itemids.push(id_array[_.random(0, id_array.length - 1)]);
			deltas.push(allowed_deltas[_.random(0, allowed_deltas.length - 1)]);
		}
		_this.item().changeInventory(itemids, deltas, function(res) {
			inventory.emit("change", JSON.stringify(res));
		});
	});
}

Simulator.prototype.simulate_newitems = function(number_of_items) {
	var boom = this.item();
	setTimeout(function() {
		boom.generateRandomItems(number_of_items, function(res) {
			inventory.emit("new", JSON.stringify(res));
		});
	}, 100);
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
	this.item().end();
}

module.exports = Simulator;