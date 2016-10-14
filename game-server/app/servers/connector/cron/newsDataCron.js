var NoticeModel = require('../../../mongodb/models/NoticeModel');
var UserModel = require('../../../mongodb/models/UserModel');
var StringUtil = require('../../../util/StringUtil');
var ZixunModel = require('../../../mongodb/grabmodel/ZixunModel');
var cheerio = require('cheerio');
var graber = require('../../../graber/graber');
var Moment = require('moment');

module.exports = function (app) {
	return new Cron(app);
};
var Cron = function (app) {
	this.app = app;
};

/**
 * 定时任务，定时给所有用户去推送消息
 */
Cron.prototype.currentData = function () {
	var self = this;
	graber.grab("http://www.bjnews.com.cn/realtime-page-1.html", function (html) {
		var $ = cheerio.load(html);
		var news = $('#main').children('.lleft').children('.news');
		var i = 0;
		var title = "";
		var href = "";
		var text = "";
		news.map(function () {
			var news = $(this);
			i = i + 1;
			if (i < 2) {
				title = news.find('dd').text().trim();
				href = news.find('a').attr('href');
				text = news.find('p').text().trim();
			}
		});
		console.log(title);
		console.log(href);
		console.log(text);

		ZixunModel.find({title: title}, function (err, doc) {
			if (doc.length == 0) {
				var ZixunEntity = new ZixunModel({
					title: title,
					text: text,
					href: href
				});

				var summary = text.substring(60);

				ZixunEntity.save(function (err) {
					if (err) {
						console.log(err);
					} else {
						UserModel.find({}, function(err, users) {
							if(err) {
								console.log(err);
							} else {
								for(var i=0; i<users.length; i++) {
									var userMobile = users[i].mobile;
									var NoticeEntity = new NoticeModel({
										userMobile: userMobile,
										hasRead: 0,
										title: title,
										content: text,
										noticeType: 1,
										summary: summary
									});
									NoticeEntity.save(function (err) {
										if (err) console.log(err);
									});

									NoticeModel.count({hasRead: 0, userMobile: userMobile}, function (err, count) {
										// 保存成功，开始向用户发送消息
										var param = {
											command: '9002',
											title: title,
											content: text,
											addTime: new Date(),
											addTimeLabel: Moment(new Date()).format('HH:mm'),
											summary: summary,
											notReadCount: count
										};
										self.app.get('channelService').pushMessageByUids('onMsg', param, [{
											uid: userMobile,
											sid: 'user-server-1'
										}]);
									});
								}
							}
						});
					}
				});
			}
		});

	});
};