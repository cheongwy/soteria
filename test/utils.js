var http = require('http');
var fs = require('fs');
var LineByLineReader = require('line-by-line');

var utils = function(){
	
	var requestLogPath = 'request.log';
	
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
		
		function read(retries) {			
			var lr = new LineByLineReader(requestLogPath);
			
			lr.on('error', function (err) {
				throw new Error(err);
			});
			
			lr.on('line', function (line) {
				lines.push(JSON.parse(line));
			});
			
			lr.on('end', function () {
				if(lines.length != 2 && retries > 0) {
					setTimeout(function(){
						read(retries--);
					},10);
				}
				else {
					if(lines.length === 2) {
						callback(lines);				
					}
					else {
						throw new Error('Log entry in request log not ready yet');
					}
				}
			});		
		}
		
		read(3);
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
	
	return {
		createRequest: createRequest,
		verifyBasePath: verifyBasePath,
		verifyLogData: verifyLogData,
		emptyLogs: emptyLogs	
	};
}();

exports.createRequest = utils.createRequest;

exports.verifyBasePath = utils.verifyBasePath;

exports.verifyLogData = utils.verifyLogData; 

exports.emptyLogs = utils.emptyLogs;
