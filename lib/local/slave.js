var Handles = require("./handle");
var handles = new Handles();
process.on("message", function(m) {
	switch(m.handle) {
		case "start":
			handles.init(m.data, function(err, data) {
				process.send({
					handle: "start",
					err: err,
					data: data
				});
			});
		break;
		case "close":
		break;
		default:
			handles.doHandle(m.handle, m.data, function(err, data) {
				process.send({
					latte_taskId: m.latte_taskId,
					err: err,
					data: data
				});
			}); 
		break;
	}
});