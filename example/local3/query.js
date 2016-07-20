var Mongodb = require("latte_db").mongodb;
var config = require("./config.json");
Mongodb.bindDb("news", config);
Mongodb.news.command(function(err, client, dbcb) {
	client.news.find({
		keyword1: {
			$size :4
		}
	}).count(function(err, data) {
		console.log("keyword1:",err, data.length);
	});
	
	client.news.find({
	}).count(function(err, data) {
		console.log("all",err, data.length);
	});
	/**
	client.news.find({
		time: {
			$gt: time.getTime()
		}
	}).toArray(function(err, data) {
		console.log(err, data);
	});
*/
	
});	