var express = require('express'),
	fs = require('fs'),
	_ = require('underscore');

var app = express(),
	http = require('http');
	
var blacklist;
var port = Number(process.env.PORT || 5000);
var numCPUs = require('os').cpus().length;
console.log('working with ' + numCPUs + ' CPUs');

fs.readFile('./domains', 'utf8', function (err, data) {
	if(err) {
		return console.log(err);
	}
	blacklist = data.split('\n');
	console.log('Blacklist length: ' + blacklist.length);
});

var server = http.createServer(app);

server.listen(port, function() {
	console.log("Listening on " + port);
});

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

app.get('/:domain?', function (req, res) {
	if(req.params.domain) {
		res.setHeader('Content-Type', 'application/json');
		var blacklisted = _.indexOf(blacklist, req.params.domain) !== -1;
		res.end(JSON.stringify(blacklisted));
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(false));
	}
});
