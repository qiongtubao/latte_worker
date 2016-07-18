var Mongodb = require("latte_db").mongodb;
var config = require("../config.json");
var Rss = require("../rss.js");
(function() {
	var mongodb;
	var closeEvent;
	var Mongodb = require("latte_db").mongodb;
	var events = [];
	var self = this;
	Mongodb.createOne(config, function(err, client, dbcb) {
		if(err) {
			dbcb(err);
			return callback(err);
		}
		mongodb = client;
		closeEvent = dbcb;
		var o ;
		while(o = events.shift()) {
			(function(o) {
				self.handle(o.data, o.callback);
			})(o);
		}
	});
	this.handle = function(data, callback) {
		if(mongodb) {
			var o = Rss.getObject(data.data);
			mongodb.news.update({
				tag: data.tag,
				from: data.from,
				content: o.content
			}, {
				$set: o
			}, {
				upsert: true
			},function(err, result){
				callback(err, result);
			});
		}else{
			events.push({
				data: data,
				callback: callback
			});
		}
		
	}
	this.task = "addMongodb";
}).call(module.exports);