define([
  // Application.
  "app",
  "modules/inventoryitem",
  // "modules/socket",
  "modules/sockjs"

],

function(app, InventoryItem) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    initialize: function() {
      var collections = {
        items: new InventoryItem.Collection(),
        // cart: new Checkout.Collection(),
      };
      _.extend(this, collections);

      

    },
    routes: {
      "": "index",
      "listview": "listview",
      "checkout": "checkout"
    },

    index: function() {
      // this.reset();
    },

    listview: function() {
      app.useLayout("layouts/main").setViews({
        
        "#content-window": new InventoryItem.Views.ListView(this.collections)
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
