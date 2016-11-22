var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var SayingUtil = require('../../../domain/SayingUtil');
var HomeModel = require("../../../mongodb/models/HomeModel");
var HomeWifiModel = require('../../../mongodb/models/HomeWifiModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var TerminalModel = require("../../../mongodb/models/TerminalModel");
var UserEquipmentModel = require('../../../mongodb/models/UserEquipmentModel');
var HomeGridModel = require('../../../mongodb/models/HomeGridModel');
var FloorModel = require('../../../mongodb/models/FloorModel');
var FloorModelModel = require('../../../mongodb/models/FloorModelModel');
var HomeWifiModel = require('../../../mongodb/models/HomeWifiModel');
var TerminalModel = require('../../../mongodb/models/TerminalModel');
var RDeviceModel = require('../../../mongodb/models/RDeviceModel');
var SensorDataModel = require('../../../mongodb/models/SensorDataModel');
var TSensorDataModel = require('../../../mongodb/models/TSensorDataModel');
var RinfraredModel = require('../../../mongodb/models/RinfraredModel');
var RecentLocationModel = require('../../../mongodb/RecentLocationModel');


var async = require('async');

var HomeRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

module.exports = function(app) {
    return new HomeRemote(app);
};

/**
 * 根据ID获取家庭信息
 * @param  {[type]}   homeId [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
HomeRemote.prototype.getHomeById = function(homeId, cb) {
    HomeModel.findById(homeId).exec().then(function(home) {
        cb(null, home);
    }).catch(function(err) {
        logger.error(err);
    });
};


/**
 * 查询用户名下的所有home信息
 * @param  {[type]}   userMobile [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getHomeListByMobile = function(userMobile, cb) {
    HomeModel.find({
        userMobile: userMobile
    }).exec().then(function(homes) {
        cb(homes);
    }).catch(function(err) {
        logger.error(err);
    });
};

/**
 * 根据小区ID和门牌号码获取家庭信息
 * @param  {[type]}   floorId    [description]
 * @param  {[type]}   homeNumber [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getHomeByAddress = function(floorId, homeNumber, cb) {
    HomeModel.findOne({
        floorId: floorId,
        homeNumber: homeNumber
    }).exec().then(function(home) {
        cb(home);
    }).catch(function(err) {
        logger.error(err);
    });
};


/**
 * 新建用户家庭信息
 * @param  {[type]}   floorId    [description]
 * @param  {[type]}   floorName  [description]
 * @param  {[type]}   userMobile [description]
 * @param  {[type]}   homeNumber [description]
 * @param  {[type]}   name       [description]
 * @param  {[type]}   room       [description]
 * @param  {[type]}   hall       [description]
 * @param  {[type]}   toilet     [description]
 * @param  {[type]}   kitchen    [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.insertHome = function(floorId, floorName, userMobile, homeNumber, name, room, hall, toilet, kitchen, cb) {
    var homeEntity = new HomeModel({
        floorId: floorId,
        floorName: floorName,
        userMobile: userMobile,
        homeNumber: homeNumber,
        layers: [{
            name: name,
            room: room,
            hall: hall,
            toilet: toilet,
            kitchen: kitchen
        }]
    });

    homeEntity.save(function(err, home) {
        if (err) {
            logger.error(err);
        } else {
            cb(home);
        }
    });
};

/**
 * 某家庭添加楼层
 * @param  {[type]}   homeId  [description]
 * @param  {[type]}   name    [description]
 * @param  {[type]}   room    [description]
 * @param  {[type]}   hall    [description]
 * @param  {[type]}   toilet  [description]
 * @param  {[type]}   kitchen [description]
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
HomeRemote.prototype.insertLayer = function(homeId, name, room, hall, toilet, kitchen, cb) {
    var layer = {
        name: name,
        room: room,
        hall: hall,
        toilet: toilet,
        kitchen: kitchen
    };
    HomeModel.update({
        _id: new Object(homeId)
    }, {
        $addToSet: {
            layers: layer
        }
    }, function(err, home) {
        if (err) {
            logger.error(err);
        } else {
            cb(home);
        }
    });
};

/**
 * 检查房间是否存在
 * @param  {[type]}   homeId    [description]
 * @param  {[type]}   layerName [description]
 * @param  {[type]}   gridType  [description]
 * @param  {[type]}   name      [description]
 * @param  {Function} cb        [description]
 * @return {[type]}             [description]
 */
HomeRemote.prototype.checkHomeGridExist = function(homeId, layerName, name, cb) {
    HomeGridModel.find({
        homeId: homeId,
        layerName: layerName,
        name: name
    }).exec().then(function(grids) {
        if (!!grids && grids.length > 0) {
            cb(true);
        } else {
            cb(false);
        }
    }).catch(function(err) {
        logger.error(err);
    });
};

/**
 * 新建保存房间
 * @type {[type]}
 */
HomeRemote.prototype.insertHomeGrid = function(homeId, layerName, gridType, dorder, name, cb) {
    var homeGridEntity = new HomeGridModel({
        homeId: homeId,
        layerName: layerName,
        gridType: 'room',
        dorder: i,
        name: name
    });
    homeGridEntity.save(function(err, homeGrid) {
        if (err) {
            logger.error(err);
        } else {
            cb(homeGrid);
        }
    });
};

/**
 * 根据用户户型自动创建相关的户型
 * @param  {[type]}   home [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
HomeRemote.prototype.autoRanderHomeGrid = function(home, cb) {
    var renderHomeGrid = function(homeId, layerName, gridType, dorder, name) {
        return new Promise(function(resolve, reject) {
            var homeGridEntity = new HomeGridModel({
                homeId: homeId,
                layerName: layerName,
                gridType: gridType,
                dorder: dorder,
                name: name
            });
            homeGridEntity.save(function(err, homeGrid) {
                if (err) {
                    logger.error(err);
                    reject();
                } else {
                    resolve();
                }
            });
        });
    };
    var toRandering = [];
    if (!!home) {
        for (var i = 0; i < home.layers[0].room; i++) {
            toRandering.push(renderHomeGrid(home._id, home.layers[0].name, 'room', i, '房间' + i));
        }
        for (var j = 0; j < home.layers[0].hall; j++) {
            toRandering.push(renderHomeGrid(home._id, home.layers[0].name, 'hall', j, '客厅' + j));
        }
        for (var k = 0; k < home.layers[0].toilet; k++) {
            toRandering.push(renderHomeGrid(home._id, home.layers[0].name, 'toilet', k, '卫生间' + k));
        }
        for (var l = 0; l < home.layers[0].kitchen; l++) {
            toRandering.push(renderHomeGrid(home._id, home.layers[0].name, 'kitchen', l, '厨房' + l));
        }
    }
    Promise.all(toRandering).then(function() {
        cb();
    });
};

/**
 * 获取房间列表
 * @param  {[type]}   homeId            [description]
 * @param  {[type]}   layerName         [description]
 * @param  {[type]}   centerBoxSerialno [description]
 * @param  {Function} cb                [description]
 * @return {[type]}                     [description]
 */
HomeRemote.prototype.getHomeGridList = function(homeId, layerName, cb) {
    HomeGridModel.find({
        homeId: homeId,
        layerName: layerName
    }).populate('terminal').sort({
        dorder: 1
    }).exec(function(err, grids) {
        if (err) {
            logger.error(err);
        } else {
            cb(grids);
        }
    });
};

/**
 * 修改房间信息
 * @param  {[type]}   gridId   [description]
 * @param  {[type]}   gridType [description]
 * @param  {[type]}   name     [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.updateGrid = function(gridId, gridType, name, cb) {
    HomeGridModel.update({
        _id: new Object(gridId)
    }, {
        $set: {
            gridType: gridType,
            name: name
        }
    }, function(err) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null);
        }
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
        return new Promise(function(resolve, reject) {
            HomeWifiModel.find({
                homeId: box.homeId,
                layerName: box.layerName
            }, function(err, homeWifis) {
                if (err) {
                    logger.error(err);
                    reject(err);
                } else {
                    box.homeWifi = homeWifis;
                    if (!!box.serialno) {
                        CenterBoxModel.findOne({
                            serialno: new Object(box.serialno)
                        }, function(err, centerBox) {
                            if (err) {
                                logger.error(err);
                                reject(err);
                            } else {
                                box.centerBox = centerBox;
                                resolve(box);
                            }
                        });
                    } else {
                        resolve(box);
                    }
                }
            });
        });
    };

    HomeModel.find({
        userMobile: userMobile
    }).exec().then(function(homes) {
        var toRandering = [];
        if (!!homes) {
            for (var i = 0; i < homes.length; i++) {
                if (!!homes[i].layers) {
                    for (var j = 0; j < homes[i].layers.length; j++) {
                        var box = {
                            homeId: homes[i]._id,
                            layerName: homes[i].layers[j].name,
                            serialno: homes[i].layers[j].centerBoxSerialno
                        };
                        toRandering.push(renderHomeLayerInfo(box));
                    }
                }
            }
        }

        Promise.all(toRandering).then(function(homes) {
            cb(null, homes);
        });
    }).catch(function(err) {
        logger.error(err);
        cb(err);
    });
};

/**
 * 根据用户的手机号码，获取相关的主控信息
 * @param  {[type]}   userMobile [description]
 * @param  {[type]}   withFamily [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.BoxList = function(userMobile, withFamily, cb) {
    CenterBoxModel.find({
        userMobile: userMobile
    }, function(err, centerBoxs) {
        if (err) {
            logger.error(err);
        } else {
            cb(centerBoxs);
        }
    });
};

/**
 * 查询一个主控的所有终端
 * @param  {[type]}   serialno [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getTerminaListByCenterBox = function(serialno, cb) {
    TerminalModel.find({
        centerBoxSerialno: serialno
    }, function(err, terminals) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null, terminals);
        }
    });
};

/**
 * 查询一个主控的code为特定值的终端
 * @param  {[type]}   serialno [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getTerminaListByCenterBoxAndCode = function(serialno, code, cb) {
    TerminalModel.find({
        centerBoxSerialno: serialno,
        code: code
    }, function(err, terminals) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null, terminals);
        }
    });
};

/**
 * 根据用户手机号码或者家庭信息获取用户设备列表
 * @param  {[type]}   homeId     [description]
 * @param  {[type]}   layerName  [description]
 * @param  {[type]}   userMobile [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getDeviceList = function(homeId, layerName, userMobile, cb) {
    if (!!homeId && !!layerName) {
        UserEquipmentModel.find({
            home_id: homeId,
            layerName: layerName
        }).populate('homeGridId').exec(function(err, docs) {
            if (err) {
                logger.error(err);
            } else {
                cb(docs);
            }
        });
    } else {
        HomeModel.find({
            userMobile: userMobile
        }, function(err, homes) {
            var homeIds = [];
            for (var i = 0; i < homes.length; i++) {
                homeIds.push(homes[i]._id);
            }
            UserEquipmentModel.find({
                home_id: {
                    $in: homeIds
                }
            }).populate('homeGridId').exec(function(err, docs) {
                if (err) {
                    logger.error(err);
                } else {
                    cb(docs);
                }
            });
        });
    }
};

/**
 * 根据房间查找设备
 * @param  {[type]}   homeGridId [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getDeviceListByGridId = function(homeGridId, cb) {
    UserEquipmentModel.find({
        homeGridId: homeGridId
    }).populate('homeGridId').exec(function(err, docs) {
        if (err) {
            logger.error(err);
        } else {
            cb(docs);
        }
    });
};

/**
 * 根据区域获得小区列表
 * @param  {[type]}   area     [description]
 * @param  {[type]}   page     [description]
 * @param  {[type]}   pageSize [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getFloorList = function(area, page, pageSize, cb) {
    if (!page) {
        page = 1;
    }
    if (!pageSize) {
        pageSize = 10;
    } else {
        pageSize = parseInt(pageSize);
    }
    var skip = pageSize * (page - 1);
    FloorModel.find({
        area: area
    }).skip(skip).limit(pageSize).exec().then(function(floors) {
        cb(null, floors);
    }).catch(function(err) {
        logger.error(err);
        cb(Code.DATABASE);
    });
};

/**
 * 根据floorId获取小区详情
 * @param  {[type]}   floorId [description]
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
HomeRemote.prototype.getFloorByFloorId = function(floorId, cb) {
    FloorModel.findById(floorId, function(err, floor) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null, floor);
        }
    });
};

/**
 * 获取某个小区的所有户型列表
 * @param  {[type]}   floorUrl [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getFloorModelList = function(floorUrl, page, pageSize, cb) {
    if (!page) {
        page = 1;
    }
    if (!pageSize) {
        pageSize = 10;
    } else {
        pageSize = parseInt(pageSize);
    }
    var skip = pageSize * (page - 1);
    FloorModelModel.find({}).skip(skip).limit(pageSize).exec().then(function(floorModels) {
        cb(null, floorModels);
    }).catch(function(err) {
        cb(Code.DATABASE);
    });
};

/**
 * 设置用胡
 */
HomeRemote.prototype.setHomeWifi = function(userMobile, ssid, passwd, homeId, layerName, cb) {
    var wifi = {
        ssid: ssid,
        passwd: passwd,
        userMobile: userMobile,
        homeId: homeId,
        layerName: layerName,
        checked: false
    };
    HomeWifiModel.update({
        homeId: homeId,
        layerName: layerName
    }, wifi, {
        upsert: true
    }, function(err, wifi) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null, wifi);
        }
    });
};

