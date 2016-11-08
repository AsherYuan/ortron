var mongoose = require('../mongoose.js');

var TvProgramSchema = new mongoose.Schema({
	date:String,
	beginTime:Date,
	endTime:Date,
	channelId:String,
	program:String,
	description:String
});

var TvProgramModel = mongoose.model('tvProgram', TvProgramSchema);
module.exports = TvProgramModel;