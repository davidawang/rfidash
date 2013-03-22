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
			"quantity": null,
			"threshold": {
				"good": [31, Infinity],
				"okay": [11, 30],
				"low": [0, 10]
			}
		},

		calculateQuantityLevel: function() {
			var quantity_status, quantity;

			quantity = parseInt(this.get('quantity'));
			_.every(this.toJSON().threshold, function(range, levelname) {
				if (quantity >= range[0] && quantity <= range[1]) {
					quantity_status = levelname;
					return false;
				}
				return true;
			});
			this.set('quantity_status', quantity_status);
		}
	});


	InventoryItem.Collection = Backbone.Collection.extend({
		model: InventoryItem.Model,
		comparator: function(item) {
			return parseInt(item.get("quantity"));
		}

	});

	InventoryItem.Views.Item = Backbone.View.extend({
		template: "inventoryitem/item",
		
		tagName: "a href='#'",

		initialize: function () {
		},

		flash: function(){
			var _this = this;
			this.$el.addClass('flash').removeClass('unflash');
			setTimeout(function() {
				_this.$el.addClass('unflash').removeClass('flash');
			}, 100);
		},

		afterRender: function() {
			if (!_.isEmpty(this.model.changedAttributes())) {
				this.flash();	
			} 
		},
	
		serialize: function() {
			this.model.calculateQuantityLevel();
			return this.model.toJSON();
		}
	});



	InventoryItem.Views.Search = Backbone.View.extend({
		template: "inventoryitem/search",

		events: {
			"keyup #item-search-form": "itemSearch",
		},

		itemSearch: function(evt){
			var terms = $(evt.target).val();
			app.vent.trigger("item:search", terms);
		}
	});

	InventoryItem.Views.List = Backbone.View.extend({
		template: "inventoryitem/list",

		initialize: function() {
			var _this = this;

			this.collection = new InventoryItem.Collection();
			this.filtered = new InventoryItem.Collection();

			this.listenTo(app.vent, {
				"socket:items:change": function(data) {
					console.log(data);
					this.collection.set($.parseJSON(data), {add: false, remove: false});
					// this.collection.sort();
				},

				"socket:items:new": function(data) {
					console.log(data);
					this.collection.add($.parseJSON(data));
					// this.collection.sort();
				},

				"item:search": function(data) {
					this.filterResults(data);
				}
			});


			// TODO: check out rivet.js
			this.listenTo(this.collection, {
				"reset": this.filterResults,
				"sort": this.filterResults
			});

			this.listenTo(this.filtered, {
				"all": this.render
			});

		},

		// filters by both itemid or item name
		filterResults: function(terms) {
			var searchterm = _.isObject(terms) ? this.cachedsearch || "" : terms;

			var pattern = new RegExp(searchterm,"gi");
			var filteredItems = this.collection.filter(function(item) {
				return pattern.test(item.get("name")) || pattern.test(item.get("itemid"));
			});

			// don't rerender if search term was the same
			if (!this.cachedsearch || this.cachedsearch !== searchterm) {
				(searchterm.length > 0) ? this.filtered.set(filteredItems) : this.filtered.set(this.collection.toJSON());
				this.cachedsearch = searchterm;
			}
			
		},

		limit: function(collection, n) {
			// return new InventoryItem.Collection(collection.first(5));
			return collection;
		},

		serialize: function() {
			return { collection: this.filtered };
		},

		// Don't render thousands of items...
		beforeRender: function() {
			// this.limit(this.filtered, 20).each(function(item) {
			this.filtered.each(function(item) {
				// var quantity_level;

				// if (quantity_level
				this.insertView(".inventory-list", new InventoryItem.Views.Item({
					model: item
				}));
			}, this);
		},


		// TODO: stop listening when view is cleaned up.

	});

	InventoryItem.Views.ListView = Backbone.Layout.extend({
		template: "layouts/listview",
		manage: true,
		initialize: function() {
		},
		views: {
			"#inventoryitem-search": new InventoryItem.Views.Search(),
			"#inventoryitem-results": new InventoryItem.Views.List()
		}
	});

	return InventoryItem;
});