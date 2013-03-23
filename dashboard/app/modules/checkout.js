define([
	"app"
],

function(app) {

	var Checkout = app.module();


	// similar to inventoryitem, but it will have some differences
	Checkout.Model = Backbone.Model.extend({
		idAttribute: "itemid",

		defaults: {
			"itemid": null,
			"name": null,
			"section": null,
			"type": null,
			"quantity": null,
			"price": null,
			"total": null
		},

		calculatePrice: function() {
			var price = parseFloat(this.get("price")) || 0;
			var quantity = parseInt(this.get("quantity")) || 0;
			this.set('total', price * quantity);
		}
	});

	Checkout.Collection = Backbone.Collection.extend({
		model: Checkout.Model,
		comparator: function(cartitem) {
			return caritem.get("name");
		}
	});



	Checkout.Views.CartItem = Backbone.View.extend({
		template: "",
	});

	// represents the cart list
	Checkout.Views.Cart = Backbone.View.extend({
		template: "",
		initialize: function(models, options) {
			if (options) {
				this.cart = options.cart;				
			}

		},
		beforeRender: function() {
			this.cart.each(function(cartItem) {
				this.insertView("#checkoutCartItems", new Checkout.Views.CartItem({
					model: cartItem
				}));
			}, this);
		},

		serialize: function() {
			return this.cart.toJSON();
		}
	});

	// represents the 
	Checkout.Views.CartTotal = Backbone.View.extend({
		template: "",
	});



	return Checkout;
});