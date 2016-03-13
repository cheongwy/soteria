require('nodeunit');

var Soteria = require('../lib/soteria.js');
var MockServer = require('./mock_server.js');
var utils = require('./utils.js');

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
    	utils.emptyLogs(requestLogPath, function() {
    		callback();
    	});
    },
    gets: {
    	testEmptyPath: function (test) {
    		testReqOptions.method = "GET";
    		testReqOptions.path = "";
    		
    		utils.createRequest(testReqOptions, utils.verifyBasePath(test)).end();
    	},
    	testDefaultPath: function (test) {
    		
    		testReqOptions.method = "GET";
    		
    		utils.createRequest(testReqOptions, utils.verifyBasePath(test)).end();
    	},    	
    	testBasePath: function (test) {
    		
    		testReqOptions.method = "GET";
    		testReqOptions.path = "/";
    		
    		utils.createRequest(testReqOptions, utils.verifyBasePath(test)).end();
    	},
    	testGet: function (test) {
    		testReqOptions.method = "GET";
    		testReqOptions.path = "/glossary";
    		
    		var verify = function(data) {
        		test.ok(data);
        		test.ok(data.glossary);
        		test.equal(data.glossary.title,'example glossary');
        		utils.verifyLogData(test);
    		};
    		utils.createRequest(testReqOptions, verify).end();
    	}
    }
};

exports.teardown = function(test) {
	server.stop();
	testServer.stop();
	candidateServer.stop();
	test.done();
};
