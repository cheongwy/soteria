process.env.NODE_ENV = 'test';

require('nodeunit');
var fs = require('fs');
var lineReader = require('line-reader');

var Soteria = require('../lib/soteria.js');
var http = require('http');
var MockServer = require('./mock_server.js');


var testServer = new MockServer(); 
var candidateServer = new MockServer(); 
var config = require('config');

var candidatePort = config.get("candidate.port");
var originPort = config.get("origin.port");

var testReqOptions = {
	hostname: 'localhost',
	port: 8080,
	headers: {'Content-Type':'application/json'}
};

var requestLogPath = 'request.log';

var server;

exports.setup = function(test) {
	server = new Soteria();
	server.start();
	testServer.start(originPort);
	candidateServer.start(candidatePort);
	test.done();
};

exports.test1 = {
    setUp: function(callback) {
    	emptyLogs(requestLogPath, function() {
    		callback();
    	});
    },
    gets: {
    	testEmptyPath: function (test) {
    		testReqOptions.method = "GET";
    		testReqOptions.path = "";
    		
    		createRequest(testReqOptions, verifyBasePath(test)).end();
    	},
    	testDefaultPath: function (test) {
    		
    		testReqOptions.method = "GET";
    		
    		createRequest(testReqOptions, verifyBasePath(test)).end();
    	},    	
    	testBasePath: function (test) {
    		
    		testReqOptions.method = "GET";
    		testReqOptions.path = "/";
    		
    		createRequest(testReqOptions, verifyBasePath(test)).end();
    	},
    	testGet: function (test) {
    		testReqOptions.method = "GET";
    		testReqOptions.path = "/glossary";
    		
    		var verify = function(data) {
        		test.ok(data);
        		test.ok(data.glossary);
        		test.equal(data.glossary.title,'example glossary');
        		verifyLogData(test);
    		};
    		createRequest(testReqOptions, verify).end();
    	}
    }
};

exports.teardown = function(test) {
	server.stop();
	testServer.stop();
	candidateServer.stop();
	test.done();
};

function createRequest(testReqOptions, callback) {
	var testRequest = http.request(testReqOptions, function(testResponse) {
		var data = '';
		testResponse.on('data', function(chunk) {
    		data += chunk;
    	});
    	
		testResponse.on('end', function() {
    		callback(JSON.parse(data));
    	});    			
	});
	return testRequest;
}

function verifyBasePath(test) {
	var verify = function(data) {
		test.ok(data);
		test.equal(data.app,'soteria');
		verifyLogData(test);
	};
	return verify;
}

function verifyLogData(test) {
	readLogData(function(lines){
		console.log(lines);
		test.ok(lines);
		test.equal(2,lines.length);
		test.ok(lines[0].soteria.data);
		test.deepEqual(lines[0].soteria.data,lines[1].soteria.data);
		test.deepEqual(lines[0].soteria.requestId,lines[1].soteria.requestId);
		test.done();			
	});
}

function readLogData(callback) {
	var lines = [];
	lineReader.eachLine(requestLogPath, function(line, last) {
		lines.push(JSON.parse(line));
		if (last) {
			callback(lines);
			return false;
		}
	});
}

function emptyLogs(path, callback) {
	fs.exists(path, function(exists) {
	  if(exists) {
		  fs.truncate(path,callback);
	  }
	  else {
		  throw new Error('Expected request.log does not exist');
	  }
	});
}