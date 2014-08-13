require('newrelic');

var express = require('express'),
	fs = require('fs'),
	_ = require('underscore');

//var mongoose = require('mongoose');

var app = express(),
	http = require('http');
	
var blacklist = new Object();
var port = Number(process.env.PORT || 5000);

/*fs.readFile('./domains', 'utf8', function (err, data) {
	if(err) {
		return console.log(err);
	}
	var splittedList = data.split('\n');
	var currentCategory = '';
	splittedList.forEach(function (element) {
		if(element.charAt(0) === '[' && element.charAt(element.length - 1) === ']') {
			currentCategory = element.substr(1, element.length - 2);
		} else {
			blacklist[element] = currentCategory;
		}
	});
	console.log('Blacklist length: ' + Object.keys(blacklist).length);
});*/

fs.readdir('./blacklist', function (err, folders) {
	if(err) {
		return console.log(err);
	}
	folders.forEach(function (folder) {
		var category = folder.replace(folder.charAt(0), folder.charAt(0).toUpperCase());

		// Read domains file
		fs.readFile('./blacklist/' + folder + '/domains', 'utf8', function (err, data) {
			if(err) {
				return console.log(err);
			}
			blacklist[category] = data.split('\n');
		});

		// Read url file (only take host)
		fs.readFile('./blacklist/' + folder + '/urls', 'utf8', function (err, data) {
			if(err) {
				return console.log(err);
			}
			var splittedList = data.split('\n');
			splittedList.forEach(function (url, index) {
				var slashIndex = url.indexOf('/');
				if(slashIndex !== -1) {
					url = url.substr(0, slashIndex);
				}
				splittedList[index] = url;
			});
			blacklist[category] = _.union(blacklist[category], _.uniq(splittedList, true));
		});
	});
})

var server = http.createServer(app);

server.listen(port, function() {
	console.log("Listening on " + port);
});

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

app.get('/query/:domain?', function (req, res) {
	if(req.params.domain) {
		res.setHeader('Content-Type', 'application/json');
		var blacklisted = false;
		var BreakException= {};
		try {
			Object.keys(blacklist).forEach(function (category) {
				if(category === 'Search_engines') {
					if(blacklist[category].indexOf(req.params.domain.replace(/(\w+)\.(\w+)$/, '$1')) !== -1) {
						throw BreakException;
					}
				} else {
					if(blacklist[category].indexOf(req.params.domain) !== -1) {
						throw BreakException;
					}
				}
			});
		} catch(e) {
			if (e !== BreakException) {
				throw e;
			} else {
				blacklisted = true;
			}
		}
		res.end(JSON.stringify(blacklisted));
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(false));
	}
});

app.get('/search/:searchString?', function (req, res) {
	if(req.params.searchString) {
		var searchString = decodeURI(req.params.searchString);
		var matches = new Object();

		Object.keys(blacklist).forEach(function (category) {
			blacklist[category].forEach(function (host) {
				if(host.indexOf(searchString) > -1) {
					if(!matches[category]) {
						matches[category] = [];
					}
					matches[category].push(host);
				}
			});
		});

		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(matches));
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify([]));
	}
});

//database management
/*mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://admin:mongohqheroku@lennon.mongohq.com:10001/app22466848');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('db opened');
});

var Schema = mongoose.Schema;

var statsSchema = new Schema({
	installed: { type: Date, default: Date.now },
	uninstalled: { type: Date },
	useTime: {
		nbUsedTimes: Number,
		averageUseTime: Number
	},
	preferences: {
		filtering: String,

	}
});

var Stats = mongoose.model('Stats', statsSchema);

app.get('/stats/init', function (req, res) {
	var stats = new Stats();
	stats.save(function (err, stats) {
		if (err) return console.error(err);
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(stats.id));
	});
});

app.post('/stats/send', function (req, res) {
	if(isStatsReqComplete(req)) {
		Stats.findById(req.body.statsId, function (err, stats) {
			if (err) return console.error(err);

			stats.useTime.nbUsedTimes = req.body.useTime.nbUsedTimes;
			stats.useTime.averageUseTime = req.body.useTime.averageUseTime;
			stats.preferences.filtering = req.body.preferences.filtering;

			stats.save(function (err) {
				if(err) return console.error(err);
			})
		});
	}
});

app.get('/stats/uninstalled/:statsId?', function (req, res) {
	if(req.params.statsId) {
		Stats.findById(req.body.statsId, function (err, stats) {
			if (err) return console.error(err);

			stats.uninstalled = Date.now();

			stats.save(function (err) {
				if(err) return console.error(err);
			})
		});
	}
});

function isStatsReqComplete(req) {
	return req.body.statsId 
		&& req.body.useTime 
		&& req.body.usedTime.nbUsedTimes 
		&& req.body.usedTime.averageUseTime 
		&& req.body.preferences 
		&& req.body.preferences.filtering;
}*/