HomeRemote.prototype.checkHomeWifi = function(homeId, layerName, cb) {
    HomeWifiModel.update({
        homeId: homeId,
        layerName: layerName
    }, {
        $set: {
            checked: true
        }
    }, function(err) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null);
        }
    });
};

/**
 * 更新家庭楼层的主控绑定信息
 * @param  {[type]} homeId            [description]
 * @param  {[type]} layerName         [description]
 * @param  {[type]} centerBoxSerailno [description]
 * @param  {[type]} function          [description]
 * @return {[type]}                   [description]
 */
HomeRemote.prototype.bindCenterBoxToLayer = function(homeId, layerName, centerBoxSerialno, cb) {
    HomeModel.update({
        _id: homeId,
        "layers.name": layerName
    }, {
        $set: {
            "layers.$.centerBoxSerialno": centerBoxSerialno
        }
    }, function(err, docs) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            console.log("homeID:" + homeId);
            console.log("layerName:" + layerName);
            CenterBoxModel.update({
                serialno: centerBoxSerialno
            }, {
                $set: {
                    homeId: homeId,
                    layerName: layerName
                }
            }, function(err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        }
    });
};

/**
 * 添加新的主控
 * @param {[type]}   userMobile [description]
 * @param {[type]}   ssid       [description]
 * @param {[type]}   passwd     [description]
 * @param {[type]}   serialno   [description]
 * @param {Function} cb         [description]
 */
