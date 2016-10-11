var logger = require('pomelo-logger').getLogger('pomelo',  __filename);
var HomeModel = require("../../../mongodb/models/HomeModel");
var HomeWifiModel = require('../../../mongodb/models/HomeWifiModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var async = require('async');

var HomeRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

module.exports = function(app) {
    return new HomeRemote(app);
};

/**
 * 查询用户名下的所有home信息
 * @param  {[type]}   userMobile [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getHomeListByMobile = function(userMobile, cb) {
    HomeModel.find({userMobile:userMobile}).exec().then(function(homes) {
        cb(homes);
    }).catch(function(err) {
        logger.error(err);
    });
};


/**
 * 根据手机号码，查询所有相关的家庭信息
 * @param  {[type]}   userMobile [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getHomeInfoByMobile = function(userMobile, cb) {
    var renderHomeLayerInfo = function(box) {
        return new Promise(function (resolve, reject) {
            HomeWifiModel.find({homeId:box.homeId, layerName:box.layerName}, function(err, homeWifis) {
                if(err) {reject(err);}
                box.homeWifi = homeWifis;
                CenterBoxModel.findOne({serialno:new Object(box.serialno)}, function(err, centerBox) {
                    if(err) {reject(err);}
                    box.centerBox = centerBox;
                    resolve(box);
                });
            });
        });
    };

    HomeModel.find({userMobile:userMobile}).exec().then(function(homes) {
        var toRandering = [];
        if(!!homes) {
            for(var i=0; i<homes.length; i++) {
                if(!!homes[i].layers) {
                    for(var j=0;j<homes[i].layers.length;j++) {
                        var box = {
                            homeId:homes[i]._id,
                            layerName:homes[i].layers[j].name,
                            serialno:homes[i].layers[j].centerBoxSerialno
                        };
                        toRandering.push(renderHomeLayerInfo(box));
                    }
                }
            }
        }

        Promise.all(toRandering).then(function(infos) {
            cb(homes);
        });
    }).catch(function(err) {
        logger.error(err);
    });
};

/**
 * 根据用户的手机号码，获取相关的主控信息
 * @param  {[type]}   userMobile [description]
 * @param  {[type]}   withFamily [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getCenterBoxList = function(userMobile, withFamily, cb) {
    CenterBoxModel.find({userMobile:userMobile}, function(err, centerBoxs) {
        if(err) {
            logger.error("DBErrro" + err);
        } else {
            cb(centerBoxs);
        }
    });
};

HomeRemote.prototype.getTerminaListByCenterBox = function(serialno, cb) {
    TerminalModel.find({})
}
