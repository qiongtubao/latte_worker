var Mongodb = require("latte_db").mongodb;
var config = require("./config.json");
Mongodb.bindDb("news", config);
Mongodb.news.command(function(err, client, dbcb) {
	client.news.distinct("url", function(err, data) {
		console.log("distinct:",err, data.length);
	});
	var urls = {};
	client.news.find({}, {url:1}).toArray(function(err, data) {
		console.log("count:",err, data.length);
		data.forEach(function(o) {
			if(urls[o.url] ) {
				client.news.remove({
					_id: client.toObjectID(o._id)
				}, function(err, data) {
					console.log("remove over");
				});
			}else{
				urls[o.url] = 1;
			}
		});
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