HomeRemote.prototype.addCenterBox = function(userMobile, ssid, passwd, serialno, cb) {
    var CenterBoxEntity = new CenterBoxModel({
        userMobile: userMobile,
        ssid: ssid,
        passwd: passwd,
        serialno: serialno
    });
    CenterBoxEntity.save(function(err) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null);
        }
    });
};

/**
 * 查询指定的serialno是否存在
 * @param  {[type]}   serailno [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.centerBoxSerailnoExist = function(serialno, cb) {
    CenterBoxModel.count({
        serialno: serialno
    }, function(err, count) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            if (count > 0) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
};

/**
 * 根据serialno获取主控信息
 * @param  {[type]}   serialno [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getCenterBoxBySerailno = function(serialno, cb) {
    CenterBoxModel.findOne({
        serialno: serialno
    }).exec().then(function(centerBox) {
        cb(null, centerBox);
    }).catch(function(err) {
        logger.error(err);
        cb(err);
    });
};

/**
 * 根据serialno获取主控信息
 * @param  {[type]}   serialno [description]
 * @param  {Function} cb       [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getCenterBoxByUserMobile = function(userMobile, cb) {
    CenterBoxModel.find({
        userMobile: userMobile
    }).exec().then(function(centerBoxs) {
        cb(null, centerBoxs);
    }).catch(function(err) {
        logger.error(err);
        cb(err);
    });
};


/**
 * 添加终端
 * @param {[type]}   userMobile [description]
 * @param {[type]}   ssid       [description]
 * @param {[type]}   passwd     [description]
 * @param {[type]}   serialno   [description]
 * @param {Function} cb         [description]
 */
