var Mongodb = require("latte_db").mongodb;
var config = require("./config.json");
Mongodb.bindDb("news", config);
Mongodb.news.command(function(err, client, dbcb) {
	client.news.find({
		keyword1: null
	}).count(function(err, data) {
		console.log(err, data);
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