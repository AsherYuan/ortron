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
var ResponseUtil = require('../../../util/ResponseUtil');

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
    console.log("----------------auth--------------------" + JSON.stringify(msg));
    console.log("----------------auth--------------------" + session);
    var self = this;
    var token = msg.token;

    var uid;
    var userGlobal;
    async.waterfall([
        function(cb) {
            //根据token获取uid
            var res = tokenManager.parse(token, authConfig.authSecret);
            if (!res) {
                next(null, ResponseUtil.resp(Code.ENTRY.FA_TOKEN_INVALID));
                return;
            } else {
                uid = res.uid;
                UserModel.find({'mobile':uid}, function(err, userDoc) {
                    if(err) {
                        next(null, ResponseUtil.resp(Code.ENTRY.FA_USER_NOT_EXIST));
                        return;
                    } else {
                        if (userDoc.length === 0) {
                            next(null, ResponseUtil.resp(Code.ACCOUNT.USER_NOT_EXIST));
                            return;
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
            session.bind(uid, cb);
        }, function(cb) {
            session.set('serverId', 'user-server-1');
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        }, function(cb) {
            // TODO 与userHandler中的getUserInfo合并到UserRemote中取去
            HomeModel.find({userMobile: uid}, function (err, homeDocs) {
                if (err) {
                    console.log(err);
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    HomeWifiModel.find({userMobile: uid}, function (err, homeWifiDocs) {
                        if (err) {
                            console.log(err);
                            next(null, ResponseUtil.resp(Code.DATABASE));
                        } else {
                            CenterBoxModel.find({userMobile: uid}, function (err, centerBoxDocs) {
                                if (err) {
                                    console.log(err);
                                    next(null, ResponseUtil.resp(Code.DATABASE));
                                } else {
                                    userGlobal.homeInfo = homeDocs;
                                    userGlobal.centerBox = centerBoxDocs;
                                    userGlobal.homeWifi = homeWifiDocs;

                                    next(null, ResponseUtil.resp(Code.OK, userGlobal));
                                }
                            });
                        }
                    });
                }
            });
        }
    ], function(err) {
        if(err) {
            console.log("auth错误::");
            next(null, ResponseUtil.resp(Code.FAIL));
            return null;
        }
    });
};

Handler.prototype.login = function (msg, session, next) {
    console.log("----------------login--------------------" + msg.mobile);
    var self = this;
    var mobile = msg.mobile;
    var password = msg.password;
    var sessionService = self.app.get('sessionService');
    var channelService = self.app.get('channelService');
    var uid = mobile;
    var userGlobal;
    if (StringUtil.isBlank(mobile)) {
        next(null, ResponseUtil.resp(Code.ACCOUNT.MOBILE_IS_BLANK));
        return;
    } else if (StringUtil.isBlank(password)) {
        next(null, ResponseUtil.resp(Code.ACCOUNT.PASSWORD_IS_BLANK));
        return;
    } else {
        async.waterfall([
            function (cb) {
                UserModel.find({'mobile': mobile}, function (err, userDoc) {
                    if (err) {
                        console.log(err);
                        next(null, ResponseUtil.resp(Code.ENTRY.FA_USER_NOT_EXIST));
                        return;
                    } else {
                        if (userDoc.length === 0) {
                            next(null, ResponseUtil.resp(Code.ACCOUNT.USER_NOT_EXIST));
                            return;
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
            }, function (cb) {
                // TODO 与userHandler中的getUserInfo合并到UserRemote中取去
                HomeModel.find({userMobile: uid}, function (err, homeDocs) {
                    if (err) {
                        console.log(err);
                        next(null, ResponseUtil.resp(Code.DATABASE));
                    } else {
                        HomeWifiModel.find({usermobile: uid}, function (err, homeWifiDocs) {
                            if (err) {
                                console.log(err);
                                next(null, ResponseUtil.resp(Code.DATABASE));
                            } else {
                                CenterBoxModel.find({userMobile: uid}, function (err, centerBoxDocs) {
                                    if (err) {
                                        console.log(err);
                                        next(null, ResponseUtil.resp(Code.DATABASE));
                                    } else {
                                        userGlobal.homeInfo = homeDocs;
                                        userGlobal.centerBox = centerBoxDocs;
                                        userGlobal.homeWifi = homeWifiDocs;

                                        var token = tokenManager.create(uid, authConfig.authSecret);
                                        next(null, {code:200,codetxt:'操作成功', data:userGlobal, token:token});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        ], function (err) {
            if (err) {
                console.log("auth错误::");
                next(null, ResponseUtil.resp(Code.FAIL));
                return null;
            }
        });
    }
};


Handler.prototype.estateLogin = function (msg, session, next) {
    var self = this;
    var sessionService = self.app.get('sessionService');
    var channelService = self.app.get('channelService');
    // TODO 后续分小区，现在是统一一个账号
    var uid = 'estate';
    async.waterfall([
        function (cb) {
            self.app.get('sessionService').kick(uid, cb);
        }, function (cb) {
            session.bind(uid, cb);
        }, function (cb) {
            session.set('serverId', 'user-server-1');
            session.on('closed', onUserLeave.bind(null, self.app));
            cb();
        }, function () {
            next(null, ResponseUtil.resp(Code.OK));
        }
    ], function (err) {
        if (err) {
            console.log("auth错误::");
            next(null, ResponseUtil.resp(Code.FAIL));
            return null;
        }
    });
};


Handler.prototype.manageLogin = function (msg, session, next) {
    var self = this;
    var username = msg.username;
    var password = msg.password;
    var sessionService = self.app.get('sessionService');
    var channelService = self.app.get('channelService');
    if(username == "admin" && password == "orz123") {
        var sessionService = self.app.get('sessionService');
        // 登录验证成功，处理session
        session.on('closed', onUserLeave.bind(null, self.app));
        session.bind(username);
        // 将uid存入session中
        session.set('adminUsername', username);

        // 获取token返回
        var token = tokenManager.create(username, authConfig.authSecret);
        next(null, {code:200,codetxt:'操作成功', token:token});
    } else {
        next(null, ResponseUtil.resp(Code.ACCOUNT.PASSWORD_NOT_CORRECT));
    }
};

/**
 * 注册用户信息
 *
 * @param  {Object}   msg     request message-
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.register = function (msg, session, next) {
    var self = this;
    var mobile = msg.mobile;
    var username = msg.username;
    var password = msg.password;

    if (StringUtil.isBlank(mobile)) {
        next(null, ResponseUtil.resp(Code.ACCOUNT.MOBILE_IS_BLANK));
    } else if (StringUtil.isBlank(username)) {
        next(null, Code.ACCOUNT.USERNAME_IS_BLANK);
        next(null, ResponseUtil.resp(Code.ACCOUNT.USERNAME_IS_BLANK));
    } else if (StringUtil.isBlank(password)) {
        next(null, Code.ACCOUNT.PASSWORD_IS_BLANK);
        next(null, ResponseUtil.resp(Code.ACCOUNT.PASSWORD_IS_BLANK));
    } else if (!RegexUtil.checkPhone(mobile)) {
        next(null, ResponseUtil.resp(Code.ACCOUNT.MOBILE_FORMAT_ERROR));
    } else {
        // 用户注册
        self.app.rpc.user.userRemote.register(session, mobile, username, password, function (msg) {
            next(null, ResponseUtil.resp(Code.OK, msg));
        });
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
