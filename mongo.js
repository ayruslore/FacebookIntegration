var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
 /* db.createCollection("customers",function(err,res){
  	if(err) throw err;
  	console.log("Table created");*/
  	var arr=["daal","daad"];
  	var myobj= {id: "12",order:arr};
  	db.collection("customers").insertOne(myobj,function(err,res){
  		if(err) throw err;
  		console.log("inserted");
  });
 /* db.collection("customers").find({}).toArray(function(err,result){
  	if(err) throw err;
  	console.log(result);
  })*/
  var query={id:"12"};
  db.collection("customers").find(query).toArray(function(err,result){
  	if(err) throw err;
  	console.log(result);
  })
  //console.log("Database created!");
  db.close();
});
