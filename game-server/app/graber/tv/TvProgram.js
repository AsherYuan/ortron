var mongoose = require('../../mongodb/mongoose');
var graber = require('../graber');
var TvChannelModel = require('../../mongodb/tv/TvChannelModel');
var TvProgramModel = require('../../mongodb/tv/TvProgramModel');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;
var Moment = require('moment');

var count = 0;

var saveProgram = function(date, beginTime, channelId, program, description) {
	var entity = new TvProgramModel({
		date:date,
		beginTime:beginTime,
		channelId:channelId,
		program:program,
		description:description
	});

	entity.save(function(err, p) {
		if(err) {
			console.log(err);
		} else {
			console.log(channelId + "_" + Moment(beginTime).format('YYYY-MM-DD HH:mm:ss') + "_" + program + "_____" + description);
		}
	});
};

var analysisPrograms = function(url, channelId, channel) {
	TvProgramModel.update({_id:new Object(channelId)}, {$set:{lastGrabTime:new Date()}}, function(err, update) {
	});

	graber.grab(url, function(html) {
		parseString(html, function (err, result) {
			if(!!result && result.rss) {
				var channels = result.rss.channel;
				if(!!channels) {
					var items = channels[0].item;
					if(!!items) {
						for(var j=0;j<items.length;j++) {
							var item = items[j];
							var title = item.title[0];
							var description = item.description[0];
							var date = Moment(new Date()).format('YYYY-MM-DD');
							var time = title.substring(1, title.indexOf("]")).trim();
							var title = title.substring(title.indexOf("]") + 1).trim();
							var beginTime = new Date(date + " " + time + ":00");
							saveProgram(date, beginTime, channelId, title, description, channel);
						}
					}
				}
			}
		});
	});
};

var grabTvPrograms = function () {
	TvChannelModel.find({}).exec().then(function(channels) {
		for(var i=0;i<channels.length;i++) {
			var url = channels[i].url;
			var id = channels[i]._id;
			var channel = channels[i].channel;
			analysisPrograms(url, id, channel);
		}
	}).catch(function(err) {
		console.log(err);
	});
};


grabTvPrograms();

