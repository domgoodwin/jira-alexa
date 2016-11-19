// Alexa Skill prototype and helper functions
// https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/JiraAlexa/src/AlexaSkill.js 
var AlexaSkill = require('./AlexaSkill');
var http = require('http');
var localVariables = require('./localVariables');

// App ID for skill
var APP_ID = localVariables.appID;

// Jira-alexa 
var JiraAlexa = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
JiraAlexa.prototype = Object.create(AlexaSkill.prototype);
JiraAlexa.prototype.constructor = AlexaSkill;

JiraAlexa.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session){
    console.log("JiraAlexa onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // Initilisation logic
};

JiraAlexa.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("JiraAlexa onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Jira tools, what do you want?";
    var repromptText = "Hello?";
    response.ask(speechOutput, repromptText);
};

JiraAlexa.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("JiraAlexa onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

// Intents
JiraAlexa.prototype.intentHandlers = {
    "GetAllProjects": function (intent, session, response){
        
        httpRequest('/rest/api/2/project', function(data){
            //console.log(data[0].name + 'dom is gay');
            var speechOutput = "Dominic, these are the available projects: ";
            for(var i = 0; i < data.length; i++) {
                speechOutput += data[i].name + ", ";
                console.log(data[i].name);
            }
            response.tellWithCard(speechOutput, "Card title", "Card test" );
        });

    },
    "AMAZON.HelpIntent": function (intent, session, response){
        response.ask("DO something", "Do something");
    }
};

// Response handler
exports.handler = function (event, context) { 
    var jiraAlexa = new JiraAlexa();
    jiraAlexa.execute(event, context);
};

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

