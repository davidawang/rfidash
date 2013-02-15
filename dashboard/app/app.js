define([
  "handlebars",
  "backbone.layoutmanager"

], function(Handlebars) {

  // Provide a global location to place configuration settings and module
  // creation.
  var app = {
    // The root path to run the application.
    root: "/",
    SOCKET_URL: "http://127.0.0.1:80",
    vent: _.extend({}, Backbone.Events),
  };

  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  // Configure LayoutManager with Backbone Boilerplate defaults.
  Backbone.LayoutManager.configure({
    // Allow LayoutManager to augment Backbone.View.prototype.
    manage: true,

    prefix: "app/templates/",

    fetch: function(path) {
      var done;

      // Add the html extension.
      path = path + ".html";

      // If the template has not been loaded yet, then load.
      if (!JST[path]) {
        done = this.async();
        return $.ajax({ url: app.root + path }).then(function(contents) {
          JST[path] = Handlebars.compile(contents);
          JST[path].__compiled__ = true;

          done(JST[path]);
        });
      }

      // If the template hasn't been compiled yet, then compile.
      if (!JST[path].__compiled__) {
        JST[path] = Handlebars.template(JST[path]);
        JST[path].__compiled__ = true;
      }
      
      return JST[path];
    }
  });

  // Mix Backbone.Events, modules, and layout management into the app object.
  return _.extend(app, {
    // Create a custom object with a nested Views object.
    module: function(additionalProps) {
      return _.extend({ Views: {} }, additionalProps);
    },

    // Helper for using layouts.
    useLayout: function(name, options) {
      // Enable variable arity by allowing the first argument to be the options
      // object and omitting the name argument.
      if (_.isObject(name)) {
        options = name;
      }

      // Ensure options is an object.
      options = options || {};

      // If a name property was specified use that as the template.
      if (_.isString(name)) {
        options.template = name;
      }

      // Create a new Layout with options.
      var layout = new Backbone.Layout(_.extend({
        el: "#main"
      }, options));

      // Cache the refererence.
      return this.layout = layout;
    }
  }, Backbone.Events);

});
