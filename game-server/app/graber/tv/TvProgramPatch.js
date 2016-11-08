var mongoose = require('../../mongodb/mongoose');
var TvChannelModel = require('../../mongodb/tv/TvChannelModel');
var TvProgramModel = require('../../mongodb/tv/TvProgramModel');
var Moment = require('moment');

var count = 0;

var updateEndTime = function(pId, endTime) {
	TvProgramModel.update({_id:new Object(pId)}, {$set:{endTime:endTime}}, function(err, info) {
		if(err) {
			console.log(err);
		} else {
			console.log((count++) + "补丁完成");
		}
	});
};

var getAllProgramList = function(channelId) {
	TvProgramModel.find({channelId:channelId}).sort({beginTime:1}).exec().then(function(programs) {
		var beginTime, endTime;
		for(var i=0;i<programs.length;i++) {
			if(i === programs.length - 1) {
				beginTime = programs[i].beginTime;
				endTime = programs[i].beginTime;
				endTime = new Date(Moment(beginTime).format('YYYY-MM-DD') + " " + "23:59:59");
			} else {
				beginTime = programs[i].beginTime;
				endTime = programs[i + 1].beginTime;
				endTime = new Date(endTime.getTime() - 1000);
			}
			updateEndTime(programs[i]._id, endTime);
		}
	}).catch(function(err) {
		console.log(err);
	});
};

var grabTvPrograms = function () {
	TvChannelModel.find({}).exec().then(function(channels) {
		for(var i=0;i<channels.length;i++) {
			var id = channels[i]._id;
			getAllProgramList(id);
		}
	}).catch(function(err) {
		console.log(err);
	});
};


grabTvPrograms();

