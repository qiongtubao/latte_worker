var Mongodb = require("latte_db").mongodb;
var latte_lib = require("latte_lib");
var RssUtils = require("./rss.js");
/**
var all = {
	"Tecnología": {
		"hipertextual":  {
	 		url: "http://alt1040.com/feed/"
	 	}
	},
	"Nacional": {
 		"Jornada":  {
	 		url: "http://www.jornada.unam.mx/rss/politica.xml"
	 	}
	},
	"Internacional": {
 		"20minutos":  {
	 		url: "http://www.20minutos.es/rss/internacional/"
	 	}
	},
	"Estilo de Vida": {
 		"Vitonica":  {
	 		url: "http://www.vitonica.com/index.xml"
	 	}
	},
	"Entretenimiento": {
 		"E¡ Online":  {
	 		url: "http://la.eonline.com/andes/feed"
	 	}
	},
	"Destacados": {
 		"No puedo creer":  {
	 		url: "http://feeds.feedburner.com/NoPuedoCreerQueLoHayanInventado"
	 	}
	},
	"Deportes": {
 		"Fichajes":  {
	 		url: "http://feeds.feedburner.com/fichajes-rumores"
	 	}
	}
};
*/


var all = {
 	"Tecnología" : {
	 	"hipertextual":  {
	 		url: "http://alt1040.com/feed/"
	 	},
	 	"El android libre":  {
	 		url: "http://www.elandroidelibre.com/feed/"
	 	},
	 	"Applesfera":  {
	 		url: "http://feeds.weblogssl.com/applesfera"
	 	},
	 	"Xataka Movil":  {
	 		url: "http://www.xatakamovil.com/index.xml"
	 	}
 	},
 	"Nacional": {
 		"Jornada":  {
	 		url: "http://www.jornada.unam.mx/rss/politica.xml"
	 	},
	 	"Radio Formula":  {
	 		url: "http://www.radioformula.com.mx/read/portadas/nacional.rss"
	 	},
	 	"Forbes":  {
	 		url: "http://www.forbes.com.mx/sites/feed/"
	 	}
 	},
 	"Internacional": {
 		"20minutos":  {
	 		url: "http://www.20minutos.es/rss/internacional/"
	 	},
	 	"ABC":  {
	 		url: "http://www.abc.es/rss/feeds/abc_Internacional.xml"
	 	},
	 	"IPS Noticias":  {
	 		url: "http://ipsnoticias.net/rss/titulares.xml"
	 	}
 	},
 	"Estilo de Vida": {
 		"20minutos":  {
	 		url: [
		 		"http://www.20minutos.es/rss/gastronomia/", 
		 		"http://www.20minutos.es/rss/salud/"
	 		]
	 	},
	 	"Vitonica":  {
	 		url: "http://www.vitonica.com/index.xml"
	 	},
	 	"LRF":  {
	 		url: "http://www.larecetadelafelicidad.com/feed"
	 	},
	 	"Directo al Paladar":  {
	 		url: "http://feeds.weblogssl.com/directoalpaladar"
	 	}
 	},
 	"Entretenimiento": {
 		"E¡ Online":  {
	 		url: "http://la.eonline.com/andes/feed"
	 	},
	 	"Farandula":  {
	 		url: "http://www.farandula.org/feed/"
	 	},
	 	"Seriesadictos":  {
	 		url: "http://www.seriesadictos.com/feed/"
	 	}
 	},
 	"Destacados": {
 		"No puedo creer":  {
	 		url: "http://feeds.feedburner.com/NoPuedoCreerQueLoHayanInventado"
	 	},
	 	"Curistoria":  {
	 		url: "http://curistoria.blogspot.com/feeds/posts/default"
	 	},
	 	"Yorokobu":  {
	 		url: "http://www.yorokobu.es/feed/"
	 	},
	 	"Culturizando":  {
	 		url: "http://feeds.feedburner.com/Culturizando"
	 	}
 	},
 	"Deportes": {
 		"Fichajes":  {
	 		url: "http://feeds.feedburner.com/fichajes-rumores"
	 	},
	 	"Motorpasion":  {
	 		url: "http://www.motorpasion.com/atom.xml"
	 	},
	 	"20minutos":  {
	 		url: "http://www.20minutos.es/rss/deportes/"
	 	},
	 	"nbamaniacs":  {
	 		url: "http://feeds.feedburner.com/nbamaniacs"
	 	}
 	}
};


