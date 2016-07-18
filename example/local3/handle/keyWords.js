var Mongodb = require("latte_db").mongodb;
var config = require("../config.json");
var latte_lib = require("latte_lib");
(function() {
	var mongodb;
	var closeEvent;
	var Mongodb = require("latte_db").mongodb;
	var events = [];
	var self = this;
	var utils = require("../utils/keyWord.js");
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
			/**
			var o = Rss.getObject(data.data);
			mongodb.news.update({
				tag: data.tag,
				from: data.from,
				url: o.url
			}, {
				$set: {
					keyword1: ,
					keyword2:
				}
			}, {
				upsert: true
			},function(err, result){
				callback(err, result);
			});
			*/
			var words = utils.getText(data);
			latte_lib.async.parallel([function(cb){
				utils.tfIdf(words, mongodb, cb);
			}, function(cb) {
				utils.textRank(words, mongodb, cb);
			}], function(err, result) {
				var keyword1 = result[0].slice(0,4);
				var keyword2 = result[1].slice(0, 4);
				//console.log(data.title, keyword1, keyword2);
				
				mongodb.news.update({
					tag: data.tag,
					from: data.from,
					url: data.url
				}, {
					$set: {
						keyword1: keyword1,
						keyword2:  keyword2
					}
				},function(err, result){
					callback(err, result);
				});	
				

				
			});
			
			
		}else{
			events.push({
				data: data,
				callback: callback
			});
		}
		
	}
	this.task = "keyWords";
}).call(module.exports);