'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";

// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'tuxedo_cat') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(messengerButton);
  res.end();
});

// Message processing
app.post('/', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
      //    receivedPostback(event);
        } else if (event.postback) {
          receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      //  receivedPostback(event);
      });

    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});


//function to call api.ai
function sendMessage(event){
let sender=event.sender.id;
let text=event.message.text;

let apiai = apiaiApp.textRequest(text, {
    sessionId: sender // use any arbitrary id
  });


//sending response to facebook 
  apiai.on('response', (response) => {
  console.log(response);
  
if(response.result.action ){
    console.log("enter");
    //conditions
    aiText="wwait";
  if( response.result.parameters.area  ){
    flag=1;
      var Client = require('node-rest-client').Client;
 
var client = new Client();
 
// direct way 
client.get("http://localhost:8080/area/Banashankari", function (data, response) {
    // parsed response body as js object 
    var result="";
    //console.log(data);
   // aiText="wait";
    for(x in data){
      console.log(x);
      //console.log(data[x]);
      //console.log(data[x].Name);
      //result +=x;
      console.log(result);
      aiText=x;
      request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:'EAAGKxD7nqdgBAAo1RQ7r0aymfy6VO0ZCQlVdX6zpUnoZC98qcZA5tdDjla9sZBz5BZBt8mRkZC2boI1Edt26FpEDEeNEYBDYvGogVQeBBNhYLQ8eg7DgmXUIEeAeSi9JamkhmcTrQ2MGtIl83ykCaGAZCmRxe3bgEN3OIlniiALPQZDZD' },
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
    }
//aiText="call";
    
   // aiText=r;

    // raw response 
   // console.log(response);
  // aiText="wait";
});

   flag=0;   
        
  }
}
  else {
  
  aiText = response.result.fulfillment.speech;
  console.log(typeof aiText);
  console.log(flag);
  }
 // console.log(aiText);

    console.log("sdfvgbh");
    if(flag==0){
      console.log(flag);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:'EAAGKxD7nqdgBAAo1RQ7r0aymfy6VO0ZCQlVdX6zpUnoZC98qcZA5tdDjla9sZBz5BZBt8mRkZC2boI1Edt26FpEDEeNEYBDYvGogVQeBBNhYLQ8eg7DgmXUIEeAeSi9JamkhmcTrQ2MGtIl83ykCaGAZCmRxe3bgEN3OIlniiALPQZDZD' },
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
  }
  
 });



  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}




// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
//  sendGenericMessage_persistent(senderID,messageText);
    sendGenericMessage_getstarted(senderID,messageText);

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    //sendGenericMessage_getstarted(senderID,messageText);
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID,messageText);
        break;
     case 'Rolls':
        sendGenericMessage_rolls(senderID,messageText);

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

//////////////////////////
// Sending helpers
//////////////////////////
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

//persistent menu
function sendGenericMessage_persistent(recipientId,text){
  var messageData={ recipient: {
    id:recipientId
  }, persistent_menu:[
    {
      locale:"default",
      composer_input_disabled:true,
      call_to_actions:[
        {
          title:"My Account",
          type:"nested",
          call_to_actions:[
            {
              title:"Pay Bill",
              type:"postback",
              payload:"PAYBILL_PAYLOAD"
            },
            {
              title:"History",
              type:"postback",
              payload:"HISTORY_PAYLOAD"
            },
            {
              title:"Contact Info",
              type:"postback",
              payload:"CONTACT_INFO_PAYLOAD"
            }
          ]
        },
        {
          "type":"web_url",
          "title":"Latest News",
          "url":"http://petershats.parseapp.com/hat-news",
          "webview_height_ratio":"full"
        }
      ]
    },
    {
      "locale":"zh_CN",
      "composer_input_disabled":false
    }
  ]
}; callSendAPI(messageData);
}


