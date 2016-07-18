var Rss = {};
(function() {
		var self = this;
		this.getContinuation = function(id) {
			var startIndex = id.indexOf("=_");
			return id.substring(startIndex + 2);
		}
		this.getTitle  = function(data) {
			return data.title;
		}
		this.getTime = function(data) {
			return +data.crawled;
		}
			var getImage = function(data)  {
				var startIndex = data.indexOf("<img");
				if(startIndex == -1) {
					return "";
				}
				var endIndex = data.indexOf(">", startIndex);

				data = data.substring(startIndex + 4, endIndex);
				
				startIndex = data.indexOf("src=\"");
				
				endIndex = data.indexOf("\"", startIndex+5);
				
				return data.substring(startIndex + 5, endIndex);
			}
		this.getImage = function(data) {
			
			if(data.visual && data.visual.url) {
				return data.visual.url;
			}
			
			if(data.content) {
				return getImage(data.content.content);
			}
			if(data.summary) {
				return getImage(data.summary.content);
			}
			
		}
		this.getKeywords = function(data) {
			return data.keywords || [];
		}
		this.getContent = function(data) {
			if(data.content) {
				return data.content.content || ""; 
			}
			if(data.summary) {
				return data.summary.content || "";
			}
			
			return "";
		}
		this.getUrl = function(data) {
			return data.alternate[0].href;
		}
	this.getObject = function(data) {
		return {
			url: self.getUrl(data),
			time: self.getTime(data),
			content: self.getContent(data),
			title: self.getTitle(data),
			image: self.getImage(data),
			rssId: data.id,
			keywords: self.getKeywords(data)
		};
	}
}).call(Rss);
module.exports = Rss;