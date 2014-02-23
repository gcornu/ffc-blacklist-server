var express = require('express'),
	_ = require('underscore'),
	fs = require('fs');

var app = express(),
	http = require('http'),
	server = http.createServer(app);

var blacklist;
	
server.listen(8080);

fs.readFile('./domains', 'utf8', function (err, data) {
	if(err) {
		return console.log(err);
	}
	blacklist = data.split('\n');
});

app.get('/:domain?', function (req, res) {
	if(req.params.domain) {
		res.setHeader('Content-Type', 'application/json');
		var blacklisted = _.indexOf(blacklist, req.params.domain) !== -1;
		res.end(JSON.stringify(blacklisted));
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.strongify('false'));
	}
});