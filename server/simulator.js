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

var checkout = io
	.of('/checkout')


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

	this.generate_checkout_items();
}

Simulator.prototype.generate_checkout_items = function() {
	var checkout_items = [];
	var newItem;

	for(var i = 0; i < 10; i++ ) {
		newItem = item.generateNewItemJson(false);
		newItem.quantity = 1;
		checkout_items.push(newItem);
	}
	this.checkout_items = checkout_items;
}

Simulator.prototype.simulate = function() {
	var _this = this;

	ProcessProbability(.1, _this.simulate_inventorychange());
	// ProcessProbability(.1, _this.simulate_newitems(_.random(10, 20)));
	ProcessProbability(1, _this.simulate_checkout());
}

Simulator.prototype.simulate_checkout = function() {
	var result = [];
	// generate a list of 10 different items.
	// Then only pick from those 10 items and push it out (only add, no remove functionality).
	var idx = _.random(0, this.checkout_items.length - 1);
	result.push(this.checkout_items[idx]);
	checkout.emit("new", JSON.stringify(result));
}

Simulator.prototype.simulate_inventorychange = function() {
	var allowed_deltas = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	var deltas = [];
	var itemids = [];
	var _this = this;

	item.getValidIds(function(id_array) {

		for(var i = 0; i < 3; i++) {
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

Simulator.prototype.end = function(){
	item.end();
}

module.exports = Simulator;