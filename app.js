var express = require('express'),
	app = express(),
	Simulator =  require('./commandline/simulator.js'),
	s = new Simulator();


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.listen(8081);