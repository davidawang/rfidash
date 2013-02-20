define([
  // Application.
  "app",
  "modules/inventoryitem",
  "modules/socket",

],

function(app, InventoryItem) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    initialize: function() {
      var collections = {
        items: new InventoryItem.Collection()
      };

      _.extend(this, collections);

      app.useLayout("layouts/main").setViews({
        
        "#content-window": new InventoryItem.Views.ListView(collections)
      }).render();

    },
    routes: {
      "": "index",
      "listview": "listview"
    },

    index: function() {
      // this.reset();
    },

    listview: function() {

    },

    reset: function() {
      if (this.items.length)
        this.items.reset();
    }

  });

  return Router;

});
