// Test running on a node js file
console.log('File has been started');

//Require
var http = require('http');
var localVariables = require('./localVariables');
//var parseString = require('xml2js').parseString;

// Variables
var jsonObject;

// Http Request Options
var options = {
	host: 'linux.domgoodw.in',
	port: 8080,
	//path: '/rest/api/2/search?jql=assignee=ethan',
	path: '/rest/api/2/issue/EJB-1',
	method: 'GET',
	json:true,
	headers: {
	'Authorization': 'Basic ' + localVariables.namePassword
	}
};

var req = http.request(options, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
		console.log(chunk.key);
	});
});




req.end();
//DEBUG
//console.log('NamePassword: ' + localVariables.namePassword);
//for(var i = 0; i < options.length;i++){
//	console.log(options[i]);
//}
	