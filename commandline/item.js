var redis = require("redis"),
    client = redis.createClient(6379, '127.0.0.1', {detect_buffers: true}),
    _ = require('underscore'),
    faker = require('./Faker.js'),
    util = require('util');



Item = function(){
	min_num_items = 204;
	sections = ["M", "W", "b", "g", "k"];
	type = ["m", "w", "c"];
}

// generates a random item with "itemid"
Item.prototype.addItemWithID = function(itemid) {
	var sectionid = sections[_.random(0, sections.length - 1)];
	var name = faker.random.bs_adjective() + " " + faker.random.bs_noun();
	var typeid = type[_.random(0, type.length - 1)];

	client.hmset(itemid, "section", sectionid, "name", name, "type", typeid, function(err, res){
		var args = [ 'items', _.random(20, 100) , itemid]; // add a random quantity of items
		client.zadd(args, function (err, res) {
			console.log(res);
		});
	});
}

// Generates a random # "min_num_items", clears redis database before doing so
Item.prototype.init = function(){
	var that = this;

	client.flushall(function(err, res){
		for (var i = 0; i < min_num_items; i ++) {
			(function(i){
				var itemid = "itemid:" + i;
				that.addItemWithID(itemid);
			})(i);
		}
	});
}


// returns
//		total number of items
//		json of all items
Item.prototype.getItems = function(){
	client.zcard('items', function(err, res) {
		var totalnum = res;
		console.log(totalnum);
		for (var i = 0; i < totalnum; i++) {
			(function(i){
				client.hgetall("itemid:" + i, function(err, res){
					console.log(res);
				});
			})(i);
		}
	});
}

// Generates N random new items
Item.prototype.generateRandomItems = function(number_of_new_items){
	var that = this;

	client.zcard('items', function(err, res) { // get current number of items
		var current_total_items = res;
		for(var i = 0; i < number_of_new_items; i++) {
			var itemid = "itemid:" + (i + current_total_items)
			that.addItemWithID(itemid);
		}
	});
}

Item.prototype.changeInventory = function(itemid, delta) {
	client.zincrby('items', delta*-1, itemid, function(err, res) {
		if (res < 0) { // if inventory < 0, set it back to 0
			var args = [ 'items', 0 , itemid];
			client.zadd(args, function (err, res) {
				console.log(res);
			});
		}
	});
}

// init() // generates a list of 100 random items in the redis client -- DONE
// getItems()  // returns a list of items (see object above) -- DONE (visually)
// addItem() // - adds a new item to the list (randomly generated for now)
// deleteItem(itemId) // deletes the item with the item id
// addInventory(itemid, num) // add inventory to item by #num
// decreaseInventory(itemid, num) // decrement inventory to item by #num


module.exports = Item;