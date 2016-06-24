var Mongodb = require("latte_db").mongodb;
var config = require("./config.json");
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
			mongodb.recommendTest2.insert({
				_id: mongodb.toObjectID(data[0] + "_"+data[1]),
				userId: data[0],
				itemId: data[1],
				value: data[2],
				time: data[3]
			}, function(err, result){
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