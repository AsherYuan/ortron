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

mylogger.logDiamondChange = function(uid, change, after, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:diamond - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logTicketChange = function(uid, change, after, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:ticket - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logFragmentChange = function(uid, change, after, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:frag - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logEnergyChange = function(uid, change, after, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:energy - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logCardexp = function(uid, cardorderid, cardid, change, after, cardidAfter, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        cardorderid:cardorderid,
        cardid:cardid,
        cardidAfter:cardidAfter,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:cardexp - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logBattelResult = function(uid, win, type, isRobot, score) {
    var obj = {
        uid:uid,
        win:win,
        type:type,
        isRobot : isRobot,
        score : score
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:battle - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logBattleCard = function(uid, cardid, cardtype, groupid) {
    var obj = {
        uid:uid,
        cardid:cardid,
        cardtype:cardtype,
        groupid:groupid
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:battlecard - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logSpecialEvent = function(uid, place, userLevel,insertEventid) {
    var obj = {
        uid:uid,
        place:place,
        userLevel : userLevel,
        insertEventid : insertEventid
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:specialevent - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logInspire = function(uid, times) {
    if(times > 0) {
        var obj = {
            uid:uid,
            times:times
        };
        var serverId = pomelo.app.get('LordCard_Serverid');
        var objJsonStr = 'Lkey:inspire - server' + serverId + ' - ' + JSON.stringify(obj);
        log4js.getLogger('GAMEDATA').info(objJsonStr);
    }
};

mylogger.logAbuse = function(uid, times) {
    if(times > 0) {
        var obj = {
            uid:uid,
            times:times
        };
        var serverId = pomelo.app.get('LordCard_Serverid');
        var objJsonStr = 'Lkey:abuse - server' + serverId + ' - ' + JSON.stringify(obj);
        log4js.getLogger('GAMEDATA').info(objJsonStr);
    }
};

mylogger.logGetCard = function(uid, cardid, rarity, groupid, reason) {
    var obj = {
        uid:uid,
        cardid:cardid,
        rarity:rarity,
        groupid:groupid,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:getcard - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logLostCard = function(uid, cardid, cardorderid, rarity, groupid, reason) {
    var obj = {
        uid:uid,
        cardid:cardid,
        orderid:cardorderid,
        rarity:rarity,
        groupid:groupid,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:lostcard - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logUserInfo = function(uid, level, coin, diamond, ticket, cardnum, maxlevel) {
    var obj = {
        uid:uid,
        level:level,
        coin:coin,
        diamond:diamond,
        ticket:ticket,
        cardnum:cardnum,
        maxlevel:maxlevel
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:userinfo - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logDig = function(uid, data) {
    var obj = {
        uid:uid,
        data:data
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:dig - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logExpChanged = function(uid, change, after, reason) {
    var obj = {
        uid:uid,
        change:change,
        after:after,
        reason:reason
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:exp - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logUserInActivity = function(uid, activityId) {
    var obj = {
        uid:uid,
        id:activityId
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:activity - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logUserNum = function(num) {
    var obj = {
        userNum:num
    };
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:activity - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

mylogger.logOthers = function(obj) {
    var serverId = pomelo.app.get('LordCard_Serverid');
    var objJsonStr = 'Lkey:activity - server' + serverId + ' - ' + JSON.stringify(obj);
    log4js.getLogger('GAMEDATA').info(objJsonStr);
};

// ***********************obsoleted log func. *************************//
mylogger.logLevelSet = function(uid, setValue, reason) {
    //log4js.getLogger('GAMEDATA').info('{uid: %d, key:level, value:%d, type:SET, reason:%s}', uid, setValue, reason);
};

mylogger.logSignatureSet = function(uid, setValue, reason) {
    //log4js.getLogger('GAMEDATA').info('{uid: %d, key:signature, value:%s, type:SET, reason:%s}', uid, setValue, reason);
};

mylogger.logFavorCardSet = function(uid, setValue, reason) {
    //log4js.getLogger('GAMEDATA').info('{uid: %d, key:favorcard, value:%d, type:SET, reason:%s}', uid, setValue, reason);
};

mylogger.logTitleAdd = function(uid, addValue, reason) {
    //log4js.getLogger('GAMEDATA').info('{uid: %d, key:title, value:%d, type:ADD, reason:%s}', uid, addValue, reason);
};

mylogger.logAchievementAdd = function(uid, addValue, reason) {
    //log4js.getLogger('GAMEDATA').info('{uid: %d, key:achievement, value:%d, type:ADD, reason:%s}', uid, addValue, reason);
};
// ***********************obsoleted log func. *************************//

mylogger.logGameWarn = function(data, hidetrace) {
    var serverId = pomelo.app.get('LordCard_Serverid');
    var args = Array.prototype.slice.call(arguments);
    var _logger = log4js.getLogger('GAMEWARN');

    if(typeof args[0] == 'string') {
        args[0] = 'server' + serverId + ' - ' + args[0];
    } else if(typeof args[0] == 'object') {
        args.unshift('server1- %j');
    }
    _logger.warn.apply(_logger, args);
//    console.trace();
};

mylogger.logGameError = function(data) {
    var serverId = pomelo.app.get('LordCard_Serverid');
    var args = Array.prototype.slice.call(arguments);
    var _logger = log4js.getLogger('GAMEERROR');

    if(typeof args[0] == 'string') {
        args[0] = 'server' + serverId + ' - ' + args[0];
    } else if(typeof args[0] == 'object') {
        args.unshift('server1- %j');
    }
    _logger.error.apply(_logger, args);
    console.trace();
};

mylogger.logGameSQL = function(data) {
    var serverId = pomelo.app.get('LordCard_Serverid');
    data = 'server' + serverId + ' - ' + data;
    log4js.getLogger('GAMESQL').debug(data);
};

mylogger.logGameStatus = function(uid, data) {
    var obj = {
        uid:uid,
        status:data
    };
    var objJsonStr = JSON.stringify(obj);
    log4js.getLogger('STATUS').debug(objJsonStr);
};

mylogger.logGameDebug = function(data) {
    var serverId = pomelo.app.get('LordCard_Serverid');
    var args = Array.prototype.slice.call(arguments);
    args[0] = 'server' + serverId + ' - ' + args[0];
    var _logger = log4js.getLogger('GAMEDEBUG');
    _logger.debug.apply(_logger, args);
};

mylogger.logHandlerTime = function(data) {
    var serverId = pomelo.app.get('LordCard_Serverid');
    var args = Array.prototype.slice.call(arguments);
    args.unshift('server' + serverId + ' - ');

    var _logger = log4js.getLogger('HANDLERTIME');
    _logger.debug.apply(_logger, args);
};

mylogger.debug = mylogger.logGameDebug;
