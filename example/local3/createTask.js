(function() {
	var Mongodb = require("latte_db").mongodb;
	var config = require("./config.json");
	var lastTime = 0;
	var timeDo = function(callback) {
		Mongodb.news.command(function(err, client, dbcb) {
			if(err) {
				dbcb(err);
				return;
			}
			client.news.find({
				keyword1: null,
				time: {
					$gt: lastTime
				}
			}).sort({time:1}).limit(32).toArray(function(err , data) {
				//console.log(err, data);
				console.log(err, data.length);
				if(err) {
					console.log(err);
					return;
				}else{
					if(data.length > 0) {
						callback(data);
						lastTime = data[0].time;
						if(data.length == 32) {
							setTimeout(function() {
								timeDo(callback);
							}, 1000 * 60 * 2.5);
						}else{
							setTimeout(function() {
								timeDo(callback);
							}, 1000 * 60 * 60 );
						}
						
					}
					
				}
			});
		});
	}
	this.createTask = function(callback) {
		timeDo(callback);
	}
}).call(module.exports);