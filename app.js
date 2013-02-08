var express = require('express'),
	app = express();


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.listen(8080);