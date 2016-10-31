var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var AccountModel = require("../../../mongodb/estateModels/AccountModel");

var async = require('async');

var EstateRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

module.exports = function(app) {
    return new EstateRemote(app);
};

/**
 * 根据ID获取家庭信息
 * @param  {[type]}   homeId [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
EstateRemote.prototype.login = function(username, password, cb) {
    AccountModel.findOne({
        username: username
    }, function(err, manager) {
        if (err) {
            logger.error(err);
            cb(Code.DATABASE);
        } else {
            if (!manager) {
                cb(Code.ESTATE.MANGAER_NOT_EXIST);
            } else {
                if (manager.passord === password) {
                    var token = tokenManager.create(username, authConfig.authSecret);
                    cb(null, token);
                } else {
                    cb(Code.ESTATE.PASSWORD_NOT_CORRECT);
                }
            }
        }
    });
};
