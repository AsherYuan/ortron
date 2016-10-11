var mongoose = require('../mongoose.js');

var WarningScheme = new mongoose.Schema({
	alarms: {type: String, default: '无预警'},
	level: {type: String, default: '无'},
	stat: {type: String, default: '无'},
	title: {type: String, default: '无'},
	txt: {type: String, default: '无'},
	type: {type: String, default: '无'},
	addTime : {type:Date, default: Date.now}
});

var WarningModel = mongoose.model('warning', WarningScheme);
module.exports = WarningModel;