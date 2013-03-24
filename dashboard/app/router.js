define([
  // Application.
  "app",
  "modules/inventoryitem",
  "modules/checkout",
  "modules/socket",

],

function(app, InventoryItem, Checkout) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    initialize: function() {
      var collections = {
        items: new InventoryItem.Collection(),
        // cartitems: new Checkout.Collection(),
      };

      _.extend(this, collections);

      // app.useLayout("layouts/main").setViews({
        
      //   "#content-window": new InventoryItem.Views.ListView(collections)
      // }).render();

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
      app.useLayout("layouts/main").setViews({
        "#content-window": new Checkout.Views.Cart()
      }).render();
    },

    reset: function() {
      if (this.items.length)
        this.items.reset();
    }

  });

  return Router;

});
