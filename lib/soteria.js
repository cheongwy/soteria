var http = require('http');
var httpProxy = require('http-proxy');
var config = require('config');
var clone = require('clone');
var bunyan = require('bunyan');
var cuid = require('cuid');
var url = require('url');

function Soteria() {
	
	if (!(this instanceof Soteria)) {
	    return new Soteria();
	}
	
	this.name = config.get("app.name");
	this.port = config.get("app.port");

	var reqLogOptions = {
		name: this.name,
		streams: [{
			level: "info",
			path: "request.log"
		}]
	};
	
	var log = bunyan.createLogger(reqLogOptions);
	
	var appLogOptions = {
		name: this.name+'-app',
		streams: [{
			level: "info",
			path: this.name+".log"
		}]
	};
	
	this.applog = bunyan.createLogger(appLogOptions);
	
	this.server = http.createServer(function(request, response) {
		
		var requestId = cuid();
		createOriginProxy(request, requestId, response, log);
	    createCandidateRequest(request, requestId, log);
	    
	    request.on("error", function(e) {
	    	log.error(e, 'Error on incoming request %s',e.msg);
	    });
	    
	});
}

Soteria.prototype.start = function() {
	var soteria = this;
	soteria.server.listen(soteria.port,function() {
		soteria.applog.info(soteria.name+" started on "+soteria.port+" in "+process.env.NODE_ENV);
	});		
};

Soteria.prototype.stop = function() {
	this.server.close();
};

function createLogData(data, requestId, target) {
	var json = {};
	if(data) {
		try {
			json = JSON.parse(data);
		}
		catch(error) {
			json = {"error":error};
		}
	}
	
	return {"soteria": {
		"data":data,
		"target": target,
		"requestId": requestId
	}};
}

function createOriginProxy(request, requestId, response, log) {
	var originHost = config.get("origin.host");
	
	var originPort = '';
	if(config.has("origin.port")) {
		originPort = ':'+config.get("origin.port");
	}
	var originTarget = "http://"+originHost+originPort;
	var originOptions = {
		changeOrigin: true,
		target: originTarget
	};
	
	var urlObj = url.parse(request.url);

	request.headers['host'] = urlObj.host;
	request.headers['url'] = urlObj.href;
	
	var originProxy = httpProxy.createProxyServer({});
    originProxy.web(request, response, originOptions);    
    
    originProxy.on('error', function(e){
    	log.error(e, 'Error on origin request %s',e.msg);
    });
    
    originProxy.on('proxyRes', function (proxyRes, req, res) {
    	var originData = "";
    	
    	proxyRes.on('data', function(chunk){
    		originData += chunk;
    	});
    	
    	proxyRes.on('end', function(){
    		log.info(createLogData(originData,requestId,"origin"));
    	});
    });	
}


function createCandidateRequest(request, requestId, log) {
	var candidateHost = config.get("candidate.host");
	var candidatePort = config.get("candidate.port");
	
	var candidateReqOptions = {
		hostname: candidateHost,
		port: candidatePort,
		method: request.method,
		headers: request.headers,
		path: request.url
    };
    
    var candidateRequest = http.request(candidateReqOptions, 
    									function(candidateResponse) {
    	var candidateData = "";
    	candidateResponse.on('data', function(chunk) {
    		candidateData += chunk;
    	});
    	
    	candidateResponse.on('end', function() {
    		log.info(createLogData(candidateData,requestId,"candidate"));
    	});
	
    });
    
    candidateRequest.on("error", function(e) {
    	log.error(e, 'Error on candidate request %s',e.msg);
    });
    
    request.on("data", function(chunk) {
    	candidateRequest.write(chunk);
    });
    
    request.on("end", function() {
    	candidateRequest.end();
    });    
    
    return candidateRequest;
}

module.exports = Soteria;