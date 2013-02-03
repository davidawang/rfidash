var redis = require("redis"),
    client = redis.createClient(6379, '127.0.0.1', {return_buffers: false}),
    pubsub  = redis.createClient(null, null, null),
    _ = require('underscore'),
    util = require('util'),
    socket = require('socket.io'),
    eyes = require('eyes');



Item = function(){
	var min_num_items = 204;
	var sections = ["M", "W", "b", "g", "k"];
	var brands = ["Adidas", "Armani", "Gap", "Macys", "Guess", "Diesel", "Dockers", "JCrew", "Kenneth Cole", "Lacoste", "Ralpha Lauren Polo", "Nike", "Tommy Hilfiger"];
	var clothings = ["pants", "jeans", "sweather", "peacoat", "shoes", "socks", "undergarments", "vest", "turtleneck", "trench coat", "gloves"];
	var type = ["m", "w", "c"];
	var cur_num_items = 0;
	
	// reload the largest id number so our indexes don't get overwritten
	client.get("itemid:largest", function(err, res) {
		if (err) throw err;
		console.log(res);
		cur_num_items = res;
	})

	this.generateNewItemJson = function(){
		cur_num_items++;

		return {
			'itemid': cur_num_items,
			'section': sections[_.random(0, sections.length - 1)],
			'name': brands[_.random(0, brands.length - 1)]+ " " + clothings[_.random(0, clothings.length - 1)],
			'type': type[_.random(0, type.length - 1)],
			'quantity': _.random(20, 100)
		}
	}

	this.resetLargestItemId = function() {
		cur_num_items = 0;
	}
}


// we don't use this for now since it doesn't support multi.
// Item.prototype.addItemWithID = function(itemid) {
// 	var sectionid = this.sections[_.random(0, this.sections.length - 1)];
// 	var name = faker.random.bs_adjective() + " " + faker.random.bs_noun();
// 	var typeid = type[_.random(0, type.length - 1)];
// 	var result = {
// 		'section': sectionid,
// 		'name': name,
// 		'type': typeid,
// 		'quantity': _.random(20, 100)
// 	}


// 	client.hmset(itemid, "section", sectionid, "name", name, "type", typeid, function(err, res1){
// 		if (err) throw err;

// 		var args = [ 'items', result.quantity , itemid]; // add a random quantity of items
// 		client.zadd(args, function (err, res) {
// 			if (err) throw err;

// 		});
		
// 	});
// 	return result;
// }

// Generates a random # "min_num_items", clears redis database before doing so
Item.prototype.init = function(){
	var _this = this;
	
	client.flushall(function(err, res){
		_this.resetLargestItemId();
		return _this.generateRandomItems(204);
	});	
}


// returns
//		total number of items
//		json of all items
Item.prototype.getItems = function(min, max){

	var args = ['items', max||Infinity, min||-Infinity, 'WITHSCORES'];
	client.zrevrangebyscore(args, function(err, replies) {
		if (err) throw err;
		var result = [];
		var multi = client.multi();

		for (var i = 0; i < replies.length; i = i + 2) {
			var itemid = replies[i];
			var quantity = replies[i + 1];
			(function(itemid, quantity){
				multi.hgetall(itemid, function(err, res) {
					if (err) throw err;
					result.push(_.extend(res, {'quantity': quantity, 'itemid': parseInt(itemid.replace(/[^0-9.]/g, ""))}));
				});
			})(itemid, quantity);

		}
		multi.exec(function(err, replies){
			console.log(JSON.stringify(result))
			return JSON.stringify(result);
		})
	});
}

// Generates N random new items
Item.prototype.generateRandomItems = function(number_of_new_items){
	var _this = this;
	var result_arr = [];
	var multi = client.multi();
	var multi2 = client.multi();

	for(var i = 0; i < number_of_new_items; i++) {
		(function(){
			var newitem = _this.generateNewItemJson();
			multi.hmset("itemid:" + newitem.itemid, "section", newitem.section, "name", newitem.name, "type", newitem.type, function(err, res){
				if (err) throw err;

				var args = ['items', newitem.quantity , "itemid:" + newitem.itemid]; // add a random quantity of items
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
			client.incrby('itemid:largest', replies.length, function(err, res) {

			});
			console.log(JSON.stringify(result_arr));
			return JSON.stringify(result_arr);
		});
	});
}


Item.prototype.changeInventory2 = function(){
	var itemids = ['itemid:127', 'itemid:136'];
	var deltas = [-3, -2];
	this.changeInventory(itemids, deltas);
}

// Accepts an array of itemids and their corresponding deltas in the delta array.
Item.prototype.changeInventory = function(itemids, deltas) {
	var multi = client.multi();
	var multi2 = client.multi();

	var jsonResponse = [];

	for(var i = 0; i < itemids.length; i++) {
		(function(i){
			multi.zincrby('items', deltas[i], itemids[i], function(err, res) {
				var newQuantity = parseFloat(res);

				if (newQuantity < 0) { // if inventory < 0, set it back to 0
					console.log("quantity less than zero!");
					var args = ['items', 0, itemids[i]];
					multi2.zadd(args, function (err, res) {
						if (err) throw err;
						newQuantity = 0;
					});
				}
				multi2.hgetall(itemids[i], function(err, res) {
					if (err) throw err;
					jsonResponse.push(_.extend(res, {'quantity': newQuantity, 'itemid': parseInt(itemids[i].replace(/[^0-9.]/g, ""))}));
				});
			});
		})(i);
	}

	multi.exec(function(err, res) {
		multi2.exec(function(err, res) {
			console.log(JSON.stringify(jsonResponse));
			return JSON.stringify(jsonResponse);		
		});
	});
}

// init() // generates a list of 100 random items in the redis client -- DONE
// getItems()  // returns a list of items (see object above) -- DONE (visually)
// addItem() // - adds a new item to the list (randomly generated for now)
// deleteItem(itemId) // deletes the item with the item id
// addInventory(itemid, num) // add inventory to item by #num
// decreaseInventory(itemid, num) // decrement inventory to item by #num

module.exports = Item;