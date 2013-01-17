var redis = require("redis"),
    client = redis.createClient(6379, '127.0.0.1', {detect_buffers: true}),
    _ = require('underscore'),
    faker = require('./Faker.js'),
    util = require('util');



Item = function(){
	min_num_items = 204;
	sections = ["M", "W", "b", "g", "k"];
	//cur_num_items = 0;
	type = ["m", "w", "c"];
}

Item.prototype.init = function(){
	// create random objects with random data

	client.flushall(function(err, res){
		for (var i = 0; i < min_num_items; i ++) {
			(function(i){
				var sectionid = sections[_.random(0, sections.length - 1)];
				var name = faker.random.bs_adjective() + " " + faker.random.bs_noun();
				var typeid = type[_.random(0, type.length - 1)];
				console.log("generating " + i);

				client.hmset("itemid:" + i, "section", sectionid, "name", name, "type", typeid, function(err, res){
					var args = [ 'items', _.random(20, 100) , 'itemid:' + i ]; // add a random quantity of items
					client.zadd(args, function (err, res) {
						console.log(res);
					});
				});
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

Item.prototype.addItem = function(){
	console.log("addItem");
}
// sections = [men, women, girls, boys, kids, babies] // (for now)
// init() // generates a list of 100 random items in the redis client
// getItems()  // returns a list of items (see object above)
// addItem() // - adds a new item to the list (randomly generated for now)
// deleteItem(itemId) // deletes the item with the item id
// addInventory(itemid, num) // add inventory to item by #num
// decreaseInventory(itemid, num) // decrement inventory to item by #num


Item.prototype.blah = function(){
	var args = [ 'myzset', 1 , 'one'+ _.random(1, 100) ];
	client.zadd(args, function (err, res) {
		console.log(res);
		client.zcard( ['myzset'], function(err, res) {
			console.log("total num: " + res);
			client.end();
		});

	});
}	
module.exports = Item;