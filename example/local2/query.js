var Mongodb = require("latte_db").mongodb;
var config = require("./config.json");
Mongodb.bindDb("news", config);
Mongodb.news.command(function(err, client, dbcb) {
	var time = new Date(2016, 6, 5);
	client.news.remove({
		time: {
			$gt: time.getTime()
		}
	},function(err, data) {
		console.log(err, data);
	});
});	