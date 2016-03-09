var http = require('http');
var fs = require('fs');

function MockServer() {

	if (!(this instanceof MockServer)) {
	    return new MockServer();
	}
	
	this.server = http.createServer(function(request, response) {
		response.statusCode = 200;
		var prefix = request.method;
		var path = (request.url === '/') ? '/default':request.url;
		var fullPath = __dirname+"/data/"+prefix+path+".json";
		respond(fullPath, function(data){
			response.end(data);    
		});
	});	
}

MockServer.prototype.start = function(port) {	
	this.server.listen(port,function() {
		console.log("Server listening on ",port);
	});
};

MockServer.prototype.stop = function() {
	this.server.close();
};


function respond(path, callback) {
	fs.readFile(path, 'utf8', function (err,data) {
		if (err) {
			throw new Error(err);
		}
		callback(data);
	});
}

module.exports = MockServer;

