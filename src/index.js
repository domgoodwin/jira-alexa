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
    var speech = "<speak>Hi, my name is Dave <break time=\"0.4s\"/> I am your jeera assistant <break time=\"0.4s\"/> I can do the following <break time=\"0.4s\"/> Get information on jeera issues <break time=\"0.4s\"/> Get information on jeera sprints or boards</speak>"
    var speechOutput = {
        speech: speech,
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptText = "What is it you would like me to do?";
    response.ask(speechOutput, repromptText);
};

JiraAlexa.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("JiraAlexa onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};


// Intents
JiraAlexa.prototype.intentHandlers = {
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.tell("Launch me again to here what I can do");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },
    "GetAllProjects": function (intent, session, response){
        
        httpRequest('/rest/api/2/project', 'GET', function(data){
            //console.log(data[0].name + 'dom is gay');
            var speechOutput = "The projects available to you are: ";
            for(var i = 0; i < data.length; i++) {
                speechOutput += data[i].name + ", ";
                console.log(data[i].name);
            }
            response.tellWithCard(speechOutput, "Available projects", speechOutput);
        });

    },
    "GetAllBoards": function (intent, session, response){
        
        httpRequest('/rest/agile/1.0/board', 'GET', function(data){
            var speechOutput = "These are the current boards: ";
            for(var i = 0; i < data.values.length; i++) {
                speechOutput += data.values[i].name + ", ";
                console.log(data.values[i].name);
            }
            response.tellWithCard(speechOutput, "Available boards", speechOutput );
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
            response.tellWithCard(speechOutput, "Information on issue " + intent.slots.Issue.value.toString() + " on EJB board", speechOutput);
        });

    },
    "GetIssuesAssignedToMe": function (intent, session, response){
        //TODO get rid of hard coded EJB (1)
        var boardID = '1';
        httpRequest('/rest/agile/1.0/board/' + boardID + '/issue', 'GET', function(data){
            var speechOutput = "The issues assigned to you on the board " + boardID + " are: ";
            for(var i = 0; i < data.issues.length; i++) {
                var issue = data.issues[i].fields;
                if(issue.assignee != null){
                    if(issue.assignee.name === 'ethan'){
                        speechOutput += data.issues[i].key + ", ";
                        console.log(data.issues[i].key);
                }
                }

            }
            response.tellWithCard(speechOutput, "Issue assigned to you", speechOutput);
        });

    },
    "GetStatusIssues": function (intent, session, response){
        //TODO get rid of hard coded EJB (1)
        var boardID = '1';
        var status = intent.slots.Status.value;
        console.log(status);
        httpRequest('/rest/agile/1.0/board/' + boardID + '/issue', 'GET', function(data){
            var speechOutput = "The " + status + " on board " + boardID + " are: ";
            var issueCount = 0;
            for(var i = 0; i < data.issues.length; i++) {
                var issue = data.issues[i].fields;
                if(issue.status.name.toLowerCase() === status){
                    console.log(issue.status.name);
                    speechOutput += data.issues[i].key + ", ";
                    console.log(data.issues[i].key);
                    issueCount++;
                }
                if (i === data.issues.length - 1 && issueCount === 0){
                    speechOutput = "There are currently no " + status + " issues on board " + boardID;
                }
            }
            if(status === undefined){
                speechOutput = "I'm sorry. I did not recognise that status";
            }
            response.tellWithCard(speechOutput, "Jira " + status + " issues", speechOutput);
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
                if(data.values[i].state === "active")
                {
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
            response.tellWithCard(speechOutput, "Sprint information", speechOutput);
        });
    },
    "AddIssue": function (intent, session, response){
        //TODO remove hard coded project ID
        var issueText = intent.slots.IssueText.value;
        console.log(issueText);
        var postOptions = {
            fields: {
                project:{
                    id:10000
                },
                issuetype: {
                    id: 10002,
                    description: 'gh.issue.story.desc',
                    name: 'Story',
                    subtask: false
                },
                summary: issueText
		    }
        }
        console.log(JSON.stringify(intent));
        httpRequestPOST('/rest/api/2/issue', 'POST', postOptions, function(data){
            var speechOutput;
            if(data.id === undefined){
                speechOutput = "Unable to add story due to " + data.errors;
            }
            else{
                speechOutput = "User story added, ID of user story is: " + data.id;
            }
            response.tellWithCard(speechOutput, "New story added to EJB", issueText );
        });

    },
    "GetStoryPointsRemainingInSprint": function (intent, session, response){
        //TODO get rid of hard coded EJB (1)
        var boardID = '1';
        //TODO function to get sprintID from active sprint
        var sprintID = '3';
        var storyPointTotal = 0;
        var speechOutput = "";

        httpRequest('/rest/agile/1.0/board/'+ boardID + '/sprint/'+ sprintID + '/issue' , 'GET', function(data){
            console.log(data.issues[1].fields.status.name);
            for(var i = 0; i < data.issues.length; i++){
                var issue = data.issues[i].fields;
                console.log(issue.name);
                if(issue.status.name === 'To Do' || issue.status.name === 'In Progress'){
                    console.log(issue.status.name);
                    console.log(issue.customfield_10006);
                    storyPointTotal += parseInt(issue.customfield_10006);
                    console.log(storyPointTotal);
                }
            }
            speechOutput = "There are " + storyPointTotal + " story points remaining";

            response.tellWithCard(speechOutput, "Board 1: Sprint 3 information", speechOutput);
        }); 
    },
    "WhosGoingToWin": function (intent, session, response){
        var speechOutput = "I am.";
        response.tellWithCard(speechOutput, "Winner of Tech Challenge 2016", speechOutput); 
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
function httpRequestPOST(path, method, postData, cb){
    namePassword = localVariables.namePassword;
    var options = {
        host: 'linux.domgoodw.in',
        port: 8080,
        path: path,
        method: method,
        json:true,
        headers: {
            'Authorization': 'Basic ' + namePassword,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };     
    console.log('Data: ' + JSON.stringify(postData));
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
    req.write(postData);
    req.end();
};
