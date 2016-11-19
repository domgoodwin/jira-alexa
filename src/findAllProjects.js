// Test running on a node js file
console.log('File has been started');

//Require
var http = require('http');
var localVariables = require('./localVariables');
//var parseString = require('xml2js').parseString;

// Variables
var jsonObject = "";
//var apiPath = '/rest/api/2/project';

// Http Request Options
var options = {
	host: 'linux.domgoodw.in',
	port: 8080,
	path: '/rest/api/2/project',
	method: 'GET',
	json:true,
	headers: {
	'Authorization': 'Basic ' + localVariables.namePassword
	}
};
var output = "dom is gay ";

var req = http.request(options, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
		var jsonChunk = JSON.parse(JSON.stringify(chunk));
		var data = JSON.parse(chunk);
		for(var i = 0; i < data.length; i++) {
            var obj = data[i];
            console.log(obj.name);
			output = output + obj.name + ' ';

        }
		console.log(output);
	});
	

});

req.end();