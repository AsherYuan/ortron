var UserModel = require('../../../mongodb/models/UserModel');
var NoticeModel = require('../../../mongodb/models/NoticeModel');
var SuggestionModel = require('../../../mongodb/grabmodel/SuggestionModel');
var cheerio = require('cheerio');
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

    var todayL = Moment(new Date()).format('YYYY-MM-DD') + " 00:00:00";
    var todayH = Moment(new Date()).format('YYYY-MM-DD') + " 23:59:59";

    SuggestionModel.find({$and:[{addTime:{$gt:todayL}}, {addTime:{$lt:todayH}}]}, function(err, docs) {
        if(err) {
            console.log(err);
        } else {
            if(!!docs && docs.length > 0) {
                console.log('今日已有数据');
            } else {
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
                        if (list[0].suggestion != undefined && list.length > 0) {
                            var suggestion = list[0].suggestion;
                            if (suggestion.drsg != undefined) {
                                var drsg = suggestion.drsg.brf + "," + suggestion.drsg.txt;
                                var flu = suggestion.flu.brf + "," + suggestion.flu.txt;
                                var suggest = "穿衣建议及以防感冒";

                                var SuggestionEntity = new SuggestionModel({
                                    suggestion: suggest,
                                    drsg: drsg,
                                    flu: flu
                                });

                                SuggestionEntity.save(function (err) {
                                    if (err) console.log(err);
                                    else {
                                        UserModel.find({}, function (err, docs) {
                                        	if (err) console.log(err);
                                        	else {
                                        		for (var i = 0; i < docs.length; i++) {
                                        			var userMobile = docs[i].mobile;
                                        			var hasRead = 0;
                                        			var noticeType = 3;
                                        			var summary = (drsg + flu).substring(0, 60);

                                        			var NoticeEntity = new NoticeModel({
                                        				userMobile: userMobile,
                                        				hasRead: hasRead,
                                        				title: suggest,
                                        				content: drsg + flu,
                                        				noticeType: noticeType,
                                        				summary: summary
                                        			});

                                        			NoticeEntity.save(function (err) {
                                        				if (err) console.log(err);
                                        			});

                                        			var mobile = docs[i].mobile;
													NoticeModel.count({hasRead: 0, userMobile: mobile}, function (err, count) {
														var param = {
															command: '9003',
															title: suggest,
															content: drsg + flu,
															addTime: new Date(),
															addTimeLabel: Moment(new Date()).format('HH:mm'),
															mobile: mobile,
															notReadCount: count
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
            }
        }
    });
};