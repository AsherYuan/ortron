/**
 * 日志工具
 * @type {[type]}
 */
var log4js = require('log4js');
var LoggerConfig = require('../../config/log4js.json');
var pomelo = require('pomelo');

var mylogger = module.exports;

log4js.configure(LoggerConfig, {});

mylogger.setLevel = function (level) {
    if(level === 'production') {
        log4js.getLogger('GAMEDEBUG').setLevel('ERROR');
        log4js.getLogger('HANDLERTIME').setLevel('DEBUG');
    } else if(level === 'development') {
        log4js.getLogger('GAMEDEBUG').setLevel('DEBUG');
        log4js.getLogger('HANDLERTIME').setLevel('DEBUG');
    }
};

mylogger.logCoinChange = function(uid, change, after, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:coin - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.debug = mylogger.logGameDebug;
