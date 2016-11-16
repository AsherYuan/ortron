var mongoose = require('../mongoose.js');

var TvChannelSchema = new mongoose.Schema({
	url:String,
	channel:String,
	area:String,
	channelNum:Number,
	alias:String,
	lastGrabTime:{type:Date, default:Date.now}
});

var TvChannelModel = mongoose.model('tvChannel', TvChannelSchema);
module.exports = TvChannelModel;
