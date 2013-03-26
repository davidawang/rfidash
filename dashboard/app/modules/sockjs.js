define([
	"app"
],

function(app) {
    var sock = new SockJS('http://ec2-174-129-168-166.compute-1.amazonaws.com:8080/all');

    sock.onopen = function() {
    	console.log("sockjs opened");
    }

    sock.onmessage = function(e) {
    	var data = JSON.parse(e.data);
    	var eventType = data.event;
    	var payload = JSON.stringify(data.payload);

    	if (eventType === "create") {
    		app.vent.trigger("socket:items:new", payload);
    	} else if (eventType === "add") {
    		app.vent.trigger("socket:items:new", payload);
            app.vent.trigger("socket:checkout:new", payload);
    	} else if (eventType === "remove") {
    		app.vent.trigger("socket:items:delete", payload);
    	}
    }

    sock.onclose = function() {
    	console.log("sockjs closed");
    }
});