HomeRemote.prototype.addTerminal = function(userMobile, ssid, passwd, serialno, cb) {
    var terminalEntity = new TerminalModel({
        centerBoxSerialno: serialno,
        ssid: ssid,
        passwd: passwd
    });
    terminalEntity.save(function(err, terminal) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            cb(null, terminal);
        }
    });
};

/**
 * 将终端绑定到房间
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
HomeRemote.prototype.bindTerminalToHomeGrid = function(homeGridId, terminalId, cb) {
    HomeGridModel.update({
        _id: new Object(homeGridId)
    }, {
        $set: {
            "terminalId": terminalId,
            "terminal": new Object(terminalId)
        }
    }, function(err, docs) {
        if (err) {
            logger.error(err);
            cb(err);
        } else {
            TerminalModel.update({
                _id: new Object(terminalId)
            }, {
                $set: {
                    "homeGridId": homeGridId
                }
            }, function(err, docs) {
                if (err) {
                    logger.error(err);
                    cb(err);
                } else {
                    cb();
                }
            });
        }
    });
};

/**
 * 根据设备类型获取品牌列表
 * @param  {[type]}   type     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
HomeRemote.prototype.getDeviceBrands = function(type, callback) {
    RDeviceModel.distinct("brand", {
        devType: type
    }, function(err, brands) {
        if (err) {
            logger.error(err);
            callback(err);
        } else {
            callback(null, brands);
        }
    });
};

HomeRemote.prototype.getDeviceModels = function(brand, type, callback) {
    RDeviceModel.find({
        brand: brand,
        devType: type
    }, function(err, deviceModels) {
        if (err) {
            logger.error(err);
            callback(err);
        } else {
            callback(null, deviceModels);
        }
    });
};

/**
 * 获取红外码
 */
