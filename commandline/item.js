var redis = require("redis"),
    client = redis.createClient(6379, '127.0.0.1', {return_buffers: false}),
    pubsub  = redis.createClient(null, null, null),
    _ = require('underscore'),
    faker = require('./Faker.js'),
    util = require('util'),
    socket = require('socket.io'),
    eyes = require('eyes');



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
	var result = {
		'section': sectionid,
		'name': name,
		'type': typeid,
		'quantity': _.random(20, 100)
	}
	client.hmset(itemid, "section", sectionid, "name", name, "type", typeid, function(err, res1){
		if (err) throw err;

		var args = [ 'items', result.quantity , itemid]; // add a random quantity of items
		client.zadd(args, function (err, res) {
			if (err) throw err;
		});
		
	});
	return result;
}

// Generates a random # "min_num_items", clears redis database before doing so
Item.prototype.init = function(){
	var that = this;
	
	client.flushall(function(err, res){
		var itemsJson = [];
		for (var i = 0; i < min_num_items; i ++) {
			itemsJson.push((function(i, itemsJson){
				var itemid = "itemid:" + i;
				return that.addItemWithID(itemid);
			})(i));
		}
		console.log(JSON.stringify(itemsJson));
	});
	
	
}

Item.prototype.getItem = function(itemid, arr) {
	client.hgetall("itemid:" + itemid, function(err, res) {
		arr.push(res);
	});
}


// returns
//		total number of items
//		json of all items
Item.prototype.getItems = function(){
	var that = this;

	var args = ['items', Infinity, 0, 'WITHSCORES'];
	client.zrevrangebyscore(args, function(err, replies) {
		if (err) throw err;
		var result = [];
		var multi = client.multi();
		var _this = this;

		for (var i = 0; i < replies.length; i = i + 2) {
			var itemid = replies[i];
			var quantity = replies[i + 1];
			(function(itemid, quantity){
								// result[itemid] = quantity;
				// var callback = 
				multi.hgetall(itemid, function(err, res) {
					if (err) throw err;
					result.push(_.extend(res, {'quantity': quantity}));
				});
			})(itemid, quantity);

		}
		multi.exec(function(err, replies){
			console.log(result);
		})
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
	client.zincrby('items', delta , itemid, function(err, res) {
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