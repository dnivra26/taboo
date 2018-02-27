'use strict';

const data = require('data.json')
const keys = require('lodash/keys');
const sample = require('lodash/sample');

exports.handler = function (event, context) {
    try {
        if (event.session.new) {
    		console.log("onSessionStarted requestId=" + event.request.requestId+ ", sessionId=" + event.session.sessionId);        
        }

        switch(event.request.type) {
        	case "LaunchRequest": {
        		const output = buildResponseText("Let the game begin. Say start game", false)
    			context.succeed(buildResponse(event.session.attributes, output));
        		break;	
        	}
        	case "IntentRequest": {
        		console.log("Intent number 1 - request");
        		console.log(JSON.stringify(event.request));
        		console.log("Intent number 2 - session");
        		console.log(JSON.stringify(event.session));
        		const output = handleIntent(event, context);
	    		context.succeed(buildResponse(event.session.attributes, output));
	        	break;	
        	}
        	case "SessionEndedRequest": {
        		context.succeed();
        		break;	
        	}
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function handleIntent(event, context) {
	const request = event.request;
	const session = event.session;
	const intentName = request.intent.name;
	switch(intentName) {
		case "startgame": {
			const objectKeys = keys(data);
			const keyToPick = sample(objectKeys);
			const object = data[keyToPick];
			console.log('object picked', object);
			const output = buildResponseSynonyms(object['synonyms']);
			context.succeed(buildResponse({key: keyToPick}, output));
			break;
		}
		case "answer": {
			const attributes = session.attributes;
			const object = data[attributes.key]
			const word = object.word;
			const userAnswer = request.intent.slots.answers.value;
			console.log('actual answer', word);
			console.log('users answer', userAnswer);
			if(word.trim().toLowerCase() == userAnswer.trim().toLowerCase()) {
				const output =  buildResponseText("right answer", true);
				context.succeed(buildResponse({}, output));
			}else {
				const output =  buildResponseText("wrong answer", true);
				context.succeed(buildResponse({}, output));
			}
			
		}
		case "AMAZON.CancelIntent":
		case "AMAZON.StopIntent": {
			const output =  buildResponseText("bye bye", true);
			context.succeed(buildResponse({}, output));
			break;
		}
		case "AMAZON.HelpIntent": {
			const helpText = "I will give you a list of four words. Respond with a word which relates to these four words, for example, answer is pirate. To start a new game, say, start game. Would you like to keep playing?"
			const output =  buildResponseText(helpText, false);
			context.succeed(buildResponse(session.attributes, output));
			break;
		}
		case "AMAZON.YesIntent": {
			const attributes = session.attributes;
			console.log('YesIntent', attributes, attributes.key);
			if(attributes.key == null) {
				const objectKeys = keys(data);
				const keyToPick = sample(objectKeys);
				const object = data[keyToPick];
				console.log('object picked', object);
				const output = buildResponseSynonyms(object['synonyms']);
				context.succeed(buildResponse({key: keyToPick}, output));
			} else {
				const keyToPick = attributes.key;
				const object = data[keyToPick];
				console.log('object picked', object);
				const output = buildResponseSynonyms(object['synonyms']);
				context.succeed(buildResponse({key: keyToPick}, output));
			}
			break;
		}

	} 
}

function buildResponseText(text, endSession) {
	return {
	        outputSpeech: {
	            type: "PlainText",
	            text: text
	        },
	        shouldEndSession: endSession
		}
}


function buildResponseSynonyms(synonyms) {
	const output = `<speak>${synonyms.map(synonym => `${synonym} <break time="1s"/>`)}</speak>`;
	console.log('ssml output', output);
	return {
	        outputSpeech: {
	            type: "SSML",
	            ssml: output
	        },
	        shouldEndSession: false
		}
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
