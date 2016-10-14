var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var TerminalModel = require('../../../mongodb/models/TerminalModel');
var TSensorDataModel = require('../../../mongodb/models/TSensorDataModel');

var Moment = require('moment');

module.exports = function (app) {
    return new Cron(app);
};
var Cron = function (app) {
    this.app = app;
};

var sendQuery = function(curIpAddress, curPort, centerBoxSerialno, channelService) {
    if((!! curIpAddress) && (!! curPort)) {
        TerminalModel.find({centerBoxSerialno:centerBoxSerialno, isOnline:true}, function(error, terminals) {
            if(error) {
                console.log(error);
            } else {
                if(!!terminals) {
                    for (var i = 0; i < terminals.length; i++) {
                        var homeGridId = terminals[i].homeGridId;
                        var param = {
                            command: '2005',
                            ipAddress: curIpAddress,
                            data: homeGridId,
                            port: curPort
                        };
                        channelService.pushMessageByUids('onMsg', param, [{
                            uid: 'socketServer*otron',
                            sid: 'connector-server-1'
                        }]);
                    }
                }
            }
        });
    }
}

/**
 * 定时任务，定时给所有用户去推送消息
 */
Cron.prototype.getSensorData = function () {
    var self = this;
    /**
     * 查找所有主控，要求有IP和PORT，来方便通信
     */
    CenterBoxModel.find({}, function(error, centerBoxs) {
        if(error) {
            console.log(error);
        } else {
            if(!!centerBoxs) {
                for(var i=0;i<centerBoxs.length;i++) {
                    var cbString = JSON.stringify(centerBoxs[i]);
                    var centerBox = JSON.parse(cbString);
                    var curIpAddress = centerBox.curIpAddress;
                    var curPort = centerBox.curPort;
                    var centerBoxSerialno = centerBox.serialno;
                    sendQuery(curIpAddress, curPort, centerBoxSerialno,  self.app.get('channelService'));
                }
            }
        }
    });
};