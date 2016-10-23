'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = "amzn1.ask.skill.39f91b9f-9c19-4290-a96c-f0880f16713a";
var SKILL_NAME = 'Zubair facts';

/**
 * Array containing space facts.
 */
var FACTS = [
    "Zubair's middle name is Saleem",
    "Zubair goes home to aston every week",
    "Zubair and Ryan once shared a bed for a month",
    "Zubair enjoys long walks on the beach",
    "The only person Zubair loves is himself",
    "Zubair has a micro penis",
    "Zubair has a PHD in gwack"
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {
        // Get a random space fact from the space facts list
        var factIndex = Math.floor(Math.random() * FACTS.length);
        var randomFact = FACTS[factIndex];

        // Create speech output
        var speechOutput = "Here's your fact: " + randomFact;

        this.emit(':tellWithCard', speechOutput, SKILL_NAME, randomFact)
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "You can say tell me a space fact, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }
};