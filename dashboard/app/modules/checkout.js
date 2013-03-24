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

		initialize: function() {
			this.calculatePrice();
			// TODO: have a feeling backbone.layoutmanager auto stop listens to stuff on its own object
			// but need to double check
			this.on("change:quantity", this.calculatePrice, this);
		},

		calculatePrice: function() {
			console.log("item total price changed");
			var price = parseFloat(this.get("price")) || 0;
			var quantity = parseInt(this.get("quantity")) || 0;
			this.set('total', price * quantity);
			this.set('totalFormatted', Number(this.get('total')).toFixed(2), {silent: true});
		},
	});


		// similar to inventoryitem, but it will have some differences
	Checkout.CartTotalModel = Backbone.Model.extend({
		idAttribute: "itemid",
		defaults: {
			"total": 0
		}
	});

	Checkout.Collection = Backbone.Collection.extend({
		model: Checkout.Model,

		// 1) handle duplicates and updates total price.
		// 		duplicates just change the quantity of existing cart items.
		// 2)  updates total price
		addToCart: function(models) {
			var changed, dup, i, newQuantity, nonDup;
			changed = [];
			for (i = 0; i < models.length; i++) {

					// make sure cart total model has been instantiated.
					if (this.total) {
						this.total.set('total', this.total.get('total') + models[i].price);
					}

					dup = this.get(models[i].itemid);
					if (dup) {
						newQuantity = dup.get("quantity") + models[i].quantity;
						dup.set("quantity", newQuantity);
						models.splice(i, 1);
					}
			}
			if (models.length > 0) {
				this.add(models);
			}

			return this;
		}
	});

	Checkout.Views.CartItem = Backbone.View.extend({
		template: "checkout/cartitem",
		tagName: "a",
		serialize: function() {
			return this.model.toJSON();
		}
	});

	// represents the cart list
	Checkout.Views.Cart = Backbone.View.extend({
		template: "checkout/cart",
		initialize: function(models, options) {
			this.cart = new Checkout.Collection();
			this.cart.total = new Checkout.CartTotalModel();

			this.cart.listenTo(app.vent, "socket:checkout:new", function(data) {
				console.log(data);
				this.addToCart($.parseJSON(data));
			});

			this.listenTo(this.cart, {
				"add": this.render,
				"change": this.render
			});
		},
		beforeRender: function() {
			this.insertView("#checkoutHeader", new Checkout.Views.CartTotal({
				model: this.cart.total
			}));
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

	Checkout.Views.CartTotal = Backbone.View.extend({
		tagName: "div",
		template: "checkout/carttotal",
		serialize: function() {
			return {
				totalFormatted: Number(this.model.get('total')).toFixed(2)
			}
		}
	});

	return Checkout;
});