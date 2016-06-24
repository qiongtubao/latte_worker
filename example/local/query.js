var config = require("./handle/config.json");
var Mongodb = require("latte_db").mongodb;
	var events = [];
	var self = this;
	Mongodb.createOne(config, function(err, client, dbcb) {
		if(err) {
			dbcb(err);
			return callback(err);
		}
		
		client.recommendTest2.find({

		}).toArray(function(err, data) {
			console.log(err,data);
		});
		
		/**
		client.recommendTest2.drop(function(err, data) {
			console.log(err, data);
		});
		*/
	});