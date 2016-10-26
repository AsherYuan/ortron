var UserModel = require('../../../mongodb/models/UserModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var WaitingUserChoiseModel = require('../../../mongodb/models/WaitingUserChoiseModel');
var StringUtil = require('../../../util/StringUtil.js');
var logger = require('pomelo-logger').getLogger('pomelo',  __filename);
var Promise = require('bluebird');
var Moment = require('moment');

module.exports = function(app) {
    return new UserRemote(app);
};

var UserRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

/**
 * 根据用户手机号码，查询单个用户的基本信息getUserInfoByMobile
 * @param  {[type]}   userMobile [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
UserRemote.prototype.getUserInfoByMobile = function(userMobile, cb) {
    UserModel.findOne({mobile:userMobile}, function(err, user) {
        if(err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null, user);
        }
    });
};

/**
 * 用户注册
 *
 * @param {String} mobile 手机号码
 * @param {String} username 用户名
 * @param {String} password 密码
 *
 */
UserRemote.prototype.register = function(mobile, username, password, cb) {
    UserModel.find({
        $or: [{
            'mobile': mobile
        }, {
            'username': username
        }]
    }, function(err, docs) {
        if (err) {
            console.log('UserModel.prototype.find:err:' + JSON.stringify(err));
            cb('注册成功');
        } else {
            if (docs.length === 0) {
                var UserEntity = new UserModel({
                    mobile: mobile,
                    username: username,
                    password: password
                });
                UserEntity.save(function(err, docs) {
                    if (err) {
                        console.log('UserModel.prototype.save:err:' + JSON.stringify(err));
                        cn('注册失败');
                    } else {
                        cb('注册成功');
                    }
                });
            } else {
                cb('手机号码或用户名重复');
            }
        }
    });
};

UserRemote.prototype.login = function(mobile, password, cb) {
    UserModel.find({
        'mobile': mobile
    }, function(err, docs) {
        if (err) {
            console.log("RegAndLogRemote.prototype.login:err:" + err);
        } else if (docs.length === 0) {
            cb(-1);
        } else {
            if (password === docs[0].password) {
                var conditions = {
                    mobile: mobile
                };
                var update = {
                    $set: {
                        lastLoginTime: new Date()
                    }
                };
                UserModel.update(conditions, update, null, function(error) {
                    if (error) {
                        console.log(error);
                    } else {
                        cb(0);
                    }
                });
            } else {
                cb(-2);
            }
        }
    });
};

UserRemote.prototype.userInfoCheck = function(mobile, cb) {
    UserModel.find({
        'mobile': mobile
    }, function(err, docs) {
        if (err) console.log('UserRemote.prototype.userInfoCheck:err' + err);
        else {
            if (docs.length === 0) {
                cb(-1);
            } else {
                var user = docs[0];
                if (StringUtil.isBlank(user.name)) {
                    cb(-2);
                } else if (StringUtil.isBlank(user.floorId)) {
                    cb(-3);
                }
            }
        }
    });
};

/**
 * 更新用户信息
 * @param  {[type]}   mobile [description]
 * @param  {[type]}   name   [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
UserRemote.prototype.updateUserInfo = function(mobile, name, cb) {
    var conditions = {
        mobile: mobile
    };
    var update = {
        $set: {
            name: name
        }
    };
    UserModel.update(conditions, update, null, function(error) {
        if (error) {
            console.log(error);
        } else {
            cb(0);
        }
    });
};

/**
 * 等待用户选择
 * @return {[type]} [description]
 */
UserRemote.prototype.waitingForUserToChoose = function(loccode, runtimeinfo_id, optionList, userMobile, cb) {
    var entity = new WaitingUserChoiseModel({
        loccode:loccode,
        runtimeinfo_id:runtimeinfo_id,
        optionList:optionList,
        userMobile:userMobile
    });
    console.log(JSON.stringify(entity));
    entity.save(function(err) {
        if(err) {
            cb(err);
        } else {
            console.log("保存&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
            cb(null);
        }
    });
};

/**
 * 查找用户10分钟内的所有上下文
 * @param  {[type]}   userMobile [description]
 * @param  {[type]}   words      [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
UserRemote.prototype.checkIfChoise = function(userMobile, words, cb) {
    var now = new Date();
    var min = now.getMinutes();
    min = min - 1000;
    now.setMinutes(min);
    WaitingUserChoiseModel.find({addTime:{"$gte":now}, userMobile:userMobile, optionList:words, answered:false}, function(err, list) {
        if(err) {
            cb(err);
        } else {
            cb(null, list);
        }
    });
};

/**
 * 将回答设为已经回答过
 * @param  {[type]}   userMobile [description]
 * @param  {[type]}   words      [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
UserRemote.prototype.answered = function(id, cb) {
    WaitingUserChoiseModel.update({_id:new Object(id)}, {$set:{answered:true}}, function(err) {
        if(err) {
            cb(err);
        } else {
            cb(null);
        }
    });
};
