/**
 * Created with JetBrains WebStorm.
 * User: zhangyu
 * Date: 14-1-2
 * Time: 上午11:22
 */
var pomelo = require('pomelo');
var schedule = require('pomelo-schedule');
var logger = require('../util/logger.js');
var utils = require("../util/utils.js");

var task = module.exports;

task.schedule_act20140101 = null; // 元旦活动ID


// 每小时整点记录在线玩家
task.logOnlineUser = function() {
    if( pomelo.app.getServerType() !== 'connector') {
        return;
    }
    if (pomelo.app.get('env') != 'production'){
        //测试服不加定时
        return;
    }
    schedule.scheduleJob("0 * * * * *", task._doLogOnlineUser, {});
};

task._doLogOnlineUser = function(data) {
    var sesseionService =  pomelo.app.get('sessionService');
    var userNum = 0;
    sesseionService.forEachBindedSession(function(session) {
        ++userNum;
    });
    logger.logUserNum(userNum);
};

