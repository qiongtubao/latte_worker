var WorkerMaster = require("../../lib/local/master");
var workerMaster =  WorkerMaster.create({
	cpus: 16
});
var data = [];
var time1 = Date.now();
var config = {
	dirname: __dirname,
	filename: __filename,
	path: "./handle"
};
var result = workerMaster.setTaskConfig("local", config);
var time = Date.now();
var minTime = time * 0.9;
var x = time * 0.1;
for(var i = 0; i <= 1000; i++) {
	var js = [];
	var result = {};
	for(var j = 0 ; j < 1000; j++) {
		var random = parseInt(Math.random() * 9000);
		if(js.indexOf(random) == -1) {
			js.push(random);
			var f = 1 + parseInt(Math.random() * 5);
			//data.push([i, random, f, minTime + x * Math.random()]);
			result[random] = {
				value: f,
				time: minTime + x * Math.random()
			}
		}
	}
	data.push({
		itemId: i,
		users: result
	});
}

workerMaster.addTasks("local", "addMongodb2",data);
workerMaster.on("local", function(info) {
	console.log(info);
	console.log((info.endTime - info.startTime )/ 60 /1000);
});
