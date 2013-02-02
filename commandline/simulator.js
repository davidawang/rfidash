#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var item = require('./item.js');
var newItem = new item();

program
	.version('0.0.1')

program
	.command('init')
	.action(function(){
		newItem.init();
	});

program
	.command('all')
	.action(function(){
		newItem.getItems();
	});

program
	.command('newitems <newnum>')
	.action(function(quantity){
		newItem.generateRandomItems(quantity);
	});

program
	.command('change')
	.action(function(){
		newItem.changeInventory2();
	});

program.parse(process.argv);