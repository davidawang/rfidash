var redis = require("redis"),
    client = redis.createClient(6379, '127.0.0.1', {return_buffers: false}),
    _ = require('underscore'),
    util = require('util'),
    eyes = require('eyes');

var handleCallback = function(callback, args) {
	if (callback) {
		callback(args);
	}
}

Item = function(){
	var min_num_items = 204;
	var sections = ["mens", "womens", "boy", "girl", "children", "teen"];
	var brands = ["Adidas", "Armani", "Gap", "Macys", "Guess", "Diesel", "Dockers", "JCrew", "Kenneth Cole", "Lacoste", "Ralpha Lauren Polo", "Nike", "Tommy Hilfiger"];
	var clothings = ["pants", "jeans", "sweather", "peacoat", "shoes", "socks", "undergarments", "vest", "turtleneck", "trench coat", "gloves"];
	var size = ["M", "S", "XS", "L", "XL", "XXL"];
	var cur_num_items = 0;
	
	// reload the largest id number so our indexes don't get overwritten
	client.get("epc:largest", function(err, res) {
		if (err) throw err;
		cur_num_items = res;
	})

	this.generateNewItemJson = function(should_increment){
		var should_increment = should_increment || true;
		if (should_increment) cur_num_items++;

		return {
			'epc': cur_num_items,
			'section': sections[_.random(0, sections.length - 1)],
			'name': brands[_.random(0, brands.length - 1)]+ " " + clothings[_.random(0, clothings.length - 1)],
			'size': size[_.random(0, size.length - 1)],
			'quantity': _.random(20, 100),
			'price': _.random(100, 10000)/100
		}
	}

	this.resetLargestItemId = function() {
		cur_num_items = 0;
	}
}

// Generates a random # "min_num_items", clears redis database before doing so
Item.prototype.init = function(callback){
	var _this = this;
	
	client.flushall(function(err, res){
		_this.resetLargestItemId();
		var json = _this.generateRandomItems(10, callback);
	});
}


// returns
//		total number of items
//		json of all items
Item.prototype.getItems = function(min, max, callback){

	var args = ['items', max||Infinity, min||-Infinity, 'WITHSCORES'];
	client.zrevrangebyscore(args, function(err, replies) {
		if (err) throw err;
		var result = [];
		var multi = client.multi();

		for (var i = 0; i < replies.length; i = i + 2) {
			var epc = replies[i];
			var quantity = replies[i + 1];
			(function(epc, quantity){
				multi.hgetall(epc, function(err, res) {
					if (err) throw err;
					result.push(_.extend(res, {'quantity': quantity, 'epc': parseInt(epc.replace(/[^0-9.]/g, ""))}));
				});
			})(epc, quantity);
		}
		multi.exec(function(err, replies){
			handleCallback(callback, result);
		})
	});
}

Item.prototype.getValidIds = function(callback){
	var args = ['items', Infinity, -Infinity];
	client.zrevrangebyscore(args, function(err, replies) {
		if (err) throw err;
		var result = [];

		for (var i = 0; i < replies.length; i++) {
			result.push(replies[i]);
		}

		handleCallback(callback, result);
	});
}

// Generates N random new items
Item.prototype.generateRandomItems = function(number_of_new_items, callback){
	var _this = this;
	var result_arr = [];
	var multi = client.multi();
	var multi2 = client.multi();

	for(var i = 0; i < number_of_new_items; i++) {
		(function(){
			var newitem = _this.generateNewItemJson();
			multi.hmset("epc:" + newitem.epc, "section", newitem.section, "name", newitem.name, "size", newitem.size, function(err, res){
				if (err) throw err;

				var args = ['items', newitem.quantity , "epc:" + newitem.epc]; // add a random quantity of items
				multi2.zadd(args, function (err, res) {
					if (err) throw err;
					result_arr.push(newitem);
				});
				
			});
		})();
	}

	multi.exec(function(err, res){
		if (err) throw err;
		multi2.exec(function(err, replies){
			if (err) throw err;
			client.incrby('epc:largest', replies.length, function(err, res) {
			});
			
			handleCallback(callback, result_arr);
		});
	});
}

// test for cli
Item.prototype.changeInventory2 = function(){
	var epcs = ['epc:127', 'epc:136'];
	var deltas = [-3, -2];
	this.changeInventory(epcs, deltas);
}

// Accepts an array of epcs and their corresponding deltas in the delta array.
Item.prototype.changeInventory = function(epcs, deltas, callback) {
	var multi = client.multi();
	var multi2 = client.multi();

	var jsonResponse = [];

	for(var i = 0; i < epcs.length; i++) {
		(function(i){
			multi.zincrby('items', deltas[i], epcs[i], function(err, res) {
				var newQuantity = parseFloat(res);

				if (newQuantity < 0) { // if inventory < 0, set it back to 0
					var args = ['items', 0, epcs[i]];
					multi2.zadd(args, function (err, res) {
						if (err) throw err;
						newQuantity = 0;
					});
				}
				multi2.hgetall(epcs[i], function(err, res) {
					if (err) throw err;
					jsonResponse.push(_.extend(res, {'quantity': newQuantity, 'epc': parseInt(epcs[i].replace(/[^0-9.]/g, ""))}));
				});
			});
		})(i);
	}

	multi.exec(function(err, res) {
		multi2.exec(function(err, res) {
			handleCallback(callback, jsonResponse);
		});
	});


}

Item.prototype.getTotalNumber = function(callback) {
	client.zcard('items', function(err, res) {
		if (err) throw err;
		handleCallback(callback, res);
	});
}

Item.prototype.end = function(){
	client.quit();
};

// TODO:
// deleteItem(itemId) // deletes the item with the item id

module.exports = Item;