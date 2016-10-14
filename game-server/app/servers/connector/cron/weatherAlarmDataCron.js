var NoticeModel = require('../../../mongodb/models/NoticeModel');
var UserModel = require('../../../mongodb/models/UserModel');
var WarningModel = require('../../../mongodb/grabmodel/WarningModel');
var http = require("http");
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

	var options = {
		host: 'apis.baidu.com',
		port: 80,
		path: '/heweather/pro/weather?city=jiaxing',
		method: 'GET',
		headers: {
			'apikey': '9b08e1a6b87d5baf81fa15c2911b213c'
		}
	};

	var requestCallback = function (response) {

		response.setEncoding('utf-8');
		var receiveData = "";
		response.on('data', function (chunk) {
			receiveData += chunk;
		}).on('end', function () {
			var data = JSON.parse(receiveData);
			var list = data["HeWeather data service 3.0"];
			if (list[0].alarms != undefined && list.length > 0) {
				var alarms = list[0].alarms;
				if (alarms[0].level != undefined && alarms.length > 0) {
					var alar = "有预警";
					var level = alarms[0].level;
					var stat = alarms[0].stat;
					var title = alarms[0].title;
					var txt = alarms[0].txt;
					var type = alarms[0].type;

					var WarningEntity = new WarningModel({
						alarms: alar,
						level: level,
						stat: stat,
						title: title,
						txt: txt,
						type: type
					});
					WarningEntity.save(function (err) {
						if (err) console.log(err);
						else {
							UserModel.find({}, function (err, docs) {
								if (err) console.log(err);
								else {
									for (var i = 0; i < docs.length; i++) {
										var userMobile = docs[i].mobile;
										var hasRead = 0;
										var noticeType = 2;
										var summary = level + type + title;
										summary = summary.substring(0, 60);

										var NoticeEntity = new NoticeModel({
											userMobile: userMobile,
											hasRead: hasRead,
											title: title,
											content: txt,
											noticeType: noticeType,
											summary: summary
										});
										NoticeEntity.save(function (err) {
											if (err) console.log(err);
										});

										var mobile = docs[i].mobile;

										NoticeModel.count({hasRead: 0, userMobile: mobile}, function (err, count) {
											var param = {
												command: '9001',
												title: title,
												content: txt,
												addTime: new Date(),
												addTimeLabel: Moment(new Date()).format('HH:mm'),
												notReadCount:count
											};
											self.app.get('channelService').pushMessageByUids('onMsg', param, [{
												uid: mobile,
												sid: 'user-server-1'
											}]);
										});
									}
								}
							});
						}
					});
				}
			}
		});
	};

	var req = http.request(options, requestCallback).on('error', function (e) {
		console.log(e.message);
	});
	req.end();
};