//get sendGenericMessage_getstarted
function sendGenericMessage_getstarted(recipientId,text){
  var messageData ={
    setting_type:"call_to_actions",
    thread_state:"new_thread",
    call_to_actions:[
      {payload:"USER_DEFINED_PAYLOAD"
    }
  ]
  };
  callSendAPI(messageData);
}

function sendGenericMessage(recipientId,text) {
  //console.log(event.message.text);
  var messageData = {

   /* recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{

            title: "Veg-Rolls",
           // subtitle: "Next-generation virtual reality",
            //item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://assets.limetray.com/assets/user_images/menus/compressed/1464758752_Paneer-Tikka-Roll.jpg",
            //webview_height_ratio: "compact",
            buttons: [{
              type: "web_url",
              url: "http://babadadhaba.co/order-online",
              title: "buy"
            }, {
              type: "postback",
              title: "View more",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "Veg-Rolls",
            //subtitle: "Your Hands, Now in VR",
            //item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://assets.limetray.com/assets/user_images/menus/compressed/1464758471_Chicken-Tikka-Roll.jpg",
            buttons: [{
              type: "web_url",
              url: "http://babadadhaba.co/order-online",
              title: "buy"
            }, {
              type: "postback",
              title: "View more",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }*/
  recipient:{
    id:recipientId
  },
  message:{
    text:"What do you like to have?",
    quick_replies:[
      {
        content_type:"text",
        title:"Rolls",
        payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED",
        image_url:"http://assets.limetray.com/assets/user_images/menus/compressed/1464758471_Chicken-Tikka-Roll.jpg"
      },
      {
        content_type:"text",
        title:"Shakes",
        payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN",
        image_url:"http://assets.limetray.com/assets/user_images/menus/compressed/1464758752_Paneer-Tikka-Roll.jpg"
      },
      {
        content_type:"text",
        title:"Wraps",
        payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN",
        image_url:"http://assets.limetray.com/assets/user_images/menus/compressed/1464758752_Paneer-Tikka-Roll.jpg"
      }
    ]
  }
  };

  callSendAPI(messageData);
//  console.log("before if conditon");
//  console.log(event.message.text);

}

function sendGenericMessage_rolls(recipientId,text){
  var messageData = {
   recipient: {
     id: recipientId
   },
   message: {
     attachment: {
       type: "template",
       payload: {
         template_type: "generic",
         elements: [{

           title: "Veg-Rolls",
          // subtitle: "Next-generation virtual reality",
           //item_url: "https://www.oculus.com/en-us/rift/",
           image_url: "http://assets.limetray.com/assets/user_images/menus/compressed/1464758752_Paneer-Tikka-Roll.jpg",
           //webview_height_ratio: "compact",
           buttons: [{
             type: "web_url",
             url: "http://babadadhaba.co/order-online",
             title: "buy"
           }, {
             type: "postback",
             title: "View more",
             payload: "Payload for first bubble",
           }],
         }, {
           title: "Veg-Rolls",
           //subtitle: "Your Hands, Now in VR",
           //item_url: "https://www.oculus.com/en-us/touch/",
           image_url: "http://assets.limetray.com/assets/user_images/menus/compressed/1464758471_Chicken-Tikka-Roll.jpg",
           buttons: [{
             type: "web_url",
             url: "http://babadadhaba.co/order-online",
             title: "buy"
           }, {
             type: "postback",
             title: "View more",
             payload: "Payload for second bubble",
           }]
         }]
       }
     }
}
};
callSendAPI(messageData);

}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAKnsCdK7eEBAOiPgHttwikrkuY2k8NblM4vG3WyQiu7Wo8XdPcpYeNun5LTZBhS7XXmqFdUbKP0dchTWTVyH595VNRsjtUt021qmoxiZBDlmUjHtJOjdZBgwAniW7Nu5iMhNMNRga6FWhxEm56fAfmBQPsVDoRZA5Mx6bb4IwZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 5000, function () {
  console.log("Listening on port %s", server.address().port);
}); 