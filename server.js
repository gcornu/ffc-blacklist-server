var express = require('express'),
	cluster = require('cluster'),
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
	blacklist = data.split('\r\n');
});

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {
	var server = http.createServer(app);
	
	server.listen(port, function() {
		console.log("Listening on " + port);
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
}
