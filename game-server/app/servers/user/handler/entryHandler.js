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
            console.log('第一步:' + JSON.stringify(res));
            if (!res) {
                next(null, Code.ENTRY.FA_TOKEN_INVALID);
                return;
            } else {
                uid = res.uid;
                console.log('第二步:');
                UserModel.find({'mobile':uid}, function(err, userDoc) {
                    if(err) {
                        console.log(err);
                        next(null, Code.ENTRY.FA_USER_NOT_EXIST);
                        return;
                    } else {
                        if (userDoc.length === 0) {
                            next(null, Code.ACCOUNT.USER_NOT_EXIST);
                            return;
                        } else {
                            console.log('第二步:' + JSON.stringify(userDoc));
                            userGlobal = userDoc;
                            cb();
                        }
                    }
                });
            }
        }, function(cb) {
            console.log("第三步");
            self.app.get('sessionService').kick(uid, cb);
        }, function(cb) {
            console.log("第四步");
            session.bind(uid, cb);
        }, function(cb) {
            session.set('serverId', 'user-server-1');
            session.on('closed', onUserLeave.bind(null, self.app));
            console.log("第五步");
            session.pushAll(cb);
        }, function(cb) {
            console.log("第六步");
            // TODO 与userHandler中的getUserInfo合并到UserRemote中取去
            HomeModel.find({userMobile: uid}, function (err, homeDocs) {
                if (err) {
                    console.log(err);
                    next(null, Code.DATABASE);
                } else {
                    HomeWifiModel.find({usermobile: uid}, function (err, homeWifiDocs) {
                        if (err) {
                            console.log(err);
                            next(null, Code.DATABASE);
                        } else {
                            CenterBoxModel.find({userMobile: uid}, function (err, centerBoxDocs) {
                                if (err) {
                                    console.log(err);
                                    next(null, Code.DATABASE);
                                } else {
                                    userGlobal.homeInfo = homeDocs;
                                    userGlobal.centerBox = centerBoxDocs;
                                    userGlobal.homeWifi = homeWifiDocs;

                                    var ret = Code.OK;
                                    ret.data = userGlobal;
                                    next(null, ret);
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
            next(null, Code.FAIL);
            return null;
        }
    });
};

Handler.prototype.login = function (msg, session, next) {
    console.log("----------------login--------------------" + msg.mobile);
    console.log("----------------login--------------------" + msg.password);
    var self = this;
    var mobile = msg.mobile;
    var password = msg.password;
    var sessionService = self.app.get('sessionService');
    var channelService = self.app.get('channelService');
    var uid = mobile;
    var userGlobal;
    if (StringUtil.isBlank(mobile)) {
        next(null, Code.ACCOUNT.MOBILE_IS_BLANK);
        return;
    } else if (StringUtil.isBlank(password)) {
        next(null, Code.ACCOUNT.PASSWORD_IS_BLANK);
        return;
    } else {
        async.waterfall([
            function (cb) {
                console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" + mobile);
                UserModel.find({'mobile': mobile}, function (err, userDoc) {
                    if (err) {
                        console.log(err);
                        console.log("Code::Code.ENTRY.FA_USER_NOT_EXIST");
                        next(null, Code.ENTRY.FA_USER_NOT_EXIST);
                        return;
                    } else {
                        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                        console.log(JSON.stringify(userDoc));
                        if (userDoc.length === 0) {
                            console.log("Code::Code.ACCOUNT.USER_NOT_EXIST");
                            next(null, Code.ACCOUNT.USER_NOT_EXIST);
                            return;
                        } else {
                            console.log('a第二步:' + JSON.stringify(userDoc));
                            userGlobal = userDoc;
                            cb();
                        }
                    }
                });
            }, function (cb) {
                console.log("a第三步");
                console.log(self.app.get('sessionService').getByUid(uid));
                self.app.get('sessionService').kick(uid, cb);
            }, function (cb) {
                console.log("a第四步");
                session.bind(uid, cb);
            }, function (cb) {
                session.set('serverId', 'user-server-1');
                session.on('closed', onUserLeave.bind(null, self.app));
                console.log("a第五步");
                session.pushAll(cb);
            }, function (cb) {
                console.log("a第六步");
                // TODO 与userHandler中的getUserInfo合并到UserRemote中取去
                HomeModel.find({userMobile: uid}, function (err, homeDocs) {
                    if (err) {
                        console.log(err);
                        next(null, Code.DATABASE);
                    } else {
                        HomeWifiModel.find({usermobile: uid}, function (err, homeWifiDocs) {
                            if (err) {
                                console.log(err);
                                next(null, Code.DATABASE);
                            } else {
                                CenterBoxModel.find({userMobile: uid}, function (err, centerBoxDocs) {
                                    if (err) {
                                        console.log(err);
                                        next(null, Code.DATABASE);
                                    } else {
                                        userGlobal.homeInfo = homeDocs;
                                        userGlobal.centerBox = centerBoxDocs;
                                        userGlobal.homeWifi = homeWifiDocs;

                                        var ret = Code.OK;
                                        ret.data = userGlobal;
                                        var token = tokenManager.create(uid, authConfig.authSecret);
                                        ret.token = token;
                                        console.log("json:" + JSON.stringify(ret));
                                        next(null, ret);
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
                next(null, Code.FAIL);
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
            next(null, Code.OK);
        }
    ], function (err) {
        if (err) {
            console.log("auth错误::");
            next(null, Code.FAIL);
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
    console.log(username);
    console.log(password);
    if(username == "admin" && password == "orz123") {
        var sessionService = self.app.get('sessionService');
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
        next(null, Code.ACCOUNT.MOBILE_IS_BLANK);
    } else if (StringUtil.isBlank(username)) {
        next(null, Code.ACCOUNT.USERNAME_IS_BLANK);
    } else if (StringUtil.isBlank(password)) {
        next(null, Code.ACCOUNT.PASSWORD_IS_BLANK);
    } else if (!RegexUtil.checkPhone(mobile)) {
        next(null, Code.ACCOUNT.MOBILE_IS_BLANK);
    } else {
        // 用户注册
        self.app.rpc.user.userRemote.register(session, mobile, username, password, function (msg) {
            var ret = Code.OK;
            ret.msg = msg;
            next(null, ret);
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
