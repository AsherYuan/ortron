var UserModel = require('../../../mongodb/models/UserModel');
var WeatherModel = require('../../../mongodb/grabmodel/WeatherModel');
var cheerio = require('cheerio');
var http = require("http");

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
			if (list[0].aqi != undefined && list.length > 0) {
				var item = list[0];
				var pm = item.aqi.city.pm25;
				var tem = item.now.tmp;
				var hum = item.now.hum;
			} else {
				var pm = "";
				var tem = "";
				var hum = "";
			}

			var WeatherEntity = new WeatherModel({
				temperature: tem,
				humidity: hum,
				pm: pm
			});

			WeatherEntity.save(function (err) {
				if (err) console.log(err);
				else {
					UserModel.find({}, function (err, docs) {
						if (err) console.log(err);
						else {
							for (var i = 0; i < docs.length; i++) {
								var mobile = docs[i].mobile;
								var param = {
									command: '5000',
									temperature: tem,
									humidity: hum,
									pm25: pm,
									addTime: new Date()
								};
								self.app.get('channelService').pushMessageByUids('onMsg', param, [{
									uid: mobile,
									sid: 'user-server-1'
								}]);
							}
						}
					});
				}
			});

		});
	};

	var req = http.request(options, requestCallback).on('error', function (e) {
		graber.grab("http://op.juhe.cn/onebox/weather/query?cityname=%E5%98%89%E5%85%B4&key=820547eeb81e7d49f898d8e416db57dd", function (html) {
			var c = JSON.parse(html);
			var tem = c.result.data.realtime.weather.temperature;
			var hum = c.result.data.realtime.weather.humidity;
			var air = c.result.data.pm25.pm25.curPm;
			var pm = c.result.data.pm25.pm25.pm25;
			var WeatherEntity = new WeatherModel({
				temperature: tem,
				humidity: hum,
				air: air,
				pm: pm
			});
			WeatherEntity.save(function (err) {
				if (err) {
					console.log(err);
				} else {
					UserModel.find({}, function (err, docs) {
						if (err) console.log(err);
						else {
							for (var i = 0; i < docs.length; i++) {
								var mobile = docs[i].mobile;
								var param = {
									command: '5000',
									temperature: tem,
									humidity: hum,
									pm25: pm,
									addTime: new Date()
								};
								self.app.get('channelService').pushMessageByUids('onMsg', param, [{
									uid: mobile,
									sid: 'user-server-1'
								}]);
							}
						}
					});
				}
			});
		});
	});
	req.end();
};