var Rss = function(config, callback) {
	this.config = config;
	this.callback = callback;
	this.config.timeout = this.config.timeout || 1000 * 10;
	this.init();
};
(function() {
	this.init = function() {
		var self = this;
		if(!this.start  || !this.end) {
			Mongodb.news.command(function(err, client, dbcb) {
				if(err) {
					dbcb(err);
					self.timer = setTimeout(self.init.bind(self), this.config.timeout);
					return;
				}
				latte_lib.async.parallel([
					function(callback) {
						client.news.find({
							tag: self.config.tag,
							from : self.config.from
						}).sort({time: -1}).limit(1).toArray(function(err, data) {
							if(err) {
								return callback(err);
							}
							self.end = data[0];
							callback(null);
						});
					},
					function(callback) {
						client.news.find({
							tag: self.config.tag,
							from: self.config.from
						}).sort({time: 1}).limit(1).toArray(function(err, data) {
							if(err) {
								return callback(err);
							}
							self.start = data[0];
							callback(null);
						});
					}
				], function(err, data) {
					if(err) {
						dbcb(err);
						self.timer = setTimeout(self.init.bind(self), this.config.timeout);
						return;
					}
					self.doing();
				});
			});
		}else{
			self.doing();
		}
	}
		this.query = function(config, callback) {
			var onceCallback = (function() {
				var called = false;
				return function(err, data) {
					if(called) {
						console.log("no runing err ", err, data);
						return;
					}
					callback(err, data);
				};
			})();

			latte_lib.xhr.get("http://feedly.com/v3/streams/contents", {
				streamId: "feed/"+this.config.url,
				count: 10,
				ranked: "newest",
				ck: Date.now(),
				continuation: config.continuation,
				ct: "feedly.desktop",
				cv: "30.0.1184"
			}, function(data) {
				//console.log(data);
				var data = JSON.parse(data);
				onceCallback(null, data);
			}, function(err) {
				//res.writeHeader(400);
				
				console.log(err.stack && err.stack.toString());
				onceCallback(err);
			});
		}
		this.createTask = function(list) {
			var self = this;
			list = list.map(function(o) {
				return {
					tag: self.config.tag,
					from: self.config.from,
					data: o
				};
			});
			this.callback(list);
		}
	this.copy = function() {
		var self = this;
		this.query({
			continuation: this.start && RssUtils.getContinuation(this.start.rssId)
		}, function(err, data) {
			if(err) {
				self.timer = setTimeout(self.copy.bind(self), self.config.timeout);
				return;
			}
			if(data.items.length == 0) {
				self.timer = setTimeout(self.copy.bind(self), self.config.timeout);
				return;
			};
			if(!self.end) {
				var o = data.items[0];
				self.end = {
					time: RssUtils.getTime(o)
				};
			}
			
			self.createTask(data.items);
			var o = data.items[data.items.length -1];
			self.start = {
				time: RssUtils.getTime(o),
				rssId: o.id
			}
			self.doing();
		});
	}
			var findgt = function(items , time , min, max) {
				if(max - min == 1 ) {
					return min;
				}
				var middle = parseInt((min + max)/2);
				if(RssUtils.getTime(items[middle]) > time) {
					return findgt(items, time, middle, max);
				}else{
					return findgt(items, time, min , middle);
				}
			}
		this.findgt = function(continuation, array, callback) {
			var self = this;
			this.query({
				continuation :continuation
			}, function(err, data) {

				if(err) {
					return callback(err);
				}
				
				if(data.items.length == 0) {
					return callback(null, array);
				}
				if(self.end.time >= RssUtils.getTime(data.items[0]) ) {
					return callback(null, array);
				}
				var last = data.items[data.items.length -1];
				
				if(self.end.time < RssUtils.getTime(last)) {
					array = data.items.reverse().concat(array);
					return  self.findgt(RssUtils.getContinuation(last.id), array, callback);
				}

				var index = findgt(data.items, self.end.time, 0, data.items.length -1);
				
				array = data.items.slice(0, index + 1).reverse().concat(array);
				console.log("update", array.length);
				return callback(null, array);
			});
		}
	this.wait = function() {		
		
		var self = this;
		this.findgt(null, [], function(err, data) {

			if(err) {
				self.timer = setTimeout(self.wait.bind(self), self.config.timeout);
				return;
			}
			if(data.length == 0) {
				self.timer = setTimeout(self.wait.bind(self), self.config.timeout);
				return;
			}
			
			var o = data[0];
			self.createTask(data);
			self.end = {
				time: RssUtils.getTime(o)
			}
			self.timer = setTimeout(self.wait.bind(self), self.config.timeout);
		});
		
	}
	this.doing = function() {
		if(!this.start || this.start.time >  this.config.startTime) {
			this.copy();
		}else{
			this.wait();
		}
	}
}).call(Rss.prototype);





module.exports = {
	createTask: function(time, callback) {
		for(var tag in all) {
			(function() {
				var froms = all[tag];
				for(var from in froms) {
					(function(from, tag) {
						var o = froms[from];
						if(latte_lib.isArray(o.url)) {
							o.rss = o.url.map(function(url) {
								return new Rss({
									from: from,
									tag: tag,
									url: url,
									startTime: time,
									timeout: 1000*60 *5
								}, callback);
							});
						}else{
							o.rss = new Rss({
								from: from,
								tag: tag,
								url: o.url,
								startTime: time,
								timeout: 1000*60 *5
							}, callback);
						}
					})(from, tag);
				}
			})(tag);
		}
	}
}