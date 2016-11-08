var mongoose = require('../../mongodb/mongoose');
var graber = require('../graber');
var TvChannelModel = require('../../mongodb/tv/TvChannelModel');
var cheerio = require('cheerio');

var grabTvChannel = function () {
	var domain = "http://www.baitv.com";
	graber.grab(domain + "/rss/", function (html) {
		var $ = cheerio.load(html, {decodeEntities: false});
		$(".all-channels").each(function(i, item) {
			var area = $(item).children("h2").html();
			area = area.substring(0, area.indexOf("<"));
			area = area.trim();
			if(area === '香港' || area === '澳门' || area === '台湾' || area === '海外') {
				// do nothing
			} else {
				$(item).find("li").each(function(j, c) {
					var url = domain +  $(c).children("a").attr("href");
					var channel = $(c).children("a").attr("title");
					if(!!url && !!channel && !!area) {
						console.log(url + "___" + channel + "___" + area);
						saveTvChannel(url, channel, area);	
					}
				});
			}
		});
	});
};

var saveTvChannel = function(url, channel, area) {
	var entity = new TvChannelModel({
		url:url,
		channel:channel,
		area:area
	});

	entity.save(function(err, channel) {
		if(err) {
			console.log(err);
		} else {
			console.log(JSON.stringify(channel) + "保存完成");
		}
	});
};

grabTvChannel();

