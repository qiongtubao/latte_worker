var Mongodb = require("latte_db").mongodb;
var config = {
	"host": "192.168.1.25",
	"port": 27017,
	"database": "recommendTest3",
	"collections": ["recommendTest3"],
	"maxPoolNum": 100,
	"idleTimeoutMillis": 30000,
	"minPoolNum": 10
};
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
			mongodb.recommendTest3.insert(data, function(err, result){
				callback(err, result);
			});
		}else{
			events.push({
				data: data,
				callback: callback
			});
		}
		
	}
	this.task = "addMongodb2";
}).call(module.exports);