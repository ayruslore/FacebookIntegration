'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const apiaiApp = require('apiai')('9afd07100b9a4f27ae0f03eda9e3c752');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

// The rest of the code implements the routes for our Express server.
let app = express();
let aiText="";
let biText={};
let flag = 0;

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
          sendMessage(event);
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
//whenever we have something we can tell about we'll drag them to our recommendation engine
//recommend.specials,recommend.dish
//if(response.result.action==recommend.dish || recommend.result.action==recommend.specials ){
  //  console.log("enter");
    //conditions
    //aiText="Would you like to tell us more about area or specific restuarant? Recommendation engine";
    console.log("here");
 if( response.result.action==='recommend.specials'){
   //cards
   console.log("1");

  }
  else if(response.result.action==='recommend.dish'){
   //cards
   console.log("2");
  }
  else if(response.result.action==='order.webview'){
   	console.log("3");


    sendButton(sender);
    //open webview
    console.log("here there");

    //receivedMessage(event);
  }
  else if(response.result.action==='order.dish'){
    console.log(response.result.parameters.Dish);
     var arr,number,key;
     var query={};
     key= sender.toString();
    MongoClient.connect(url, function(err, db) {
   if (err) throw err;
  /*  db.createCollection("customers",function(err,res){
     if(err) throw err;
     console.log("Table created");
   });*/
     
     query[key]="id";
     console.log("query",query);
     db.collection("customers").find(query).toArray(function(err,result){
     if(err) throw err;
     if(result.length!=0){
      console.log("found app");
      console.log(result);
     }
     else{
      console.log("create");
      arr=response.result.parameters.Dish;
      number=response.result.parameters.number;
      key= sender.toString();
      var myobj= {order:arr,quantity:number};
      myobj[key]="id";
      db.collection("customers").insertOne(myobj,function(err,res){
       if(err) throw err;
       console.log("inserted");
       myobj[key]="id";
     db.collection("customers").insertOne(myobj,function(err,res){
       if(err) throw err;
       console.log("inserted");
   });
   });
     }
   })
     //var myobj= {order:arr,quantity:number};
    // myobj[key]="id";
     /*db.collection("customers").insertOne(myobj,function(err,res){
       if(err) throw err;
       console.log("inserted");
   });*/
  /* db.collection("customers").find({}).toArray(function(err,result){
     if(err) throw err;
     console.log(result);
   })*/
 /* if(typeof db.customers.find( {key : { $exists: false } } )==undefined){
    console.log("mil gyA");
  }
    else{console.log(db.customers.find( {key : { $exists: false } } ));
  }*/
  console.log("query result");
  /* var query={};
   query['123']="id";
   db.collection("customers").find(query).toArray(function(err,result){
     if(err) throw err;
     console.log(result);
   })*/
   //console.log("Database created!");
  // db.close();
 });
  	console.log("4");
  }
 else if(response.result.action==='show.menu'){
  	//webview
  	sendButton(sender);
  	console.log("5");
  }

  else {

  aiText = response.result.fulfillment.speech;
  console.log(typeof aiText);
  console.log(flag);
 // }
  console.log(aiText);

  //  console.log("sdfvgbh");
    //if(flag==0){
      console.log(flag);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:'EAAGeBZBDgxFUBACwjKomnFPMwZB1CkbsCi4Wr1Ko63wgks475kJUZC0CZAY5cII91wuZAfJrdbDYFODIqACQxUCNDZAJ9CI9S3RgEwxP2le2eK9t8FEPpUlMSfYO3oDWo8piM2HT7b9RhKZAonIDT3ZBSFEQ00rPObB6VZBuaimyNmAZDZD' },
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
   // sendGenericMessage_getstarted(senderID,messageText);

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    //sendGenericMessage_getstarted(senderID,messageText);
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID,messageText);
        break;
     case 'Show menu':
        sendGenericMessage_rolls(senderID,messageText);

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


//postback and payload
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

function sendGenericMessage(recipientId) {
  //console.log(event.message.text);
  var messageData = {

   recipient :{
      id: recipientId
    },
    message: {    text:"What do you like to have?",
    quick_replies:[
      {
        content_type:"text",
        title:"Show menu",
        payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED",
        image_url:"http://assets.limetray.com/assets/user_images/menus/compressed/1464758471_Chicken-Tikka-Roll.jpg",
        //url:"http://petershats.parseapp.com/hat-news",
       // webview_height_ratio:"full"
      },



          ]
  }
};
  callSendAPI(messageData);
//  console.log("before if conditon");
//  console.log(event.message.text);

}

function sendButton(recipientId){
  var messageData={recipient:{
    id:recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"button",
        text:"What do you want to do next?",
        buttons:[
          {
            type:"web_url",
            url:"http://babadadhaba.co/",
            title:"Show menu",
            webview_height_ratio:"tall"
          }
        ]
      }
    }
  }
}; callSendAPI(messageData);
}



function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAGeBZBDgxFUBACwjKomnFPMwZB1CkbsCi4Wr1Ko63wgks475kJUZC0CZAY5cII91wuZAfJrdbDYFODIqACQxUCNDZAJ9CI9S3RgEwxP2le2eK9t8FEPpUlMSfYO3oDWo8piM2HT7b9RhKZAonIDT3ZBSFEQ00rPObB6VZBuaimyNmAZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
     var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId,recipientId);
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
