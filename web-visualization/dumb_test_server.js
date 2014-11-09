var http = require('http');
var fs = require('fs');
var path = require('path');

var gridSize = 50;

fs.exists = fs.exists || require('path').exists;
fs.existsSync = fs.existsSync || require('path').existsSync;

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function r(max) {
  return Math.floor(Math.random() * max);
}

function respondToHttpRequest(req, res) {
	console.log("Responding to http request: " + req.url);
	var url = req.url;
	if (url === "/")  {
		url = "/index.html";
	}
	if (url === "/wind_data.json")  {
    console.log('sending randomly generated wind data');
		var weatherData = [];
		for (i = 0; i < (gridSize * gridSize); i++)  {
			var temp = [];
			temp[0] = r(25);
			temp[1] = r(360);
			weatherData[i] = temp;
		}
		var jsonstring = JSON.stringify(weatherData);
		res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length': jsonstring.length});
		res.end(jsonstring);
	} else {
		var filePath = path.join(__dirname, url);
        fs.exists(filePath, function(exists) {
            if (exists) {
                console.log('sending contents of local file: ' + filePath);
                var stat = fs.statSync(filePath);
                var contenttype = "text/html";
                if (endsWith(url, ".css"))  {
                    contenttype = "text/css";
                }
                if (endsWith(url, ".js"))  {
                    contenttype = "application/javascript";
                }
                res.writeHead(200, {
                    'Content-Type': contenttype,
                    'Content-Length': stat.size
                });
                var readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
            } else {
                console.log('returning 404, could not find requested file: ' + filePath);
                res.writeHead(404);
                res.end('Not found.  Go away kid, you\'re bothering me.');
            }
        });
        
    }
}

// Set up the HTTP listener
var server = http.createServer(function (req, res) {
  respondToHttpRequest(req, res);
}).listen(8080);
server.on('connection', function(sock) {
  console.log('Incoming HTTP connection from ' + sock.remoteAddress);
});
console.log('HTTP server running on port 8080.');