HomeRemote.prototype.getTestIrCode = function(tid, inst, callback) {
    RinfraredModel.findOne({
        typeID: tid,
        inst: inst
    }, function(err, ircode) {
        if (err) {
            callback(err);
        } else {
            callback(null, ircode);
        }
    });
};

/**
 * 根据ID获取设备
 */
HomeRemote.prototype.getDeviceById = function(id, callback) {
    UserEquipmentModel.findById(id, function(err, device) {
        if (err) {
            callback(err);
        } else {
            callback(null, device);
        }
    });
};

/**
 * 根据Id获取终端
 */
HomeRemote.prototype.getTerminalById = function(id, callback) {
    TerminalModel.findById(id, function(err, terminal) {
        if (err) {
            callback(err);
        } else {
            callback(null, terminal);
        }
    });
};

/**
 * 保存终端传感器数据
 * @param  {[type]}   terminalId  [description]
 * @param  {[type]}   temperature [description]
 * @param  {[type]}   humidity    [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
HomeRemote.prototype.saveTSensorData = function(terminalId, temperature, humidity, callback) {
    var tSensorEntity = new TSensorDataModel({
        terminalId: terminalId,
        temperature: temperature,
        humidity: humidity
    });
    tSensorEntity.save(function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

/**
 * 保存主控传感器数据
 * @param  {[type]}   centerBoxId [description]
 * @param  {[type]}   temperature [description]
 * @param  {[type]}   humidity    [description]
 * @param  {[type]}   co          [description]
 * @param  {[type]}   quality     [description]
 * @param  {[type]}   pm25        [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
HomeRemote.prototype.saveSensorData = function(centerBoxId, temperature, humidity, co, quality, pm25, callback) {
    var entity = new SensorDataModel({
        centerBoxId: centerBoxId,
        temperature: temperature,
        humidity: humidity,
        co: co,
        quality: quality,
        pm25: pm25
    });
    entity.save(function(err, docs) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};


HomeRemote.prototype.getLastSensorData = function(centerBoxId, callback) {
    SensorDataModel.find({centerBoxId:new Object(centerBoxId)}).sort({addTime:-1}).limit(1).exec().then(function(data) {
        callback(null, data);
    }).catch(function(err) {
        callbacck(err);
    });
};

/**
 * 获取没有绑定的主控
 * @param  {[type]}   userMobile [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
HomeRemote.prototype.getNotBindedCenterBoxs = function(userMobile, callback) {
    CenterBoxModel.find({
        userMobile: userMobile
    }, function(err, list) {
        if (err) {
            callback(err);
        } else {
            var centerBoxSerialnos = [];
            for (var i = 0; i < list.length; i++) {
                centerBoxSerialnos.push(list[i].serialno);
            }
            HomeModel.find({
                "layers.centerBoxSerialno": {
                    $in: centerBoxSerialnos
                }
            }, function(err, homes) {
                if (err) {
                    console.log(err);
                } else {
                    var result = [];
                    var flag = false;
                    for (var x = 0; x < list.length; x++) {
                        for (var y = 0; y < homes.length; y++) {
                            if (!!homes[y].layers) {
                                for (var z = 0; z < homes[y].layers.length; z++) {
                                    if (list[x].serialno === homes[y].layers[z].centerBoxSerialno) {
                                        flag = true;
                                    }
                                }
                            }
                        }

                        if (!flag) {
                            result.push(list[x]);
                        }
                    }
                    callback(null, result);
                }
            });
        }
    });
};

HomeRemote.prototype.getAllTerminals = function(userMobile, callback) {
    CenterBoxModel.find({
        userMobile: userMobile
    }, function(err, cbs) {
        if (err) {
            callback(err);
        } else {
            var serialnos = [];
            for (var i = 0; i < cbs.length; i++) {
                serialnos.push(cbs[i].serialno);
            }
            TerminalModel.find({
                centerBoxSerialno: {
                    $in: serialnos
                }
            }, function(err, terminals) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, terminals);
                }
            });
        }
    });
};

/********** 这里代表用户进行了回答，那么可以确定用户最近都在使用这个位置的电器，所以后续时间段内仍然默认使用该位置 *********/
/********** 时间暂定10分钟 *********/
HomeRemote.prototype.saveUserRecentLocation = function(userMobile, answer, cb) {
    HomeModel.find({userMobile:userMobile}, function(err, homes) {
        if(err || !homes || homes.length === 0) {
            cb(err);
        } else {
            var layers = homes[0].layers;
            HomeGridModel.find({homeId:homes[0]._id}, function(err, grids) {
                if(err || !grids || grids.length === 0) {
                    cb(err);
                } else {
                    var layerNames = [];
                    for(var l=0;l<layers.length;l++) {
                        layerNames.push(layers[l].name);
                    }

                    var structure = {};
                    for(var i=0;i<layerNames.length;i++) {
                        structure[layerNames[i]] = [];
                        for(var j=0;j<grids.length;j++) {
                            if(grids[j].layerName === layerNames[i]) {
                                structure[layerNames[i]].push(grids[j].name);
                            }
                        }
                    }
                    var location = "";
                    for(var x in structure) {
                        for(var y in structure[x]) {
                            if(answer === structure[x][y]) {
                                location = x + "" + structure[x][y];
                                break;
                            }
                        }
                    }
                    var recent = new RecentLocationModel({
                        userMobile:userMobile,
                        location:location
                    });
                    recent.save(function(err, docs) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null, docs);
                        }
                    });
                }
            });
        }
    });
};


HomeRemote.prototype.checkRecentLocation = function(uid, words, structure, cb) {
    if(!!structure && structure !== undefined && structure.length > 0) {
        cb(null, structure);
    } else {
        RecentLocationModel.findOne({userMobile:uid}).sort({addTime:-1}).exec().then(function(recent) {
            if(!!recent) {
                if(new Date().getTime() - recent.addTime <= 3 * 60 * 1000) {
                    cb(null, recent.location);
                } else {
                    cb(null, null);
                }
            } else {
                cb(null, null);
            }
        }).catch(function(err) {
            cb(err);
        });
    }
};
