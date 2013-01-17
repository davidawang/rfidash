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

program.parse(process.argv);