// Alexa Skill prototype and helper functions
// https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/JiraAlexa/src/AlexaSkill.js 
var AlexaSkill = require('./AlexaSkill');
var http = require('http');
// var moment = require('moment');
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
    var speechOutput = "Hi, my name is jo, and I am your jeerra assistant" +
    "I can do the following" +
    "Get information on Jeerra issues" +
    "Get information on Jeerra sprints or boards" ;
    var repromptText = "Hello, is it me you're looking for?";
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
        
        httpRequest('/rest/api/2/project', 'GET', function(data){
            //console.log(data[0].name + 'dom is gay');
            var speechOutput = "The projects available to you are: ";
            for(var i = 0; i < data.length; i++) {
                speechOutput += data[i].name + ", ";
                console.log(data[i].name);
            }
            response.tellWithCard(speechOutput, "Card title", "Card test" );
        });

    },
    "GetAllBoards": function (intent, session, response){
        
        httpRequest('/rest/agile/1.0/board', 'GET', function(data){
            var speechOutput = "These are the current boards: ";
            for(var i = 0; i < data.values.length; i++) {
                speechOutput += data.values[i].name + ", ";
                console.log(data.values[i].name);
            }
            response.tellWithCard(speechOutput, "Card title", "Card test" );
        });

    },
    "GetInformationOnIssue": function (intent, session, response){
        //TODO get rid of hard coded EJB
        httpRequest('/rest/agile/1.0/issue/EJB-' + intent.slots.Issue.value, 'GET', function(data){
            console.log(data.fields.description);
            var description = data.fields.description;
            var story = data.fields.summary;
            if(description === null){
                description = "currently blank"
            }
            var speechOutput = story + ". The description of this issue is " + description + ". It is estimated to be " 
            + data.fields.customfield_10006 + " story points. Currently assigned to " + data.fields.assignee.name  ;
            response.tellWithCard(speechOutput, "Card title", "Card test" );
        });

    },
    "GetIssuesAssignedToMe": function (intent, session, response){
        //TODO get rid of hard coded EJB (1)
        var boardID = '1';
        httpRequest('/rest/agile/1.0/board/' + boardID + '/issue', 'GET', function(data){
            var speechOutput = "The issues assigned to you on the board " + boardID + " are: ";
            for(var i = 0; i < data.issues.length; i++) {
                var issue = data.issues[i].fields;
                if(issue.assignee.name === 'ethan'){
                    speechOutput += data.issues[i].key + ", ";
                    console.log(data.issues[i].key);
                }
            }
            response.tellWithCard(speechOutput, "Card title", "Card test" );
        });

    },
    "GetSprintDaysRemaining" : function (intent, session, response){
        //TODO get rid of hard coded EJB (1)
        var boardID = '1';

        var oneDay = 24*60*60*1000;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;

        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
        var today = mm+'/'+dd+'/'+yyyy;
        var todayDate = new Date(Date.parse(today));
        console.log(todayDate);
        var daysRemaining;

        httpRequest('/rest/agile/1.0/board/' + boardID + '/sprint', 'GET', function(data){
            var speechOutput = "";
            for(var i = 0; i < data.values.length; i++) {
                if(data.values[i].state === "active"){
                    console.log(data.values[i].name);

                    var sprintEndDate = new Date(Date.parse(data.values[i].endDate));
                    console.log(sprintEndDate);

                    // daysRemaining = Math.round(Math.abs((sprintEndDate.getTime() - todayDate.getTime())/(oneDay)));
                    daysRemaining = Math.floor((sprintEndDate - todayDate)/(oneDay));
                    console.log(daysRemaining);
                    speechOutput = "There are " + daysRemaining + " days remaining.";

                }else{
                    console.log("No active sprints");
                    speechOutput = "There are no active sprints."
                }
                
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

function httpRequest(path, method, cb){
    namePassword = localVariables.namePassword;
    var options = {
        host: 'linux.domgoodw.in',
        port: 8080,
        path: path,
        method: method,
        json:true,
        headers: {
        'Authorization': 'Basic ' + namePassword
        }
    };     
    console.log('Requested path: ' + path);
    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', (chunk) => rawData += chunk)
        res.on('end', () => {
            console.log('BODY: ' + rawData);
            var jsonChunk = JSON.parse(JSON.stringify(rawData));
            var data = JSON.parse(rawData);
            cb(data);
        });
    });
    req.end();
};
