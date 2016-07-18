var noKeyWords = require("../noKeyWords.json");
var latte_lib = require("latte_lib");
var tfIdf = function(words, client, cb) {
		var len = words.length;
		var idfs = {};
		var count ;
		var idfsFuns = [function(callback) {
			client.news.find({}).count(function(err, num) {
				count = num;
				callback(err);
			});
		}];
		var kys= {};
		var tfs = {};
		words.forEach(function(data) {
			if(data == "" || noKeyWords.indexOf(data) != -1) {
				return;
			}
			if(kys[data]) {
				kys[data]++;
			}else{
				kys[data] = 1;
				idfsFuns.push(function(callback) {
					var o =  data.replace(/\*/img, "\\*").replace(/\?/img, "\\?");
					//console.log("qc:",o);
					var reg = new RegExp( " "+o+" ", "img");
					client.news.find({content: reg
					 }).count(function(err, num) {
						idfs[data] = num;
						callback(err);
					});
				});
			}
			//kys[data] = (kys[data] || 0)+1;
			tfs[data] = kys[data]/len;
			
		});
		var result = [];
		console.log("tfIdf", idfsFuns.length);
		latte_lib.async.parallel(idfsFuns,function(err, data) {
			
			if(err) {
				return cb(err);
			}
			for(var i in kys) {
				//console.log(i, )
				result.push( { key: i , value: Math.log(count/(idfs[i]+1) ) * kys[i]/len });
			}
			result.sort(function(a,b) {
				return a.value > b.value ? -1: 1;
			});

			return cb(null, result.map(function(a){
				//console.log(a.value);
				return a.key;
			}));
		});
	}
	var textRank = function(words, client, cb) {
		var d = 0.85;
		var all = {};
		for(var i = 0, len = words.length; i < len; i++) {
			all[words[i]] = all[words[i]] ||[];
			for(var k = -5; k < 5; k++) {
				if(words[i+k] == null || k == 0) {
					continue;
				}
				if(all[words[i]].indexOf(words[i+k]) == -1) {
					all[words[i]].push(words[i+k]);
				}
			}
		}
		//console.log(all);
 		var min_diff = 0.001;
 		var score = {};
 		for(var i = 0 , max_iter = 100; i < max_iter; i++) {
			var result = {};
			var max_diff = 0;
			for(var key in all) {
 				result[key] = 1 - d;
	 			all[key].forEach(function(other) {
	 				var size = all[other].length;
	 				if(!size) { return;}
	 				result[key] = result[key] + d/ size * (score[other] || 0);
	 			});
	 			max_diff = Math.max(max_diff, Math.abs(result[key] - ( score[key] || 0) ));
	 		}
	 		score = result;
	 		if(max_diff <= min_diff) {
	 			break;
	 		}
 		}
 		var array = [];
 		for(var i in score) {
 			array.push({
 				key: i,
 				value: score[i]
 			});
 		}
 		array.sort(function(a,b) {
 			return a.value > b.value ? -1: 1;
 		});
 		return cb(null, array.map(function(a){
			//console.log(a.value);
			return a.key;
		}));
 	}
 	var getDomText =  function(c) {
		switch(c.type) {
			case "text":
				var value = "";

				if(!c.parent) {
					return c.data;
				}
				switch(c.parent.name) {
					case "span":
						value = c.data;
					break;
					case "strong":
						value = c.data;
					break;
					default:
						value = c.data;
					break;
				}
				//console.log(value, c);
				//console.log(c.data, value);
				return value;
			break;
			case "tag":
				if(c.name == "img") {
					return "";
				}else{
					var s = [];
					c.children.forEach(function(o) {
						var value = getDomText(o).trim();
						if(value != "") {
							s.push(value);
						}
						
					});
					return s.join("\n");
				}
			break;
			case "root":
				var s = [];
				c.children.forEach(function(o) {
					var value = getDomText(o).trim();
					if(value != "") {
						s.push(value);
					}
					
				});
				return s.join("\n");	
			break;
			default:
				var s = [];
				if(c.length) {
					var s = [];
					for(var i = 0, len = c.length; i < len; i++ ) {
						var value = getDomText(c[0]).trim();
						if(value != "") {
							s.push(value);
						}
					}
					
					return s.join("\n");
				}else{
					console.log(c);
				}
				console.log(c);
				
			break;

		}
		
	}


	var getText = function(data) {
		//console.log(data);
		var cheerio = require("cheerio");
		var dom = cheerio.load(data.content);
		var text = getDomText(dom.root());
		var words = (data.title  + " " + text).replace(/\(|\)|:|,|(\.\s+)/img, " ").split(/\s+/);
		words = words.filter(function(o) {
			if(+o == o|| o == null || o == "." ||o == "" || noKeyWords.indexOf(o) != -1 || noKeyWords.indexOf(o.toLowerCase()) != -1) {
				return null;
			}
			return o;
		});	
		return words;
	}
	module.exports = {
		tfIdf : tfIdf,
		textRank: textRank,
		getText: getText
	}