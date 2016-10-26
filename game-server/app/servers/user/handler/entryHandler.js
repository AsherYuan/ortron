var authConfig = require('../../../domain/auth/authConfig');
var tokenManager = require('../../../domain/auth/token');
var Code = require('../../../domain/code');
var pomelo = require('pomelo');
var UserModel = require('../../../mongodb/models/UserModel');
var sessionManager = require('../../../domain/sessionService.js');
var StringUtil = require('../../../util/StringUtil.js');
var RegexUtil = require('../../../util/RegexUtil.js');
var HomeModel = require('../../../mongodb/models/HomeModel');
var HomeWifiModel = require('../../../mongodb/models/HomeWifiModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var async = require('async');
var UserVerifyModel = require("../../../mongodb/models/UserVerifyModel");
var ResponseUtil = require("../../../util/ResponseUtil");


module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

/**
 * 账户验证
 *
 * @param  {Object}   msg     request message-
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.auth = function (msg, session, next) {
    var self = this;
    var token = msg.token;

    var uid;
    var userGlobal;
    async.waterfall([
        function(cb) {
            //根据token获取uid
            var res = tokenManager.parse(token, authConfig.authSecret);
            if (!res) {
                next(null, Code.ENTRY.FA_TOKEN_INVALID);
            } else {
                uid = res.uid;
                console.log('用户：：' + uid);
                UserModel.find({'mobile':uid}, function(err, userDoc) {
                    if(err) {
                        console.log(err);
                        next(null, ResponseUtil.resp(Code.DATABASE));
                    } else {
                        if (userDoc.length === 0) {
                            next(null, ResponseUtil.resp(Code.ACCOUNT.USER_NOT_EXIST));
                        } else {
                            userGlobal = userDoc;
                            cb();
                        }
                    }
                });
            }
        }, function(cb) {
            self.app.get('sessionService').kick(uid, cb);
        }, function(cb) {
            // self.app.get('globalChannelService').add('testChannel', uid, 'user-server-1', function() {
            //     session.bind(uid, cb);
            // });
            session.bind(uid, cb);
        }, function(cb) {
            session.set('serverId', 'user-server-1');
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        }, function() {
            self.app.rpc.home.homeRemote.getHomeInfoByMobile(session, uid, function(homes) {
                userGlobal.homeInfo = homes;
                var token = tokenManager.create(uid, authConfig.authSecret);
                next(null, {code:200, codetxt:'操作成功', data:userGlobal, token:token});
            });
        }
    ], function(err) {
        if(err) {
            console.log("auth错误::");
            next(null, Code.FAIL);
            return null;
        }
    });
};

/**
 * 登录功能，后期需要APP端配合，改增为只做登录验证，和token获取，实际初始化session这些功能放入auth接口
 * TODO
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.login = function (msg, session, next) {
    var self = this;
    var sessionService = self.app.get('sessionService');
    var channelService = self.app.get('channelService');

    var mobile = msg.mobile;
    var password = msg.password;
    var uid = mobile;
    var userGlobal;

    if (StringUtil.isBlank(mobile)) {
        next(null, ResponseUtil.resp(Code.ACCOUNT.MOBILE_IS_BLANK));
    } else if (StringUtil.isBlank(password)) {
        next(null, ResponseUtil.resp(Code.ACCOUNT.PASSWORD_IS_BLANK));
    } else {
        async.waterfall([
            function (cb) {
                UserModel.findOne({'mobile': mobile}, function (err, userDoc) {
                    if (err) {
                        console.log(err);
                        next(null, ResponseUtil.resp(Code.DATABASE));
                    } else {
                        if (userDoc.length === 0) {
                            next(null, Code.ACCOUNT.USER_NOT_EXIST);
                        } else {
                            userGlobal = userDoc;
                            cb();
                        }
                    }
                });
            }, function (cb) {
                self.app.get('sessionService').kick(uid, cb);
            }, function (cb) {
                session.bind(uid, cb);
            }, function (cb) {
                session.set('serverId', 'user-server-1');
                session.on('closed', onUserLeave.bind(null, self.app));
                session.pushAll(cb);
            }, function () {
                self.app.rpc.home.homeRemote.getHomeInfoByMobile(session, uid, function(homes) {
                    userGlobal.homeInfo = homes;
                    var token = tokenManager.create(uid, authConfig.authSecret);
                    next(null, {code:200, codetxt:'操作成功', data:userGlobal, token:token});
                });
            }
        ], function (err) {
            if (err) {
                console.log("login错误::");
                next(null, Code.FAIL);
                return null;
            }
        });
    }
};

Handler.prototype.manageLogin = function (msg, session, next) {
    var self = this;
    var username = msg.username;
    var password = msg.password;
    var sessionService = self.app.get('sessionService');
    var channelService = self.app.get('channelService');
    console.log(username);
    console.log(password);
    if(username == "admin" && password == "orz123") {
        // 登录验证成功，处理session
        session.on('closed', onUserLeave.bind(null, self.app));
        session.bind(username);
        // 将uid存入session中
        session.set('adminUsername', username);

        // 获取token返回
        var token = tokenManager.create(username, authConfig.authSecret);
        var ret = Code.OK;
        ret.token = token;
        next(null, ret);
    } else {
        next(null, Code.ACCOUNT.PASSWORD_NOT_CORRECT);
    }
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    console.log('用户离开,session消除 [' + session.uid + ']' + new Date());
    // sessionManager.delSession(session.uid);
};
