/**
 * Created with JetBrains WebStorm.
 * User: zhangyu
 * Date: 13-6-20
 * Time: 下午2:19
 */
var pomelo = require('pomelo');
var logger = require('../util/logger.js');
var memCached = pomelo.app.get("memclient");
var async = require('async');
var utils = require('../util/utils');
var schedule = require('pomelo-schedule');
var scheduledTask = require('./scheduledTask');

var msgService = module.exports;

msgService.nonsysMsgKey = 'REMOTE_SYSTEM_MESSAGE_KEY';
msgService.nonsysMsgInterval = 120; // 120 sec.
msgService.scheduleId = 0;

msgService.channelService = pomelo.app.get('channelService');

msgService.pushMessageByUids = function(msg, uids, cb) {
    if (!cb){
        cb = errHandler;
    }
    logger.debug(uids.length);
   this.channelService.pushMessageByUids(msg, uids, cb);
};

msgService.pushMessageToClient = function(route, msg, cb) {
    if (!cb){
        cb = errHandler;
    }

    var uids = [route];
    msgService.pushMessageByUids(msg, uids, cb);
};

/**
 * broadcast non-system message to all clients of 'connector' servers
 * @param uid player's uid for non-system msg
 * @param cardid   card id for non-system msg
 * @param type     (0/1) msg type for non-system msg
 * @param callback
 */
msgService.broadcastNonSystemMessage = function(uid, cardid, type, isfake, callback) {

    //参数处理
    var cb = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = null;
    var self = this;
    var msg = {route:'onRemoteNonSystemMessage', cardid:cardid, type:type};

    // get player's nick name
    AccountManager.getUserAccountEx(uid, function(err, info) {
        if(!!err || !info) {
            logger.logGameError('get user account ex info failed! %j' + err);
            return;
        }
        // check if should brocast?
        memCached.get(self.nonsysMsgKey, function(err, data) {
            if (err) {
                utils.invokeCallback(cb, err, null);
                return;
            }
            // if no date found(i.e. sending flag already cleard from memcache)
            if(!data) {
                async.waterfall([
                    function(cb) {
                        //brocast msg.
                        msg.playername = info.nickname;
                        self.channelService.broadcast('connector', msg.route, msg, {binded:true}, cb);
                    },
                    function(ids, cb) {
                        if(isfake === false) {
                            // set sending flag into memcache with timeout
                            //memCached.set(self.nonsysMsgKey, {time:new Date()}, self.nonsysMsgInterval, cb);
                            utils.invokeCallback(cb, null, true);
                        } else {
                          utils.invokeCallback(cb, null, true);
                        }
                    }], function(err, result) {
                    utils.invokeCallback(cb, err, result);
                });
            } else {
                utils.invokeCallback(cb, null, false);
            }
        });
    });
};


/**
 * broadcast system msg to all clients of 'connector' servers
 * @param text    message content in String
 * @param timeout   optional
 * @param callback
 */
msgService.broadcastSystemMessage = function(text, timeout, callback) {
    //参数处理
    var cb = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = null;

    var self = this;
    var msg = {route:'onRemoteSystemMessage', timeout:timeout};
    if(typeof(text) === 'string') {
        msg.msg = text;
    } else {
        msg.msg = text.text;
        msg.dtime = text.dtime;
    }
    //brocast msg.
    self.channelService.broadcast('connector', msg.route, msg, {binded:true}, function(err, failIds) {
        utils.invokeCallback(cb, err, failIds);
    });
};

/**
 * broadcast system msg with schedule
 * @param start  int
 * @param end    int
 * @param period int
 * @param text
 * @param timeout msg show duration by client
 * @param callback
 */
msgService.scheduleSystemMessage = function(start, end, period, text, timeout, callback) {
    //参数处理
    var cb = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = null;

    var count = parseInt((end - start) / period); // calc. total broadcast times
    var trigger = {start:start, period:period, count:count};
    this.scheduleId = schedule.scheduleJob(trigger,
        prepareScheduleSMsg,
        {end:end, text:text, timeout:timeout, callback:cb}
    );
    utils.invokeCallback(cb, null, false);
};

msgService.cancelSchedule = function() {
    if(this.scheduleId > 0) {
        schedule.cancelJob(this.scheduleId);
    }
};

msgService.broadcastSingleSysMsg = function(data) {
    prepareScheduleSMsg(data);
};

function prepareScheduleSMsg(data) {
    var deltaTime = data.end - Date.now();
    if(deltaTime < 0) {
        deltaTime = 0;
    }
    var text = {};
    if(data.text.indexOf('{0}') >= 0) {
        text.text = data.text;
        text.dtime = deltaTime;
    } else {
        text = data.text
    }
    msgService.broadcastSystemMessage(text, data.timeout, data.callback);
}

function errHandler(err, fails){
    if(!!err){
        logger.logGameError('Push Message error! %j', err.stack);
    }
}