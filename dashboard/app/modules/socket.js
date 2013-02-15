define([
	"app",
	"socket.io"
],

function(app, io) {
    var items = io.connect(app.SOCKET_URL + "/items");

    items.on('init', function (data) {
      app.vent.trigger("socket:items:new", data);
    });

    items.on('new', function (data) {
      app.vent.trigger("socket:items:new", data);
    });

    items.on('change', function (data) {
      app.vent.trigger("socket:items:change", data);
    });

    items.on('all', function (data) {
      app.vent.trigger("socket:items:new", data);
    });
});