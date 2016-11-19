// Alexa Skill prototype and helper functions
// https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/JiraAlexa/src/AlexaSkill.js 
var AlexaSkill = require('./AlexaSkill');
var http = require('http');
var localVariables = require('./localVariables');

// App ID for skill
var APP_ID = localVariables.appID;

function httpRequest(path, cb){
    namePassword = localVariables.namePassword;
    var options = {
        host: 'linux.domgoodw.in',
        port: 8080,
        path: path,
        method: 'GET',
        json:true,
        headers: {
        'Authorization': 'Basic ' + namePassword
        }
    };     

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            var jsonChunk = JSON.parse(JSON.stringify(chunk));
            var data = JSON.parse(chunk);
            cb(data);
        });
    });
    req.end();
};

httpRequest('/rest/api/2/project', function(data){
        console.log(data[0].name + 'dom is gay');
    }
);







