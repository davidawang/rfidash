define([
	"app"
],

function(app) {

	var InventoryItem = app.module();

	InventoryItem.Model = Backbone.Model.extend({
		idAttribute: "itemid",

		defaults: {
			"itemid": null,
			"name": null,
			"section": null,
			"type": null,
			"quantity": null
		},


	});

	InventoryItem.Collection = Backbone.Collection.extend({
		model: InventoryItem.Model
	});

	InventoryItem.Views.Item = Backbone.View.extend({
		template: "inventoryitem/item",
		
		tagName: "a href='#'",

		initialize: function () {
			this.listenTo(this.model, "change", function(d) {
				this.render();
			});
		},

		serialize: function() {
			return this.model.toJSON();
		},
	});

	InventoryItem.Views.List = Backbone.View.extend({
		template: "inventoryitem/list",

		events: {

		},

		initialize: function() {
			var ii = this.options.items;
			ii.comparator = this.comparator;
			// var _this = this;

			this.listenTo(app.vent, {
				"socket:items:change": function(data) {
					console.log(data);
					ii.update($.parseJSON(data), {add: false, remove: false});
					ii.sort();
				},

				"socket:items:new": function(data) {
					console.log(data);
					ii.reset($.parseJSON(data));
					ii.sort();
				}
			});

			this.listenTo(this.options.items, {
				"reset": this.render,
				"sort": this.render
			});

		},

		limit: function(collection, n) {
			return new InventoryItem.Collection(collection.first(n));
		},

		serialize: function() {
			// debugger;
			return { collection: this.options.items };
		},

		beforeRender: function() {
			// hi.sort();
			this.limit(this.options.items, 13).each(function(item) {
				this.insertView(".inventory-list", new InventoryItem.Views.Item({
					model: item
				}));
			}, this);
		},

		comparator: function(item) {
			return parseInt(item.get("quantity"));
		}

		// TODO: stop listening when view is cleaned up.

	});

	return InventoryItem;
});