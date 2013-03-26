define([
  // Application.
  "app",
  "modules/inventoryitem",
  "modules/checkout",
  "modules/sockjs"
  "modules/socket",
],

function(app, InventoryItem, Checkout) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    initialize: function() {
      var collections = {
        items: new InventoryItem.Collection(),
      };
      _.extend(this, collections);

    },
    routes: {
      "": "index",
      "listview": "listview",
      "checkout": "checkout"
    },

    index: function() {
    },

    listview: function() {
      app.useLayout("layouts/main").setViews({  
        "#content-window": new InventoryItem.Views.ListView()
      }).render();
    },

    checkout: function() {
      app.useLayout("layouts/checkout").setViews({
        "#checkoutCart": new Checkout.Views.Cart(),
      }).render();
    },
    
    // checkout: function() {
    //   app.useLayout("layouts/main").setViews({
    //     "#content-window": new Checkout.Views.Cart(this.cart)
    //   }).render();
    // },

    reset: function() {
      if (this.items.length)
        this.items.reset();
    }

  });

  return Router;

});
