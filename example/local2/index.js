var WorkerMaster = require("../../lib/local/master");
var Mongodb = require("latte_db").mongodb;
var config = require("./config.json");
Mongodb.bindDb("news", config);
var workerMaster =  WorkerMaster.create({
	cpus: 1
});
var data = [];
var time1 = Date.now();
var config = {
	dirname: __dirname,
	filename: __filename,
	path: "./handle"
};
var result = workerMaster.setTaskConfig("local", config);
var startTime = new Date(2016, 6, 4);
var CreateTask = require("./createTask").createTask(startTime.getTime(), function(data) {
	workerMaster.addTasks("local", "addMongodb",data);
});

workerMaster.on("local", function(info) {
	console.log(info);
	console.log((info.endTime - info.startTime )/ 60 /1000);
});
