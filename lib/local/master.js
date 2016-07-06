(function() {
	var latte_lib = require("latte_lib");
	var Path = require("path");
	var Child = require("child_process");
	var defaultConfig = {
		cpus: require('os').cpus().length * 2,
		errorMaxNum: 5,
		timeout: 1000 * 60 
	};
	var Master = function(config) {
		this.config = latte_lib.merger(defaultConfig, config);
		this.tasks = {};
	};
	latte_lib.inherits(Master, latte_lib.events);
	(function() {
			
		this.getTask = function(taskName, work) {
			var runs = this.tasks[taskName].info.runs;
			var task = this.tasks[taskName].tasks.shift();
			
			if(!task) {
				work.kill();
				var index = this.tasks[taskName].info.works.indexOf(work);
				this.tasks[taskName].info.works.splice(index, 1);
				if(Object.keys(runs).length == 0) {
					this.endTask(taskName);
				}
				return;
			}
			if(!task.latte_taskId) {
				task.latte_taskId = ++this.tasks[taskName].info.id;
			}
			runs[task.latte_taskId] = task;
			work.send(task);
		} 
		this.backResult = function(taskName, message, work) {
			var runs = this.tasks[taskName].info.runs;
			var self = this;
			switch(message.handle) {
				case "start":
					if(message.err) {
						setTimeout(function() {
							var config = self.tasks[taskName].config;
							work.send({
								handle: "start",
								data: config
							});
						}, self.config.timeout);
					}else{
						return this.getTask(taskName, work);
					}
					
				break;
				default:
					//task  不通
					var task = runs[message.latte_taskId];
					if(task != null) {
						delete runs[message.latte_taskId];
					}
					var num = this.tasks[taskName].info.fails[message.latte_taskId] || 0;
					if(message.err) {
						this.tasks[taskName].info.fails[message.latte_taskId] = ++num;
						if(num < this.config.errorMaxNum - 1) {
							this.tasks[taskName].tasks.push(task);
						}
						
					}else{
						this.tasks[taskName].info.sucess++;
						if(num) {
							this.tasks[taskName].info.fails[message.latte_taskId];
						}
					}
					this.getTask(taskName, work);
				break;
			}
			

		}
		this.createWork = function(taskName, id ) {
			var work = Child.fork(Path.resolve(__dirname, "./slave.js"));
			work.id = id;
			work.on("message",function(m) {
				self.backResult(taskName, m , work);
			});
			var self = this;
			work.on("error", function(m) {
				//self.createWork(taskName, work.id );
			});
			var config = this.tasks[taskName].config;
			work.send({
				handle: "start",
				data: config
			});
			this.getTask(taskName, work);
		}
		this.startTask = function(taskName) {
			
			this.tasks[taskName].info = {
				startTime: Date.now(),
				fails:  {},
				sucess: 0,
				id: 0, 
				works: [],
				runs: {}
			};
			
			for(var i = 0, osLen = this.config.cpus ; i < osLen ; i++) {
				this.createWork(taskName, i );
			}
		}
		this.endTask = function(taskName) {
			var info = this.tasks[taskName].info;
			info.endTime = Date.now();
			this.emit(taskName, info);
			this.tasks[taskName].info = null;
			//this.tasks[taskName]; 
		}
		this.isDoing = function(taskName) {
			return this.tasks[taskName]  && this.tasks[taskName].info;
		}
		var addTask = function(tasks, task, data) {
			tasks.push({
				handle: task,
				data: data
			});
		}
		this.addTasks = function(taskName, task, data) {
			if(!latte_lib.isArray(data)) {
				return false; 
			}
			var self = this;
			var tasks = this.tasks[taskName].tasks;
			data.forEach(function(o) {
				addTask(tasks, task, o);
			});
			if(!this.isDoing(taskName)) {
				this.startTask(taskName);
			}
			return true;
		}
		this.setTaskConfig = function(taskName, config) {
			if(this.isDoing(taskName)) {
				return false;
			}
			//config.cwd = config.cwd || process.cwd() + "/index.js" ;
			this.tasks[taskName] = {
				config: config,
				tasks:[]
			};
			return true;
		}

	}).call(Master.prototype);
	this.create = function(config) {
		return new Master(config);
	}
}).call(module.exports);