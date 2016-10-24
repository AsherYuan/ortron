var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var logger = require('pomelo-logger').getLogger('pomelo',  __filename);

module.exports = function (app) {
	return new Cron(app);
};
var Cron = function (app) {
	this.app = app;
};

/**
 * 定时任务，定时给所有用户去推送消息
 */
Cron.prototype.notice = function () {
	var self = this;
    CenterBoxModel.find({onlineConfirmed:false, isOnline:true}, function(err, centerBoxs) {
        var renderNotise = function(serialno, userMobile) {
            return new Promise(function (resolve, reject) {
                var param = {
                    command: '1000',
                    msg: '控制器上线, 串号:' + serialno,
                    serialno : serialno
                };
                self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                    uid: userMobile,
                    sid: 'user-server-1'
                }]);
                reject();
            });
        };
        var toRandering = [];
        for(var i=0;i<centerBoxs.length;i++) {
            toRandering.push(renderNotise(centerBoxs[i].serialno, centerBoxs[i].userMobile));
        }
        Promise.all(toRandering).then(function() {
            logger.info('反复通知用户主控上线全部娃娃完成');
        });
    });
};
