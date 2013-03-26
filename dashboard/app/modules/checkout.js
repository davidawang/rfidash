define([
	"app"
],

function(app) {

	var Checkout = app.module();


	// similar to inventoryitem, but it will have some differences
	Checkout.Model = Backbone.Model.extend({
		idAttribute: "epc",

		defaults: {
			"epc": null,
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
		}
	});


		// similar to inventoryitem, but it will have some differences
	Checkout.CartTotalModel = Backbone.Model.extend({
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
			changed = _.pluck(models, 'epc');
			console.log(changed);
			for (i = 0; i < models.length; i++) {
				// make sure cart total model has been instantiated.
				if (this.total) {
					this.total.set('total', this.total.get('total') + models[i].price);
				}

				dup = this.get(models[i].epc);
				if (dup) {
					newQuantity = dup.get("quantity") + models[i].quantity;
					dup.set("quantity", newQuantity);
					models.splice(i, 1);
				}
			}
			if (models.length > 0) {
				this.add(models);
			}
			// for (i = 0; i < changed.length; i++) {
			// 	this.get(changed[i]).flash();
			// }
			return this;
		}
	});

	Checkout.Views.CartItem = Backbone.View.extend({
		template: "checkout/cartitem",
		tagName: "a",
		serialize: function() {
			return this.model.toJSON();
		},

		// TODO: do this after you figure out selective updating
		// flash: function(){
		// 	var _this = this;
		// 	this.$el.addClass('flash').removeClass('unflash');
		// 	setTimeout(function() {
		// 		_this.$el.addClass('unflash').removeClass('flash');
		// 	}, 100);
		// },

		// afterRender: function() {
			
		// 	var changed = _.omit(this.model.changedAttributes(), 'totalFormatted');
		// 	debugger
		// 	if (changed != false && changed.length === 1 && changed.quantity) {
		// 		this.flash();	
		// 	} 
		// },
		initialize: function() {
			this.on("change", this.boom ,this);
		},
		boom: function(a, b) {
			console.log("boom")

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

		// TODO: move header out of cart view
		// TODO: if only 1 item changes don't re-insert all of the views.
		beforeRender: function() {
			this.insertView("header", new Checkout.Views.CartTotal({
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
		tagName: "span",
		template: "checkout/carttotal",
		serialize: function() {
			return {
				totalFormatted: Number(this.model.get('total')).toFixed(2)
			}
		}
	});

	return Checkout;
});