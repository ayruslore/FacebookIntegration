const express = require('express');
const bodyParser = require('body-parser');
var waitUntil = require('wait-until');
//import delay from 'await-delay'
var spawn = require('child_process').spawn;
  let aiText="";
  let biText={};
  let flag = 0;

const app = express();
const request=require('request');
const apiaiApp = require('apiai')('bb9a432bd74c4eb9a0c09d4fad70c030');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//facebook validation
app.get('/', (request, response) => {
  if (request.query['hub.mode'] ==='subscribe' && request.query['hub.verify_token'] === 'tuxedo_cat') {
    response.status(200).send(request.query['hub.challenge']);
  } else {
    response.status(403).end();
  }
});

/* Handling all messenges */
app.post('/', (request, response) => {
  console.log(request.body);
  if (request.body.object === 'page') {
    request.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
        console.log(event.message.text);
          sendMessage(event);
        }
      });
    });
    response.status(200).end();
  }
});


function sendMessage(event){
let sender=event.sender.id;
let text=event.message.text;

let apiai = apiaiApp.textRequest(text, {
    sessionId: sender // use any arbitrary id
  });


//sending response to facebook 
  apiai.on('response', (response) => {
  console.log(response);
  

    //conditions
  if( response.result.parameters.area  ){
      console.log('response.result.parameters.area');
  var process= spawn('python',['sim_score.py']);
      data=response.result.parameters.area;
      dataString='';
  // data=[response.result.parameters.area,response.result.parameters.Cuisines];
      //  aiText="call";
        //console.log(response.result.parameters.area)
       console.log("vaibhav");
       //flag=1;

     /*  function testfunc(){
         process.stdout.on('data',function(data){
                    dataString = data.toString();
                    biText=JSON.parse(dataString);
                    console.log("hello");
                    aiText=biText.name;
                    return aiText;
       });
     }
    waitUntil(5000,1, function testfunc() {
    return ((aiText!='') ? true : false);
}, function done(result) {
    // result is true on success or false if the condition was never met 
});*/
       
         // aiText="call";
         flag=1;
         process.stdout.on('data',function(data){
                  //  await delay(3000);
                    dataString = data.toString();
                    
                    biText=JSON.parse(dataString);
                    //console.log("hello");
                    aiText=biText.name;
                    console.log(dataString);
                    flag=0;
                    console.log(flag);
                     console.log(typeof aiText,aiText);
                   // return aiText;
       });
         //flag=0;
         console.log(typeof dataString);
        
         console.log(typeof biText,biText);
         
       //  aiText='hi';else===
     //  console.log('hi');
       
      process.stdin.write(JSON.stringify(data));
      process.stdin.end();
    //    console.log(aiText);
      
  }
  else {
  if(flag==0){
  aiText = response.result.fulfillment.speech;
  console.log(typeof aiText);
  }}
//}
  console.log("final");
  console.log(aiText);
  console.log(flag);
if(flag==0){
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:'EAAGRkVShrukBADNFMKXch5uNQYbp8rIFdbbTzdeZADcQbbwpFRqTT4xYlRcmaj1fITZCZAGkU2yUGhQ6FTS5CCwmHNNDpJrsUvBZClGcUZBFJVKJKmefD4ZBMUUP3gTpOpb8c4tjBdl4UP1hMXhoPI5QJ1JBmTiJj3Oik6DfkfwQZDZD' },
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

