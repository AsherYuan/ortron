var UserModel = require('../../../mongodb/models/UserModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var StringUtil = require('../../../util/StringUtil.js');
var logger = require('../../../util/logger');

module.exports = function(app) {
    return new UserRemote(app);
};

var UserRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

/**
 * 根据用户手机号码，查询用户信息
 * @param  {[type]}   userMobile [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
UserRemote.prototype.getUserInfo = function(userMobile, cb) {
    UserModel.findOne({userMobile:userMobile}, function(err, user) {
        if(err) {
            logger(err);
        } else {
            cb(user);
        }
    });
}

/**
 * 根据用户的手机号码，获取相关的主控信息
 * @param  {[type]}   userMobile [description]
 * @param  {[type]}   withFamily [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
UserRemote.prototype.getCenterBoxList = function(userMobile, withFamily, cb) {
    CenterBoxModel.find({userMobile:userMobile}, function(err, centerBoxs) {
        logger(centerBoxs);
        if(err) {
            // TODO make logger happen
            console.log(err);
        } else {
            cb(centerBoxs);
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
