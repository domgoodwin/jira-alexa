// Test running on a node js file
console.log('File has been started');

//Require
var http = require('http');
var localVariables = require('./localVariables');


// Http Request Options
var options = {
	host: 'linux.domgoodw.in',
	port: 8080,
	//path: '/rest/api/2/search?jql=assignee=ethan',
	path: '/rest/api/2/issue/EJB-1',
	method: 'GET',
	headers: {
	'Authorization': 'Basic ' + localVariables.namePassword
	}
};

http.request(options, function(res) {
	//console.log('STATUS: ' + res.statusCode);
	//console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	});
}).end();

//DEBUG
//console.log('NamePassword: ' + localVariables.namePassword);
//for(var i = 0; i < options.length;i++){
//	console.log(options[i]);
//}
	