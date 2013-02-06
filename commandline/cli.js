#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var item = require('./item.js');
var newItem = new item();
var Simulator = require('./simulator.js');
var s = new Simulator();

program
	.version('0.0.1')

program
	.command('init')
	.action(function(){
		newItem.init(function(res) {
			console.log(res);
		});
	});

program
	.command('all')
	.action(function(){
		newItem.getItems(0, +Infinity, function(res) {
			console.log(res);
		});
	});

program
	.command('newitems <newnum>')
	.action(function(quantity){
		setTimeout(function(){
			newItem.generateRandomItems(quantity);
		}, 100);
		
	});

program
	.command('change')
	.action(function(){
		newItem.changeInventory2();
	});

program
	.command('count')
	.action(function(){
		newItem.getTotalNumber(function(res) {
			console.log(res);
		});
	});

program
	.command('ids')
	.action(function(){
		newItem.getValidIds(function(res) {
			console.log(res);
		});
	});

program
	.command('s')
	.action(function(){
		s.simulate_inventorychange(function(res) {
			console.log(res);
		});
	});

program.parse(process.argv);