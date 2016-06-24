var latte_lib = require("latte_lib")
	, latte_watch = require("latte_watch");
var Handles = function() {
	this.methods = {};
	this.inits = [];
};	
latte_lib.inherits(Handles, latte_lib.events);
var Modules = require("latte_require");
(function() {
	this.init = function(config) {
		this.config = config;
		this.start();
	}
	this.start = function() {
		this.require =  Modules.create(this.config.filename || "./");
			if(!this.config.path) {
				return;
			}
			this.loadDir(this.config.path);		
			var self = this;
		var watcher = this.watcher = latte_watch.create(this.config.dirname +"/"+ this.config.path);
		watcher.on("addDir", function(addDirName ) {
			self.loadDir(addDirName);
		});
		watcher.on("unlink" , function() {
			self.reload();
		});
		watcher.on("unlinkDir", function(){
			self.reload();
		});
		watcher.on("add", function(filename) {
			self.loadFile(filename);
		});
		watcher.on("change", function() {
			self.reload({
				event: "fileChange",
			});
		});				
	}
		this.loadDir = function(path) {
			var self = this;
			var files = latte_lib.fs.readdirSync(path);
			files.forEach(function(filename) {
				var stat = latte_lib.fs.statSync(path + "/" + filename);
				if(stat.isFile()) {
				 	self.loadFile(path + "/"+ filename);
				}else if(stat.isDirectory()){
		 			self.loadDir(path + "/" + filename);
				}
			});
		}
       this.reload = function(event) {
			this.reloadList = this.reloadList || [];
			this.reloadList.push(event);
			if(this.reloadList.length > 1) {
				return;
			}
			var self = this;
			setTimeout(function() {
				//this.config.path = path;
				self.rpcRequire =  Modules.create(self.config.filename );
				self.loadDir(self.config.path);	
				self.emit("reload");
				self.reloadList.forEach(function(e) {
					console.log(e);
				});
				self.reloadList = [];
			}, this.config.reloadTime);
			
		}
		this.loadFile = function(path) {

			 var self = this;
			 var o ;
			 try {
				o = self.require.require("./"+path);

			 }catch(err) {
			 	console.log(err);
			 	self.emit("loadError");
			 	return;
			 }
			 if(o.task && o.handle) {
			 	self.setMethod(o.task, o.handle);
			 }
		}
        this.doHandle = function(method, data, callback) {
        	this.methods[method](data, callback);
        }
        this.setMethod = function(method, func) {
          	this.methods[method] = func;
        }
}).call(Handles.prototype);
module.exports = Handles;