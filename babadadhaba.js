    //dddwwd
    'use strict';
    const express = require('express');
    const bodyParser = require('body-parser');
    const request = require('request');
    const path = require('path');
    const apiaiApp = require('apiai')('9afd07100b9a4f27ae0f03eda9e3c752');
    var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
    var http = require('http');
    var Promise = require("bluebird");
    var request_1 = Promise.promisifyAll(require("request"));
    var activelink = 'https://bfe82c76.ngrok.io/';
    var recommendationLink = 'https://1971f758.ngrok.io/';
    let token = 'EAADg7MiZAzmsBANMOZBAAugezblf4xVZCIcvKxIRpZA1lMzYwkzEVtcDblold9MaZAAK1VcLZAIJ3lErqd8xjn9StJFI5N3e3eaT4lVeck2FpfTfQNqNGIefj6pm4EP6YqrCdJYqXBhjsKoTzZCa5rZCZCc0pqPU98BTLIUfVLkxPrwZDZD';


    // The rest of the code implements the routes for our Express server.
    let app = express();
    let aiText = "";
    let biText = {};
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
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(messengerButton);
        res.end();
    });

    app.get('/confirm', function(req, res) {
        //var paymentId=req.query.key;
        var userId = req.query.Id;
        console.log("got called");
        if (userId) {
            var operation = activelink + "get_new_receipt/" + JSON.stringify(req.query);
            callSendRedisapi("receipt", operation, userId, "nothing");
        }
    });

    app.get('/showcart', function(req, res) {
        //var paymentId=req.query.key;
        console.log(req.query);
        var userId = req.query.Id;
        var operation = activelink + "get_cart_price/" + req.query.Id;
        callSendRedis(operation, userId);
        //sendButton(userId,["postback","postback"], "What would you like?",["Show_cart","Confirm_order"],["Show Cart","Confirm order"],"tall");
    });

    app.get('/statusupdate', function(req, res) {
        //var paymentId=req.query.key;
        var userId = req.query.Id;
        var status = req.query.Status;
        if (status === 'accepted') {
            sendButton(userId, ["postback"], "Your order has been accepted.", ['check_status'], ["Check status"], "tall");
        } else if (status === 'in_kitchen') {
            sendButton(userId, ["postback"], "Your order is in the kitchen.", ['check_status'], ["Check status"], "tall");
        } else if (status === 'out_for_delivery') {
            sendButton(userId, ["postback"], "Your order is out for delivery. Your delivery boy can be contacted at: " + req.query.Dboy, ['check_status'], ["Check status"], "tall");
        } else if (status === 'delivered') {
            sendTextMessage(userId, "Your order has been delivered. Enjoy your meal :)");
        } else if (status === 'rejected') {
            sendTextMessage(userId, "You're not being served today.We'll contact you later!");
        }

    });

    // Message processing
    app.post('/', function(req, res) {
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
                        if (("quick_reply" in event.message) == true) {
                            QuickReplyParser(event.sender.id, event.message.quick_reply.payload);
                        } else if ("attachments" in event.message) {
                            if (event.message.attachments[0].type == "location") {
                                var link = activelink + event.sender.id + '/set_address/' + event.message.attachments[0].payload.coordinates.lat + ',' + event.message.attachments[0].payload.coordinates.long;
                                callSendRedisAddress(link, event.sender.id);
                            } else
                                console.log("other attachment");
                        } else {
                            sendMessage(event);
                        }
                    } else if (event.postback) {
                        receivedPostback(event);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
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
    function sendMessage(event) {
        let sender = event.sender.id;
        let text = event.message.text;
        let apiai = apiaiApp.textRequest(text, {
            sessionId: sender // use any arbitrary id
        });

        //sending response to facebook
        apiai.on('response', (response) => {
            console.log(response);
            //whenever we have something we can tell about we'll drag them to our recommendation engine
            //recommend.specials,recommend.dish

            if (response.result.action === 'recommend.specials') {
                //cards
                var final = recommendationLink + 'specials/' + sender;
                callrecommend(final, sender);
            } else if (response.result.action === 'recommend.dish') {
                //cards
                var vnv = 'k';
                if (response.result.parameters.vnv != '')
                    vnv = response.result.parameters.vnv;
                var bi = 'k';
                if (response.result.parameters.bi != '')
                    bi = response.result.parameters.bi;
                var cat = 'k';
                if (response.result.parameters.cat != '')
                    cat = response.result.parameters.cat;
                if ((vnv === 'k') && (bi === 'k') && (cat === 'k'))
                    var final = recommendationLink + sender + '/get_history_reco';
                else {
                    var final = recommendationLink + 'recommend/' + vnv + '/' + bi + '/' + cat +'/' +sender;
                }
                callrecommend(final, sender);
            } else if (response.result.action === 'order.webview') {
                var link = "http://genii.ai/activebots/Babadadhaba" + "?userId=" + sender;
                sendButton(sender, ["web_url"], "what would to like to have?", [link], ["Show Menu!"], "tall");
                //open webview
            } else if (response.result.action === 'input.welcome') {
                aiText = response.result.fulfillment.speech;
                var link = recommendationLink + "get_user_details/" + sender;
                callSendRedisapi("existing", link, sender, aiText);
            } else if (response.result.action === 'order.dish') {
                var dish = response.result.parameters.Dish;
                var quantity = response.result.parameters.number;
                var dict = {};
                var newdish = [];
                for (var j = 0; j < dish.length; j++) {
                    newdish[j] = dish[j].replace(/\s+/g, '_');
                }
                for (var i = 0; i < dish.length; i++) {
                    dict[newdish[i]] = quantity[i];
                }
                var myjson = JSON.stringify(dict);
                var add = 'cart/' + sender + '/add/' + myjson.toLowerCase();
                //callSendRedis(add);
                var final = activelink + add;
                aiText = response.result.fulfillment.speech;
                callSendRedisapi('add', final, sender, aiText);
            } else if (response.result.action === "process_card.process_card-selectnumber") {
                var dish = response.result.parameters.dish.replace(/\s+/g, '_');
                var number = response.result.parameters.number;
                var dict = {};
                dict[dish] = number;
                var myjson = JSON.stringify(dict);
                var finalDict = "";
                for (var i = 0; i < myjson.length; i++) {
                    if (myjson[i] === ' ')
                        finalDict += '_';
                    else
                        finalDict += myjson[i];
                }
                finalDict = finalDict.toLowerCase();
                var add = 'cart/' + sender + '/add/' + finalDict;
                var final = activelink + add;
                console.log(add);
                var reply = response.result.fulfillment.speech;
                //var reply="A "+ payload + " has been added";
                callSendRedisapi('add', final, sender, reply);
            } else if (response.result.action === 'show.menu') {
                //webview
                var operation=activelink+'menu_loc/'+sender;
                console.log(operation+'daa')
                callSendRedisapi('menu',operation,sender,"what would you like to have?");
              
            } else if (response.result.action === 'order.cancel') {
                //cancel
                var cancel = 'cart/' + sender + '/cancel';
                final = activelink + cancel;
                aiText = response.result.fulfillment.speech;
                callSendRedisapi('cancel', final, sender, aiText);
            } else if (response.result.action === 'order.remove') {
                //redis remove commmand
                var dish = response.result.parameters.Dish;
                var quantity = response.result.parameters.number;
                var dict = {};
                var newdish = [];
                for (var j = 0; j < dish.length; j++) {
                    newdish[j] = dish[j].replace(/\s+/g, '_');
                }
                for (var i = 0; i < dish.length; i++) {
                    dict[newdish[i]] = -quantity[i];
                }
                var myjson = JSON.stringify(dict);
                var add = 'cart/' + sender + '/add/' + myjson;
                var final = activelink + add;
                aiText = response.result.fulfillment.speech;
                callSendRedisapi('remove', final, sender, aiText);
            } else if (response.result.action === 'order.payment') {
                sendButton(sender, ["web_url"], 'Make the payment', ["http://genii.ai/activebots/Babadadhaba/payment.html?userid=" + sender], ["CASH ON DELIEVERY"], "tall");
            } else if (response.result.action === 'viewcart') {
                var show = 'get_cart_price/' + sender;
                var final = activelink + show;
                callSendRedis(final, sender);
            } else if (response.result.action === 'order.delete') {
                var final = activelink + 'cart/' + sender + '/cancel';
                aiText = response.result.fulfillment.speech;
                callSendRedisapi('cancel', final, sender, aiText);
            } else if (response.result.action === 'order.confirm') {
                aiText = response.result.fulfillment.speech;
               // sendTextMessage(sender, aiText);
                var show = 'get_cart_price/' + sender;
                var final = activelink + show;
                callSendRedisconfirm(final, sender);
            } else if (response.result.action === 'order.usuals') {
                aiText = response.result.fulfillment.speech;
                var link = recommendationLink + "get_user_details/" + sender;
                callSendRedisapi("existing_2", link, sender, aiText);
            } else if (response.result.action === 'Confirm.Confirm-yes') {
                CustomQuickreply(sender, "Please select a delivery address");
            } else if (response.result.action == 'input.unknown') {
                aiText = response.result.fulfillment.speech;
                var s = JSON.stringify(response.result.resolvedQuery);
                var link = recommendationLink + "log_message/" + s;
                callSendRedisapi("log", link, sender, aiText);
            } else {
                aiText = response.result.fulfillment.speech;
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: token
                    },
                    method: 'POST',
                    json: {
                        recipient: {
                            id: sender
                        },
                        message: {
                            text: aiText
                        }
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


    function receivedPostback(event) {
        var sender = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback
        var payload = event.postback.payload;

        console.log("Received postback for user %d and page %d with payload '%s' " +
            "at %d", sender, recipientID, payload, timeOfPostback);

        // When a postback is called, we'll send a message back to the sender to
        // let them know it was successful
        // sendTextMessage(sender, "Postback called");
        if (payload) {
            // If we receive a text message, check to see if it matches a keyword
            // and send back the template example. Otherwise, just echo the text we received.
            //sendGenericMessage_getstarted(sender,messageText);
            switch (payload) {
                case 'check_status':
                    var link = activelink + "cart/" + sender + "/status";
                    console.log("1_checkstatus");
                    console.log(link);
                    callSendRedisapi('status', link, sender, "Your order status is: ");
                    break;
                case 'Confirm_Yes':
                    var link = activelink + "is_carts/" + sender;
                    callSendRedisapi('iscart', link, sender, "Please choose your delivery address");
                    break;
                case 'Confirm_bypass':
                    var operation = activelink + 'bypass_payments/' + sender;
                    callSendRedisapi('receipt', operation, sender, aiText)
                    break;
                case 'GET_STARTED_PAYLOAD':
                    console.log("greeting2");
                    var link = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + token;
                    callSendRedisapi('greeting', link, sender, aiText);
                    break;
                case 'Show_specials':
                    var final = recommendationLink + 'specials/'+sender;
                    callrecommend(final, sender);
                    break;
                case 'Recommend':
                    callrecommend(recommendationLink + sender + '/get_history_reco', sender);
                    break;
                case 'Confirm_order':
                    var show = 'get_cart_price/' + sender;
                    var final = activelink + show;
                    callSendRedisconfirm(final, sender);
                    break;
                case 'Clear_cart':
                    var cancel = 'cart/' + sender + '/cancel';
                    final = activelink + cancel;
                    aiText = 'Your cart has been cleared. Is there anything else I can help you with?';
                    callSendRedisapi('cancel', final, sender, aiText);
                    break;
                case 'Show_cart':
                    var show = 'get_cart_price/' + sender;
                    var final = activelink + show;
                    callSendRedis(final, sender);
                    break;
                default:
                    console.log(payload);
                    SpecialIntents(payload, sender);
                    break;
            }
        }
    }

    //postback and payload

    function SpecialIntents(payload, sender) {
        let apiai = apiaiApp.textRequest(payload, {
            sessionId: sender // use any arbitrary id
        });
        //sending response to facebook
        apiai.on('response', (response) => {
            console.log(response.result.action);
            if (response.result.action === "save.address") {
                aiText = response.result.fulfillment.speech;
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: token
                    },
                    method: 'POST',
                    json: {
                        recipient: {
                            id: sender
                        },
                        message: {
                            text: aiText
                        }
                    }
                }, (error, response) => {
                    if (error) {
                        console.log('Error sending message: ', error);
                    } else if (response.body.error) {
                        console.log('Error: ', response.body.error);
                    }
                });
            } else if (response.result.action === "process.card") {
                console.log(response.result);
                aiText = response.result.fulfillment.speech;
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: token
                    },
                    method: 'POST',
                    json: {
                        recipient: {
                            id: sender
                        },
                        message: {
                            text: aiText
                        }
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

    function QuickReplyParser(sender, payload) {
        console.log(payload);
        if (payload === 'Recommend') {
            callrecommend(recommendationLink + sender + '/get_history_reco', sender);
        } else if (payload === 'Show_menu') {
            var link = "http://genii.ai/activebots/Babadadhaba" + "?userId=" + sender;
            sendButton(sender, ["web_url"], "what would to like to have?", [link], ["Show Menu!"], "tall");
        } else if (payload === 'Show_cart') {
            var show = 'get_cart_price/' + sender;
            var final = activelink + show;
            callSendRedis(final, sender);
        } else if (payload === 'Clear_cart') {
            var cancel = 'cart/' + sender + '/cancel';
            final = activelink + cancel;
            aiText = 'Your cart has been cleared. Is there anything else I can help you with?';
            callSendRedisapi('cancel', final, sender, aiText);
        } else if (payload === 'Confirm_order') {
            aiText = "Do you want to confirm this order?";
            sendTextMessage(sender, aiText);
            var show = 'get_cart_price/' + sender;
            var final = activelink + show;
            callSendRedisconfirm(final, sender);
        } else if (payload === 'Confirm_yes') {
            CustomQuickreply(sender, "Please choose your delivery address");
        } else if (payload.search('Payment') >= 0) {
            var lat = payload.search('Lat:');
            var long = payload.search(', Long: ');
            var end = payload.search('}');
            var latval = payload.substring(lat + 4, long);
            var longval = payload.substring(long + 8, end);
            var link = activelink + sender + '/set_address/' + latval + ',' + longval;
            console.log(link);
            console.log("Hi" + payload);
            callSendRedisAddress(link, sender);
            //callSendRedisapi("payment",sender,link,"How would you like to pay?");
        } else if (payload === "order_status") {
            console.log("dfghj");
            var link = activelink + sender + '/set_address/' + JSON.stringify(payload.replace(/\s+/g, '_'));
            var operation = activelink + "cart/" + sender + "/status";
            console.log(operation);
            callSendRedisapi("orderstatus", operation, sender, "nothing");
            //sendTextMessage(sender,res.body);
            //sendQuickreply(sender,".",["Check Status"],["order_status"]);
        } else if (payload.search('Save_address') >= 0) {
            console.log("address saving");
            if (payload.search('Location1') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc1/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else if (payload.search('Location2') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc2/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else if (payload.search('Location3') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc3/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else if (payload.search('Location4') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc4/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else {
                var title = ["Address1", "Address2", "Address3", "Address4"];
                var payloadArr = ["Location1_" + payload, "Location2_" + payload, "Location3_" + payload, "Location4_:" + payload];
                sendQuickreply(sender, "Save it as", title, payloadArr);
            }
        }
            else if(payload==='set_saved_address'){
                var link=activelink+'use_saved/'+sender
                callSendRedisAddress(link,sender)
            }
        console.log(payload);
    }

    function CustomQuickreply(recipientId, text, flag) {
        console.log(text);
        if(flag==1){
        var messageData = {
            "recipient": {
                "id": recipientId
            },
            "message": {
                "text": text,
                "quick_replies": [{
                    "content_type": "location",
                }]
            }
        };
        }
        else{
             var messageData = {
            "recipient": {
                "id": recipientId
            },
            "message": {
                "text": text,
                "quick_replies": [{
                    "content_type": "location",
                },
                {content_type: "text",
                title: 'Saved Address',
                payload: 'set_saved_address'}
                ]
            }
        };
        }
        callSendAPI(messageData);
    }

    function sendQuickreply(recipientId, text, title, payload) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: text,
                quick_replies: []
            }
        };
        var filler;
        for (var i = 0; i < title.length; i++) {
            filler = {
                content_type: "text",
                title: title[i],
                payload: payload[i]
            };
            messageData.message.quick_replies.push(filler);
        }
        callSendAPI(messageData);
    }

    function sendButton(recipientId, type, text, payload, caption, size) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: [

                        ]
                    }
                }
            }
        };
        var filler;
        for (var i = 0; i < type.length; i++) {
            if (type[i] === "web_url") {
                filler = {
                    type: type[i],
                    title: caption[i],
                    url: payload[i],
                    webview_height_ratio: size
                };
                messageData.message.attachment.payload.buttons.push(filler);
            } else if (type[i] === "postback") {
                filler = {
                    type: type[i],
                    title: caption[i],
                    payload: payload[i],
                };
                messageData.message.attachment.payload.buttons.push(filler);
            }
        }
        callSendAPI(messageData);
    }


    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function dataRequest(recipientId, titles, images) {
        var title = titles;
        var imageurl = images;
        var cards = new Array(title.length);
        var string;
        var i;
        for (var j = 0; j < titles.length; j++) {
            title[j] = toTitleCase(titles[j].replace(/_/g, ' '));
        }
        for (i = 0; i < title.length; i++) {
            string = makeJson(title[i], imageurl[i]);
            cards[i] = string;
        }
        console.log(cards);
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: cards
                    }
                }
            }
        };
        //console.log(messageData);
        // console.log(messageData.message.attachment.payload);
        callSendAPI(messageData);
    }




    function sendReciept(recipientID, newdiscount, name, total, titles, quantity, price, address, Name, Num, cartId) {
        var cards = new Array(titles.length);
        var string;
        var i;
        for (var j = 0; j < titles.length; j++) {
            titles[j] = toTitleCase(titles[j].replace(/_/g, ' '));
        }
        for (i = 0; i < titles.length; i++) {
            string = makeJsonreceipt(titles[i], quantity[i], price[i]);
            cards[i] = string;
        }
        var messageData;
        if (newdiscount != 0) {
            messageData = {
                "recipient": {
                    id: recipientID
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "receipt",
                            recipient_name: Name,
                            order_number: cartId,
                            currency: "INR",
                            payment_method: "Cash/Card on Delievery",
                            order_url: "http://genii.ai/policy/ActiveBots/Babadadhaba/Admin",
                            timestamp: "1428444852",
                            elements: cards,
                            address: {
                                street_1: address,
                                street_2: "\n",
                                city: "Phone-number",
                                postal_code: Num,
                                state: " : ",
                                country: "India"
                            },
                            summary: {
                                subtotal: total,
                                shipping_cost: 0.00,
                                total_tax: 0.00,
                                total_cost: total - newdiscount
                            },
                            adjustments: [{
                                name: "Bot Offer",
                                amount: newdiscount
                            }]
                        }
                    }
                }
            };
        } else {
            messageData = {
                "recipient": {
                    id: recipientID
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "receipt",
                            recipient_name: Name,
                            order_number: recipientID,
                            currency: "INR",
                            payment_method: "Cash on Delievery",
                            order_url: "http://genii.ai/policy/ActiveBots/Babadadhaba/Admin",
                            timestamp: "1428444852",
                            elements: cards,
                            address: {
                                street_1: address,
                                street_2: "\n",
                                city: "Phone-number",
                                postal_code: Num,
                                state: " : ",
                                country: "India"
                            },
                            summary: {
                                subtotal: total,
                                shipping_cost: 0.00,
                                total_tax: 0.00,
                                total_cost: total - newdiscount
                            },
                        }
                    }
                }
            };
        }
        callSendAPI(messageData);
    }

    function makeJsonreceipt(title, quantity, price) {
        var elements = {
            title: title,
            quantity: quantity,
            price: price,
            currency: "INR",
            image_url: "http://genii.ai/activebots/Babadadhaba/img/db/bdd_logo.jpg"
        }
        return elements;
    }

    function makeJson(title, imageurl) {
        var title1 = title.substring(0, title.indexOf(" - Rs."));
        var elements = {
            title: title,
            image_url: imageurl,
            buttons: [{
                type: "postback",
                title: "Buy " + title1,
                payload: "dish.buying:" + title1
            }],
        }
        console.log(title);
        return elements;
    }

    function callSendRedisapi(tag, operation, sender, text) {
        var Text1 = text;
        //console.log(text);
        console.log('dsdsd');
        request_1.getAsync({
            url: operation,
            method: 'GET'
        }).then(function(res, err) {
            console.log("Got response");
            var body = ''; // Will contain the final response
            // Received data is a buffer.
            // Adding it to our body
            if (err) throw err;
            if (tag === 'add') {
                console.log('dhcindijdcnn')

                var response = JSON.parse(res.body);
                console.log(response)
                console.log(typeof response.locflag)
                if (response.locflag == 0) {
                    console.log(response.locflag);
                    var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                    //  sendButton(sender,["postback","postback","web_url"],message,["Show_specials","Recommend",link],["Specials", "Recommendations", "Menu"],"tall");
                    var response = JSON.parse(res.body);
                    console.log(response);
                    //console.log(aiText);
                    if (response.oos.length != 0) {
                        var aiText = "Sorry, we dont have " + toTitleCase(response.oos[0].replace(/_/g, " ")) + " right now";

                        var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                        sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
                    } else {
                        var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                        console.log("hfuiscnsc");
                        sendButton(sender, ["postback", "web_url", "postback"], Text1, ["Show_cart", link, "Confirm_order"], ["Show cart", "Menu", "Confirm order"], "tall");
                    }
                } else if (response.locflag == 1) {
                    //console.log(locflag)
                    //  console.log(response.call)
                    //choice between new and old location choice
                    CustomQuickreply(sender, 'please share your location',2 )
                } else if (response.locflag == 2) {
                    console.log('scnklsc')
                    console.log(response.locflag)
                    //ask for locaiton, no location stored
                    CustomQuickreply(sender, 'please share your location',1)
                }



            } else if (tag === 'payment') {
                link = "http://genii.ai/activebots/Babadadhaba/payment.html?userid" + sender;
                sendButton(sender, ["web_url"], 'how would you like to pay?', [link], ["Payments"], "tall");
            } else if (tag === 'cancel') {
                var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender, ["postback", "postback", "web_url"], Text1, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
            } else if (tag === 'remove') {
                sendButton(sender, ["postback", "postback", "postback"], Text1, ["Show_cart", "Clear_cart", "Confirm_order"], ["Show cart", "Clear cart", "Confirm order"], "tall");
            } else if (tag === 'greeting') {
                console.log(res.body);
                var response = JSON.parse(res.body);
                var link = recommendationLink + "set_new_user_details/" + sender + "/" + response.first_name;
                callSendRedisapi("setname", link, sender, "setname");
            } else if (tag === 'setname') {
                //set
                console.log("res.body");
                var response = JSON.parse(res.body);
                aiText = "Satsriakaal " + response.first_name + " ji!! It's nice to see you! Welcome to  Baba da Dhaba! I am the Transformer Sardar, the Chrome-Chested Colossal Chef who improves with experience. Tell me where I'll be bringing your food today.";
                /*var link="http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender,["postback","postback","web_url"],aiText,["Show_specials","Recommend",link],["Specials", "Recommendations", "Menu"],"tall");*/
                CustomQuickreply(sender, aiText,1);
            } else if (tag === 'New_user') {
                aiText = "Thank you, How may I help you?"
                var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
            } else if (tag === 'existing') {
                console.log(res.body);
                var response = JSON.parse(res.body);
                if (response.name === "No name") {
                    var link = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + token;
                    callSendRedisapi("greeting", link, sender, "nothing");
                } else if (response.usual === "Nothing") {
                    if(response.locflag===0){
                    aiText = "Satsriakaal " + response.name + " ji!! It's nice to see you back! Let me take you on a Yummy-Shummy Trip. What would you like to have?";
                    var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                    // sendTextMessage(sender)
                    sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
                    }
                    else if(response.locflag===1){
                        var aiText=aiText = "Satsriakaal " + response.name + " ji!! It's nice to see you! Welcome to  Baba da Dhaba! I am the Transformer Sardar, the Chrome-Chested Colossal Chef who improves with experience. Tell me where I'll be bringing your food today.";
                        CustomQuickreply(sender,aiText,2)
                    }
                    else if(response.locflag===2){
                        var aiText=aiText = "Satsriakaal " + response.name + " ji!! It's nice to see you! Welcome to  Baba da Dhaba! I am the Transformer Sardar, the Chrome-Chested Colossal Chef who improves with experience. Tell me where I'll be bringing your food today.";
                        CustomQuickreply(sender, aiText,1)
                    }
                } else {
                    console.log("here")
                    if (response.locflag == 0 ) {
                        console.log("gotcha");
                        console.log(res.body);
                        var response = JSON.parse(res.body);
                        var name = response.name;
                        var time = response.day_diff;
                        var message = '';
                        console.log(time);
                        if ((time >= 1) && (time < 2)) {
                            message = "Satsriakaal" + name + " ji. It's nice to see you again! I see that you havent ordered from us in over a day. It's nice to see you back. Here are your usuals! Be sure to tell me if I can help you out with anything else!!";
                        } else if (time < 1) {
                            message = "Satsriakaal " + name + " ji. It's nice to see you back in 24 hours. You clearly loved our food. Here are your usuals! Be sure to tell me if I can help you out with anything else!!";
                        } else {
                            message = "Satsriakaal " + name + " ji. It's nice to see you again! I see that you havent ordered from us in over " + time + " days. It's nice to see you back. Here are your ususals! Be sure to tell me if I can help you out with anything else!!";
                        }
                        var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                        sendButton(sender, ["postback", "postback", "web_url"], message, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
                        //sendTextMessage(message);
                        var i;
                        var usuals = response.usual;
                        var images = [];
                        var titles = [];
                        var probabilities = [];
                        var keys = [];
                        Object.keys(usuals).forEach(function(key) {
                            keys.push(key);
                        });
                        keys.sort();
                        console.log(usuals['1'][3]);
                        console.log(keys);
                        for (key in keys) {
                            console.log(keys[key]);
                            images.push(usuals[keys[key]][3]);
                            titles.push(toTitleCase(usuals[keys[key]][0]) + " - Rs. " + usuals[keys[key]][1] + "(Usual)");
                            console.log(titles);
                        }
                        dataRequest(sender, titles, images);
                        aiText = "Let me know if you would like something else!!";

                    } else if ( response.locflag ===2) {
                        aiText = "Satsriakaal " + response.name + " ji!! It's nice to see you back! Let me take you on a Yummy-Shummy Trip. Please tell me where I'll be bringing your food today?";
                        CustomQuickreply(sender, aiText,1)
                    }

                      else if(response.locflag === 1){
                        aiText = "Satsriakaal " + response.name + " ji!! It's nice to see you back! Let me take you on a Yummy-Shummy Trip. Please tell me where I'll be bringing your food today?";
                        CustomQuickreply(sender,aiText,2)
                      }


                }

            }else if(tag==='menu'){
                console.log(res.body);
                var response = JSON.parse(res.body);
                if(response.locflag==0){
                    var link = "http://genii.ai/activebots/Babadadhaba" + "?userId=" + sender;
                    sendButton(sender, ["web_url"], "what would to like to have?", [link], ["Show Menu!"], "tall");
                }
                else if(response.locflag==1){
                    CustomQuickreply(sender,'Please select your delivery address',2)
                }
                else if(response.locflag==2){
                    CustomQuickreply(sender, 'please select your location',1)
                }
            }
             else if (tag === 'existing_2') {
                console.log("cxcx"+res.body);
                var response = JSON.parse(res.body);
                if (response.name === "No name") {
                    var link = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + token;
                    callSendRedisapi("greeting", link, sender, "nothing");
                } else if (response.usual === "Nothing") {
                    aiText = "I notice you haven't ordered anything with us yet. You should really try some of our food. We dont know your usuals yet.";
                    var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                    sendTextMessage(sender, aiText);
                    //  sendButton(sender,["postback","postback","web_url"],aiText,["Show_specials","Recommend",link],["Specials", "Recommendations", "Menu"],"tall");
                } else {
                    console.log("gotcha");
                    console.log(res.body);
                    var response = JSON.parse(res.body);
                    var name = response.name;
                    var time = response.day_diff;
                    var message = '';
                    console.log(time);

                    var i;
                    var usuals = response.usual;
                    var images = [];
                    var titles = [];
                    var probabilities = [];
                    var keys = [];
                    Object.keys(usuals).forEach(function(key) {
                        keys.push(key);
                    });
                    keys.sort();
                    console.log(usuals['1'][3]);
                    console.log(keys);
                    for (key in keys) {
                        console.log(keys[key]);
                        images.push(usuals[keys[key]][3]);
                        titles.push(toTitleCase(usuals[keys[key]][0]) + " - Rs. " + usuals[keys[key]][1] + "(Usual)");
                        console.log(titles);
                    }
                    dataRequest(sender, titles, images);
                    aiText = "Let me know if you would like something else!!";

                }


            } else if (tag == "log") {
                console.log(res);
                sendTextMessage(sender, Text1);
            } else if (tag === 'status') {
                console.log("staus herer");
                console.log(res);
                var response = JSON.parse(res.body);
                console.log(res.body);
                var status = response.status;
                if (status === 'order_accepted') {
                    sendButton(sender, ["postback"], "Your order has been accepted.", ['check_status'], ["Check status"], "tall");
                } else if (status === 'pending') {
                    sendButton(sender, ["postback"], "Your order is  still pending acceptance.", ['check_status'], ["Check status"], "tall");
                } else if (status === 'in_kitchen') {
                    sendButton(sender, ["postback"], "Your order is in the kitchen.", ['check_status'], ["Check status"], "tall");
                } else if (status === 'out_for_delivery') {
                    sendButton(sender, ["postback"], "Your order is out for delivery. Your delivery boy can be contacted at: " + response.dboy, ['check_status'], ["Check status"], "tall");
                } else if (status === 'delivered') {
                    sendTextMessage(sender, "Your order has been delivered. Enjoy your meal :)");
                } else if (status === 'rejected') {
                    sendTextMessage(sender, "You aren't being served today.:P");
                }
                /*  var operation =activelink + "get_receipt/" +sender ;
                  console.log(operation);
                  callSendRedisapi("receipt",operation,sender,"nothing");
                  var link=activelink + "cart/"+sender+"/status";*/
            } else if (tag === 'iscart') {

                console.log(Text1);
                console.log(res.body);
                link = "http://genii.ai/activebots/Babadadhaba/payment.html?userid" + sender;
                sendButton(sender, ["web_url", "postback"], Text1, [link, "Clear_cart"], ["Payment", "Clear cart"], "tall");
                if (res.body === "True") {

                    //CustomQuickreply(sender, Text1,1);

                } else {
                    aiText = "Sorry,your cart is empty.Would you like to order something?";
                    var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                    console.log("else codntiotn");
                    sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
                }
            } else if (tag === 'orderstatus') {
                sendButton(sender, ["postback"], "Your order status is: Pending", ["check_status"], ["Check Status"]);
            } else if (tag === 'receipt') {
                var keys = [];
                var quantity = [];
                var price = [];
                console.log(res);
                var response = JSON.parse(res.body);
                console.log(response);
                if (response.cart.total != 0) {
                    for (var key in response.cart) {
                        if (key != "total" && key != "discount" && key != "cart_id") {
                            keys.push(key);
                            quantity.push(response.cart[key][1]);
                            price.push(response.cart[key][0]);
                        }
                    }
                    sendReciept(sender, response.cart.discount, response.name, response.cart.total, keys, quantity, price, response.address, response.name, response.number,response.cart.cart_id);
                    console.log("gvhbknj");
                    sendButton(sender, ["postback"], "Your order status is: " + toTitleCase(response.order_status), ["check_status"], ["Check Status"], "tall");
                } else {
                    aiText = "Sorry,your cart is empty.Would you like to order something?";
                    var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                    console.log("else codntiotn");
                    sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
                }
            } else {
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: token
                    },
                    method: 'POST',
                    json: {
                        recipient: {
                            id: sender
                        },
                        message: {
                            text: Text1
                        }
                    }
                }, (error, response) => {
                    if (error) {
                        //console.log('Error sending message: ', error);
                    } else if (response.body.error) {
                        //console.log('Error: ', response.body.error);
                    }
                });
            }
        });
    }

    function callSendRedis(operation, sender) {
        console.log('cart');
        request_1.getAsync({
            url: operation,
            method: 'GET'
        }).then(function(res, err) {
            var body = ''; // Will contain the final response
            if (err) throw err;
            console.log(res.body);
            if ((res.body === '{}') || (JSON.parse(res.body).total === 0)) {
                aiText = "I am sorry but you have no items in your cart";
                var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
            } else {
                var dict = JSON.parse(res.body)
                var c = "";
                if (dict["oos"].length != 0) {
                    var d = "We are really sorry but ";
                    for (var key in dict) {

                        if (key === 'oos') {
                            console.log(key);
                            for (var i = 0; i < dict[key].length; i++) {
                                console.log(dict[key][i]);
                                d += toTitleCase(dict[key][i].replace(/_/g, ' ')) + "\n";
                            }
                            //   console.log(dict[key][0]);
                            //  d+=  toTitleCase(key.replace(/_/g, ' '))+'('+dict[key][0]+')'+' x '+dict[key][1]+"\n";
                            console.log("jhdcjks");
                            console.log(d);
                        }
                    }
                    d += "these items have went out of stock:\n"
                    //sendTextMessage(sender,d);
                    c += d;
                }
                for (var key in dict) {
                    if ((key != "total") && (key != "flag") && (key != "discount") && (key != 'oos') && key!='cards' && key!='upsell') {
                        c += toTitleCase(key.replace(/_/g, ' ')) + '(' + dict[key][0] + ')' + ' x ' + dict[key][1] + "\n"; //crerating final string in UX friendly format
                    }

                }
                c += "Total Value: " + dict['total'] + '\n';
                //  c+=d;
                //c+="You can add or remove dishes by texting us the name and quantity of the dish or using the below button!";
                var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender, ["web_url", "postback", "postback"], c, [link, "Clear_cart", "Confirm_order"], ["Add/Change Dishes", "Clear cart", "Confirm order"], "tall");


            }
        });
    }

    function callSendRedisAddress(operation, sender) {
        request_1.getAsync({
            url: operation,
            method: 'GET'
        }).then(function(res, err) {
            var body = ''; // Will contain the final response
            if (err) throw err;
            //console.log(res.calls)
            var response = JSON.parse(res.body)
            console.log('vava' + res.body)
            if(response.status==='shut_down'){
                sendTextMessage(sender,"sorry, store near you is shut down")

            }
            if(response.status==='out_of_range'){
                sendTextMessage(sender,"Sorry, we currently do not serve in your area")
            }

            else if(response.tags==='menu'){
                 var link = "http://genii.ai/activebots/Babadadhaba" + "?userId=" + sender;
                 sendButton(sender, ["web_url"], "what would to like to have?", [link], ["Show Menu!"], "tall");
            }

            else{
            if (response.status === 'None')

            {
                sendTextMessage(sender, "We are sorry but we currently do not serve in your area. Please try again later.")
            } else if (response.tags === 'New_user' || response.tags==='saved_address') {
                console.log('fshkjsf')
                aiText = "Thank you, How may I help you?"
                var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
            } else if (response.tags === 'recommend' || response.tags === 'specials' || response.tags==='recommend_specific') {
                var operation = response.calls
                callrecommend(operation, sender)
            } else if (response.calls) {
                console.log(response.calls[0])
                var operation = response.calls
                var tag = response.tags
                var text = 'Thanks! How may I help you?'
                console.log(JSON.stringify(operation))

                callSendRedisapi(tag, operation, sender, text)


            }
        }



        });
    }


    function callSendRedisconfirm(operation, sender) {
        request_1.getAsync({
            url: operation,
            method: 'GET'
        }).then(function(res, err) {
            var body = ''; // Will contain the final response
            // Received data is a buffer.
            // Adding it to our body
            if (err) throw err;
            var total = 0;
            var keys = [];
            var quantity = [];
            var price = [];
            var oos = [];
            console.log(res.body);
            var dict = JSON.parse(res.body)
            for (var key in dict) {
                if ((key != "total") && (key != "flag") && (key != 'oos') && key != 'discount' && key!='cards' && key!='upsell') {
                    keys.push(key);
                    quantity.push(dict[key][1]);
                    price.push(dict[key][0]);
                } else if (key === "total") {
                    total = dict[key];
                } else if (key === 'oos') {
                    for (var i = 0; i < dict[key].length; i++) {
                        oos.push(dict[key][i]);
                    }
                } else if (key === "flag") {
                    flag = dict[key];
                }
            }
            var upsell=dict.upsell;
            var images=dict.cards.links;
            var reco=dict.cards.reco;
            var reco_price=dict.cards.prices;
            console.log('reco'+reco)
            console.log('images'+images)
             for (var i = 0; i < reco.length; i++) {
                    console.log(reco[i]);
                    console.log(reco[i] + ' - Rs.' + reco_price[i]);
                    reco[i] = reco[i] + ' - Rs.' + reco_price[i];
                }
            CartForConfirmation(sender, keys, quantity, price, total, flag, oos, upsell,images,reco);
        });
    }

    function CartForConfirmation(sender, keys, quantity, price, total, flag, oos, upsell, images, reco) {
        var msg = '';
        if (keys.length != 0) {
           // sendTextMessage(sender, "Are you sure you want to confirm this cart?");
            for (var i = 0; i < keys.length; i++) {
                console.log(keys[i]);
                //k=keys[i].replace(/_/g, " ")
                msg = msg + toTitleCase(keys[i].replace(/_/g, " ")) + '(' + price[i] + ')' + ' x ' + quantity[i] + '' + '\n';
            }
            if (oos.length != 0) {
                var d = "We are sorry but the following items have gone out of stock: ";
                for (var i = 0; i < oos.length; i++) {
                    d += toTitleCase(oos[i].replace(/_/g, ' ')) + "\n";
                }
            }
            msg = msg + 'Your total bill before discount is: ' + total + '\n';
            if (upsell===0)
            {
                msg+="Are you sure you want to confirm this order?";
                var link = "http://genii.ai/activebots/Babadadhaba/payment.html?userid=" + sender;
                sendButton(sender, ["web_url", "postback"], msg, [link ,"Clear_cart"], ['Payments', "Clear cart"], "tall");
            }
            else if (upsell==1){
                msg+="Are you sure you want to confirm this order? I suggest that you try out one of our super coolants made at a 1000RPM.";
                var link = "http://genii.ai/activebots/Babadadhaba/payment.html?userid=" + sender;
                sendButton(sender, ["web_url", "postback"], msg, [link ,"Clear_cart"], ['Payments', "Clear cart"], "tall");
                dataRequest(sender,reco,images);
            } 
            else if(upsell==2){
                msg+="Are you sure you want to confirm this order? I suggest that you try out one rivting desserts to end this meal right.";
                var link = "http://genii.ai/activebots/Babadadhaba/payment.html?userid=" + sender;
                sendButton(sender, ["web_url", "postback"], msg, [link ,"Clear_cart"], ['Payments', "Clear cart"], "tall");
                 dataRequest(sender,reco,images);
            }
            else if(upsell==3){
                msg+="Are you sure you want to confirm this order? I suggest that you try out one of our super coolants made at a 1000RPM or one of our riveting desserts.";
                var link = "http://genii.ai/activebots/Babadadhaba/payment.html?userid=" + sender;
                sendButton(sender, ["web_url", "postback"], msg, [link ,"Clear_cart"], ['Payments', "Clear cart"], "tall");
                 dataRequest(sender,reco,images);
            }


         }  
         else {
            aiText = "Sorry,your cart is empty.Would you like to order something?";
            var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
            console.log("else codntiotn");
            sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
        }
    }

    function callrecommend(operation, sender) {
        console.log(operation)
        request_1.getAsync({
            url: operation,
            method: 'GET'
        }).then(function(res, err) {
            var body = ''; // Will contain the final response
            // Received data is a buffer.
            // Adding it to our body

            console.log(res.body+'sdssdsd');
            var dict = JSON.parse(res.body);
            if(dict.status==='open'){
             if (dict.locflag == 0) {
                var rec = dict["reco"];
                var links = dict["links"];
                var price = dict["prices"];
                for (var i = 0; i < rec.length; i++) {
                    console.log(rec[i]);
                    console.log(rec[i] + ' - Rs.' + price[i]);
                    rec[i] = rec[i] + ' - Rs.' + price[i];
                }
                console.log(price)
                console.log(rec);
                dataRequest(sender, rec, links);

             } else if (dict.locflag == 1) {
                CustomQuickreply(sender, 'please share your location')
             } else if (dict.locflag == 2) {
                CustomQuickreply(sender, 'please share your location')
             }
          }
          else{
            sendTextMessage(sender,"Sorry, the store is shut down")
          }

        });
    }

    function callSendAPI(messageData) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: token
            },
            method: 'POST',
            json: messageData
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;
                console.log("Successfully sent generic message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                //console.error("Unable to send message.");
                console.error(response);
                //console.error(error);
            }
        });
    }

    // Set Express to listen out for HTTP requests
    var server = app.listen(process.env.PORT || 3000, function() {
        console.log("Listening on port %s", server.address().port);
    });
