require('nodeunit');

var Soteria = require('../lib/soteria.js');
var utils = require('./utils.js');
var config = require('config');

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
	test.done();
};

exports.test1 = {
    setUp: function(callback) {
    	utils.emptyLogs(requestLogPath, function() {
    		callback();
    	});
    },
    gets: {
    	testGet: function (test) {
    		testReqOptions.method = "GET";
    		testReqOptions.path = "/posts";
    		
    		var verify = function(data) {
        		test.ok(data);
        		test.equal(100,data.length);
        		test.equal(data[0].id,'1');
        		utils.verifyLogData(test);
    		};
    		
    		utils.createRequest(testReqOptions, verify).end();
    	}
    }
};

exports.teardown = function(test) {
	server.stop();
	test.done();
};

