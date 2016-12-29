var StringUtil = require('../../../util/StringUtil.js');
var RegexUtil = require('../../../util/RegexUtil.js');
var UserModel = require('../../../mongodb/models/UserModel');
var Code = require('../../../domain/code');
var HomeModel = require('../../../mongodb/models/HomeModel');
var HomeGridModel = require('../../../mongodb/models/HomeGridModel');
var FloorModel = require('../../../mongodb/models/FloorModel');
var FloorModelModel = require('../../../mongodb/models/FloorModelModel');
var DeviceModel = require('../../../mongodb/models/DeviceModel');
var UserEquipmentModel = require('../../../mongodb/models/UserEquipmentModel');
var HomeWifiModel = require('../../../mongodb/models/HomeWifiModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var TerminalModel = require('../../../mongodb/models/TerminalModel');
var async = require("async");
var http = require('http');
var DeviceStatusUtil = require('../../../util/DeviceStatusUtil');
var SensorDataModel = require('../../../mongodb/models/SensorDataModel');
var request = require('request');
var RDeviceModel = require('../../../mongodb/models/RDeviceModel');
var SayingUtil = require('../../../domain/SayingUtil');
var NoticeModel = require('../../../mongodb/models/NoticeModel');
var Moment = require('moment');
var WeatherModel = require('../../../mongodb/grabmodel/WeatherModel');
var TSensorDataModel = require('../../../mongodb/models/TSensorDataModel');
var AccountModel = require('../../../mongodb/estateModels/AccountModel');
var ComplaintModel = require('../../../mongodb/estateModels/ComplaintModel');
var CourierModel = require('../../../mongodb/estateModels/CourierModel');
var HouseKeepingModel = require('../../../mongodb/estateModels/HousekeepingModel');
var PayModel = require('../../../mongodb/estateModels/PayModel');
var RepairModel = require('../../../mongodb/estateModels/RepairModel');
var WordsPreparer = require('../../../domain/WordsPreparer');
var WasterWordFilter = require('../../../domain/WasterWordFilter');
var CameraPhotoModel = require("../../../mongodb/camera/CameraPhotoModel");

var ResponseUtil = require('../../../util/ResponseUtil');
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

var TvChannel = require('../../../mongodb/tv/TvChannelModel');
var StructureFilter = require("../../../domain/StructureFilter");


module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

/********************************************** 常规信息 begin ***************************************************/
/**
 * 获取主控列表, 根据session中的userMobile,获取相关的主控列表
 */
Handler.prototype.getCenterBoxList = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    self.app.rpc.user.userRemote.getCenterBoxList(session, userMobile, false, function(centerBoxs) {
        next(null, ResponseUtil.resp(Code.OK, centerBoxs));
    });
};

/**
 * 获取用户信息 包含用户的家庭信息，家庭路由器信息，和相关的主控信息
 * TODO 如果是子账户，显示主账户所有相关信息
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getUserInfo = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;

    async.waterfall([
        /* 获取用户基本数据 */
        function(cb) {
            self.app.rpc.user.userRemote.getUserInfoByMobile(session, userMobile, function(err, user) {
                if (err) {
                    next(null, next(null, ResponseUtil.resp(Code.DATABASE)));
                } else {
                    if (!!user) {
                        cb(null, user);
                    } else {
                        next(null, next(null, ResponseUtil.resp(Code.ACCOUNT.USER_NOT_EXIST)));
                    }
                }
            });
        },
        /* 关联用户的家庭信息 */
        function(user, cb) {
            self.app.rpc.home.homeRemote.getHomeInfoByMobile(session, userMobile, function(err, homes) {
                console.log("--------------------------------------------------------------------------");
                console.log(JSON.stringify(homes));
                if (err) {
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    user.homeInfo = homes;
                    cb(null, user);
                }
            });
        },
        /* 获取用户主控信息 */
        function(user, cb) {
            self.app.rpc.home.homeRemote.getCenterBoxByUserMobile(session, userMobile, function(err, centerBoxs) {
                if (err) {
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    user.centerBox = centerBoxs;
                    next(null, ResponseUtil.resp(Code.OK, user));
                }
            });
        }
    ]);
};

/**
 * 获取用户家庭的标题
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getUserHomeTitle = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    async.waterfall([
        function(cb) {
            self.app.rpc.home.homeRemote.getHomeListByMobile(session, userMobile, function(homes) {
                cb(null, homes);
            });
        },
        function(homes, cb) {
            var homeArray = [];
            for (var i = 0; i < homes.length; i++) {
                var home = homes[i];
                var newArray = getHomeTitle(home);
                for (var z = 0; z < newArray.length; z++) {
                    homeArray.push(newArray[z]);
                }
            }
            next(null, ResponseUtil.resp(Code.OK, homeArray));
        }
    ]);
};

var getHomeTitle = function(home) {
    var homeArray = [];
    if (!!home.layers) {
        if (home.layers.length <= 1) {
            var h = {};
            h.homeId = home._id;
            h.originTitle = home.name;
            if (h.originTitle === undefined) {
                h.originTitle = home.floorName;
            }
            h.title = h.originTitle;
            h.layerName = home.layers[0].name;
            homeArray.push(h);
        } else {
            for (var y = 0; y < home.layers.length; y++) {
                var h_new = {};
                h_new.homeId = home._id;
                h_new.originTitle = home.name;
                if (h_new.originTitle === undefined) {
                    h_new.originTitle = home.floorName;
                }
                h_new.title = renderLayersTitle(h_new.originTitle, home.layers[y]);
                h_new.layerName = home.layers[y].name;
                homeArray.push(h_new);
            }
        }
    }
    return homeArray;
};

var renderLayersTitle = function(title, layer) {
    title += " " + layer.name;
    return title;
};

/**
 * 根据用户手机号码获取终端列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.queryTerminal = function(msg, session, next) {
    var self = this;
    var centerBoxSerialno = msg.centerBoxSerialno;
    var code = msg.code;
    if (!!code) {
        self.app.rpc.home.homeRemote.getTerminaListByCenterBoxAndCode(session, centerBoxSerialno, code, function(terminals) {
            next(null, ResponseUtil.resp(Code.OK, terminals));
        });
    } else {
        self.app.rpc.home.homeRemote.getTerminaListByCenterBox(session, centerBoxSerialno, function(terminals) {
            next(null, ResponseUtil.resp(Code.OK, terminals));
        });
    }
};

/**
 * 获取某楼层下的所有设备列表
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getDeviceList = function(msg, session, next) {
    var self = this;
    var homeId = msg.homeId;
    var layerName = msg.layerName;
    var userMobile = session.uid;
    self.app.rpc.home.homeRemote.getDeviceList(session, homeId, layerName, userMobile, function(devices) {
        next(null, ResponseUtil.resp(Code.OK, devices));
    });
};

/**
 * 根据某房间获取设备列表
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getDeviceListByGridId = function(msg, session, next) {
    var self = this;
    var homeGridId = msg.homeGridId;
    self.app.rpc.home.homeRemote.queryDevices(session, homeGridId, function(devices) {
        next(null, ResponseUtil.resp(Code.OK, devices));
    });
};

/**
 * 获取用户的家庭信息
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getHomeInfo = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    self.app.rpc.home.homeRemote.getHomeListByMobile(session, userMobile, function(homes) {
        next(null, ResponseUtil.resp(Code.OK, homes));
    });
};

/**
 * 根据家庭楼层，获取房间
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getHomeGridList = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var homeId = msg.homeId;
    var layerName = msg.layerName;
    self.app.rpc.home.homeRemote.getHomeGridList(session, homeId, layerName, function(grids) {
        next(null, ResponseUtil.resp(Code.OK, grids));
    });
};

/**
 * 获取房间详情
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getGridDetail = function(msg, session, next) {
    var self = this;
    var gridId = msg.gridId;
    console.log("gridId:" + gridId);
    HomeGridModel.findOne({
        _id: gridId
    }, function(err, grid) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, grid));
        }
    });
};

/********************************************** 常规信息 end ***************************************************/


/********************************************** 初始化 begin ***************************************************/

/**
 * 获取区域列表，城市定死为嘉兴
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getAreaList = function(msg, session, next) {
    var areaList = [
        "中心城区", "南湖新区", "秀洲新区", "城西区", "城北区", "西南区", "国际商务区", "城南区", "湘家荡度假区", "五县"
    ];
    next(null, ResponseUtil.resp(Code.OK, areaList));
};


/**
 * 根据区域获取小区列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getFloorList = function(msg, session, next) {
    var self = this;
    var area = msg.area;
    var page = msg.page;
    var pageSize = msg.pageSize;

    self.app.rpc.home.homeRemote.getFloorList(session, area, page, pageSize, function(err, floors) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, floors));
        }
    });
};

/**
 * 根据小区获取户型列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getFloorModelList = function(msg, session, next) {
    var self = this;
    var floorUrl = msg.floorUrl;
    var page = msg.page;
    var pageSize = msg.pageSize;

    self.app.rpc.home.homeRemote.getFloorModelList(session, floorUrl, page, pageSize, function(err, floorModels) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, floorModels));
        }
    });
};

/**
 * 初次设定用户的家庭
 * @param {[type]}   msg     [description]
 * @param {[type]}   session [description]
 * @param {Function} next    [description]
 */
Handler.prototype.addHome = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var room = msg.room;
    var hall = msg.hall;
    var toilet = msg.toilet;
    var kitchen = msg.kitchen;
    var name = msg.layerName;
    var floorId = msg.floorId;
    var homeNumber = msg.homeNumber;
    if (!name) {
        name = "一楼";
    }
    async.waterfall([
        function(callback) {
            self.app.rpc.home.homeRemote.getFloorByFloorId(session, floorId, function(err, floor) {
                if (err) {
                    next(null, ReponseUtil.resp(Code.DATABASE));
                } else {
                    callback(null, floor.name);
                }
            });
        },
        function(floorName, callback) {
            if (!homeNumber || homeNumber === "") {
                homeNumber = floorName;
            }
            self.app.rpc.home.homeRemote.getHomeByAddress(session, floorId, homeNumber, function(home) {
                if (!!home) {
                    next(null, ResponseUtil.resp(Code.STRUCTURE.HOME_EXIST));
                } else {
                    callback(null, floorId, floorName, userMobile, homeNumber, name, room, hall, toilet, kitchen);
                }
            });
        },
        function(floorId, floorName, userMobile, homeNumber, name, room, hall, toilet, kitchen, callback) {
            self.app.rpc.home.homeRemote.insertHome(session, floorId, floorName, userMobile, homeNumber, name, room, hall, toilet, kitchen, function(home) {
                callback(null, home);
            });
        },
        function(home) {
            self.app.rpc.home.homeRemote.autoRanderHomeGrid(session, home, function() {
                next(null, ResponseUtil.resp(Code.OK));
            });
        }
    ]);
};

/**
 * 添加楼层
 * @param {[type]}   msg     [description]
 * @param {[type]}   session [description]
 * @param {Function} next    [description]
 */
Handler.prototype.addLayer = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var room = msg.room;
    var hall = msg.hall;
    var toilet = msg.toilet;
    var kitchen = msg.kitchen;
    var name = msg.layerName;
    var homeId = msg.homeId;

    async.waterfall([
        function(callback) {
            self.app.rpc.home.homeRemote.getHomeById(session, homeId, function(err, home) {
                if (!!home) {
                    callback(null, home);
                } else {
                    next(null, ResponseUtil.resp(Code.STRUCTURE.HOME_NOT_EXIST));
                }
            });
        },
        function(home, callback) {

            if (!name) {
                var layerCount = home.layers.length;
                layerCount = layerCount + 1;
                if (layerCount == 1) {
                    name = '一楼';
                } else if (layerCount == 2) {
                    name = '二楼';
                } else if (layerCount == 3) {
                    name = '三楼';
                } else if (layerCount == 4) {
                    name = '四楼';
                } else if (layerCount == 5) {
                    name = '五楼';
                } else if (layerCount == 6) {
                    name = '六楼';
                } else if (layerCount == 7) {
                    name = '七楼';
                } else if (layerCount == 8) {
                    name = '八楼';
                } else if (layerCount == 9) {
                    name = '九楼';
                }
            }

            var layerExist = false;
            if (!!home && !!home.layers) {
                for (var i = 0; i < home.layers.length; i++) {
                    if (home.layers[i].name === name) {
                        layerExist = true;
                    }
                }
            }

            if (!layerExist) {
                self.app.rpc.home.homeRemote.insertLayer(session, homeId, name, room, hall, toilet, kitchen, function(home) {
                    console.log('homeId::' + homeId);
                    console.log('name::' + name);
                    self.app.rpc.home.homeRemote.getHomeById(session, homeId, function(err, home) {
                        console.log('home:::' + JSON.stringify(home));
                        if (!!home) {
                            var targetLayer = [];
                            if (home.layers) {
                                for (var i = 0; i < home.layers.length; i++) {
                                    if (home.layers[i].name === name) {
                                        targetLayer.push(home.layers[i]);
                                    }
                                }
                            }
                            home.layers = targetLayer;
                            console.log('home:::' + JSON.stringify(home));
                            self.app.rpc.home.homeRemote.autoRanderHomeGrid(session, home, function() {
                                next(null, ResponseUtil.resp(Code.OK));
                            });
                        } else {
                            next(null, ResponseUtil.resp(Code.DATABASE));
                        }
                    });
                });
            } else {
                next(null, ResponseUtil.resp(Code.STRUCTURE.HOME_EXIST));
            }
        }
    ]);
};

/**
 * 修改房间信息
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.updateGrid = function(msg, session, next) {
    var self = this;
    var gridId = msg.gridId;
    var name = msg.name;
    var gridType = msg.gridType;
    self.app.rpc.home.homeRemote.updateGrid(session, gridId, gridType, name, function(err) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK));
        }
    });
};

/**
 * 绑定用户家庭的路由器信息
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.setHomeWifi = function(msg, session, next) {
    var self = this;

    var homeId = msg.homeId;
    var layerName = msg.layerName;
    var ssid = msg.ssid;
    var passwd = msg.passwd;
    var userMobile = session.uid;

    self.app.rpc.home.homeRemote.setHomeWifi(session, userMobile, ssid, passwd, homeId, layerName, function(err, wifi) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            console.log(wifi);
            next(null, ResponseUtil.resp(Code.OK, wifi));
        }
    });
};

/**
 * 设定honeWfi为已侧是通过
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.checkHomeWifi = function(msg, session, next) {
    var self = this;
    var homeId = msg.homeId;
    var layerName = msg.layerName;

    self.app.rpc.home.homeRemote.checkHomeWifi(sessio, homeId, layerName, function(err) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK));
        }
    });
};


/**
 * 用户添加主控
 * @param {[type]}   msg     [description]
 * @param {[type]}   session [description]
 * @param {Function} next    [description]
 */
Handler.prototype.addCenterBox = function(msg, session, next) {
    var self = this;

    var userMobile = session.uid;
    var ssid = msg.ssid;
    var passwd = msg.passwd;
    var serialno = msg.serialno;

    var homeId = msg.homeId;
    var layerName = msg.layerName;

    async.waterfall([
        function(callback) {
            self.app.rpc.home.homeRemote.centerBoxSerailnoExist(session, serialno, function(err, flag) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, flag, serialno);
                }
            });
        },
        function(flag, serialno, callback) {
            // 已经存在了
            if (flag) {
                self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                    if (!!centerBox.homeId && centerBox.homeId === homeId && !!centerBox.layerName && centerBox.layerName === layerName) {
                        next(null, ResponseUtil.resp(Code.STRUCTURE.CENTERBOX_OCCUPIED));
                    } else {
                        next(null, ResponseUtil.resp(Code.OK));
                    }
                });
                // 不存在
            } else {
                self.app.rpc.home.homeRemote.addCenterBox(session, userMobile, ssid, passwd, serialno, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        // 如果上传了homeId和layerName，则绑定到具体房间, 否则的话等后期再绑定
                        // 具体看0x1000主控上线推送
                        if (!!homeId && !!layerName) {
                            callback(null, serialno, homeId, layerName);
                        } else {
                            next(null, ResponseUtil.resp(Code.OK));
                        }
                    }
                });
            }
        },
        function(serialno, homeId, layerName, callback) {
            if (!!homeId && !!layerName) {
                self.app.rpc.home.homeRemote.bindCenterBoxToLayer(session, homeId, layerName, serialno, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        next(null, ResponseUtil.resp(Code.OK));
                    }
                });
            } else {
                next(null, ResponseUtil.resp(Code.OK));
            }
        }
    ], function(err, result) {
        next(null, ResponseUtil.resp(Code.DATABASE));
    });
};

/**
 * 将主控绑定都某一家庭的某一层
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.bindCenterBoxToLayer = function(msg, session, next) {
    var self = this;

    var homeId = msg.homeId;
    var serialno = msg.serialno;
    var layerName = msg.layerName;

    async.waterfall([
        function(callback) {
            self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                if (!!centerBox && !!centerBox.homeId && !!centerBox.layerName) {
                    next(null, ResponseUtil.resp(Code.STRUCTURE.CENTERBOX_OCCUPIED));
                } else {
                    callback(null, serialno, homeId, layerName);
                }
            });
        },
        function(serialno, homeId, layerName) {
            self.app.rpc.home.homeRemote.bindCenterBoxToLayer(session, homeId, layerName, serialno, function(err) {
                if (err) {
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    next(null, ResponseUtil.resp(Code.OK));
                }
            });
        }
    ], function(err, result) {
        next(null, ResponseUtil.resp(Code.DATABASE));
    });
};

/**
 * 获取没有绑定楼层的主控
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getNotBindedCenterBoxs = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    self.app.rpc.home.homeRemote.getNotBindedCenterBoxs(session, userMobile, function(err, centerBoxs) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, centerBoxs));
        }
    });
};

/**
 * 获取没有绑定楼层的终端
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getTerminals = function(msg, session, next) {
    var self = this;
    var centerBoxSerialno = msg.centerBoxSerialno;
    var userMobile = session.uid;
    self.app.rpc.home.homeRemote.getNotBindedTerminals(session, centerBoxSerialno, userMobile, function(err, centerBoxs) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, centerBoxs));
        }
    });
};

Handler.prototype.getAllTerminals = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    self.app.rpc.home.homeRemote.getAllTerminals(session, userMobile, function(err, centerBoxs) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, centerBoxs));
        }
    });
};

/**
 * 添加终端
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
// Handler.prototype.addTerminal = function(msg, session, next) {
//     var self = this;
//     var userMobile = session.uid;
//     var ssid = msg.ssid;
//     var passwd = msg.passwd;
//     var centerBoxSerialno = msg.centerBoxSerialno;
//     var homeGridId = msg.homeGridId;

//     async.waterfall([
//         function(callback) {
//             self.app.rpc.home.homeRemote.centerBoxSerailnoExist(session, centerBoxSerialno, function(err, flag) {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     callback(null, flag);
//                 }
//             });
//         },
//         function(flag, callback) {
//             // 主控存在
//             if (flag) {
//                 self.app.rpc.home.homeRemote.addTerminal(session, userMobile, ssid, passwd, centerBoxSerialno, function(err, terminal) {
//                     if (err) {
//                         callback(err);
//                     } else {
//                         callback(null, terminal._id, homeGridId);
//                     }
//                 });
//                 // 不存在主控
//             } else {
//                 next(null, ResponseUtil.resp(Code.STRUCTURE.CENTERBOX_NOT_EXIST));
//             }
//         },
//         function(terminalId, homeGridId, callback) {
//             if (!!homeGridId && !!terminalId) {
//                 self.app.rpc.home.homeRemote.bindTerminalToHomeGrid(session, homeGridId, terminalId, function(err) {
//                     if (err) {
//                         callback(err);
//                     } else {
//                         next(null, ResponseUtil.resp(Code.OK, terminalId));
//                     }
//                 });
//             } else {
//                 next(null, ResponseUtil.resp(Code.OK, terminalId));
//             }
//         }
//     ], function(err, result) {
//         next(null, ResponseUtil.resp(Code.DATABASE));
//     });
// };

Handler.prototype.addTerminal = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var ssid = msg.ssid;
    var passwd = msg.passwd;
    var terminalSerialno = msg.terminalSerialno;
    var centerBoxSerialno = msg.centerBoxSerialno;
    var homeGridId = msg.homeGridId;

    async.waterfall([
        function(callback) {
            self.app.rpc.home.homeRemote.centerBoxSerailnoExist(session, centerBoxSerialno, function(err, flag) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, flag);
                }
            });
        },
        function(flag, callback) {
            // 主控存在
            if (flag) {
                TerminalModel.find({terminalSerialno:terminalSerialno}, function(err, terminal) {
                    if(err || !!terminal) {
                        next(null, ResponseUtil.resp(Code.STRUCTURE.TERMINAL_ALREADY_EXIST));
                    } else {
                        // 终端是新的
                        var terminalEntity = new TerminalModel({
                            centerBoxSerialno: centerBoxSerialno,
                            ssid: ssid,
                            passwd: passwd,
                            terminalSerialno : terminalSerialno
                        });
                        terminalEntity.save(function(err, terminal) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                callback(null, terminal._id, homeGridId);
                            }
                        });
                    }
                });
                // 不存在主控
            } else {
                next(null, ResponseUtil.resp(Code.STRUCTURE.CENTERBOX_NOT_EXIST));
            }
        },
        function(terminalId, homeGridId, callback) {
            var param = {
                command: '5000',
                ipAddress: curIpAddress,
                serialNo: centerBoxSerialno,
                data: terminalSerialno,
                port: curPort
            };
            if (!!homeGridId && !!terminalId) {
                self.app.rpc.home.homeRemote.bindTerminalToHomeGrid(session, homeGridId, terminalId, function(err) {
                    if (err) {
                        callback(err);
                    } else {  
                        console.log("向ots推送消息:" + JSON.stringify(param));
                        self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                            uid: 'socketServer*otron',
                            sid: 'connector-server-1'
                        }]);
                        next(null, ResponseUtil.resp(Code.OK, terminalId));
                    }
                });
            } else {
                console.log("向ots推送消息:" + JSON.stringify(param));
                self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                    uid: 'socketServer*otron',
                    sid: 'connector-server-1'
                }]);
                next(null, ResponseUtil.resp(Code.OK, terminalId));
            }
        }
    ], function(err, result) {
        next(null, ResponseUtil.resp(Code.DATABASE));
    });
};

/**
 * 终端绑定到房间
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.bindTerminalToHomeGrid = function(msg, session, next) {
    var self = this;

    var homeGridId = msg.homeGridId;
    var terminalId = msg.terminalId;

    self.app.rpc.home.homeRemote.bindTerminalToHomeGrid(session, homeGridId, terminalId, function(err) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK));
        }
    });
};


/**
 * 获取设备类型列表
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.getDeviceTypes = function(msg, session, next) {
    var types = [{
        name: '空调'
    }, {
        name: '电视'
    }, {
        name: '电灯'
    }, {
        name: '窗帘'
    }];
    next(null, ResponseUtil.resp(Code.OK, types));
};

/**
 * 根据类型获取品牌列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getDeviceBrands = function(msg, session, next) {
    var self = this;
    var type = msg.type;
    self.app.rpc.home.homeRemote.getDeviceBrands(session, type, function(err, brands) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, brands));
        }
    });
};

/**
 * 根据设备品牌获得型号列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getDeviceModels = function(msg, session, next) {
    var self = this;
    var brand = msg.brand;
    var type = msg.type;
    self.app.rpc.home.homeRemote.getDeviceModels(session, brand, type, function(err, deviceModels) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, deviceModels));
        }
    });
};

/**
 * 发送红外码
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.sendTestIrCode = function(msg, session, next) {
    var self = this;
    var tid = msg.tid;
    var type = msg.type;
    var inst = '100000';
    if (type === "空调") {
        inst = '100000';
    } else if (type === '电视') {
        inst = 'T_ONOFF';
    }

    var terminalCode = msg.terminalCode;
    var serialno = msg.serialno;

    self.app.rpc.home.homeRemote.getTestIrCode(session, tid, inst, function(err, irCodeInfo) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                if (err) {
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    var curPort = centerBox.curPort;
                    var curIpAddress = centerBox.curIpAddress;
                    var infrared = irCodeInfo.infrared;
                    var param = {
                        command: '3000',
                        ipAddress: curIpAddress,
                        serialNo: serialno,
                        data: terminalCode + " " + infrared,
                        port: curPort
                    };

                    console.log("向ots推送消息:" + JSON.stringify(param));
                    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                        uid: 'socketServer*otron',
                        sid: 'connector-server-1'
                    }]);

                    next(null, ResponseUtil.resp(Code.OK, JSON.stringify(param)));
                }
            });
        }
    });
};

/**
 * 新增电器
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.saveNewDevice = function(msg, session, next) {
    var terminalId = msg.terminalId;
    var homeId = msg.homeId;
    var layerName = msg.layerName;
    var homeGridId = msg.homeGridId;
    var type = msg.type;
    var brand = msg.brand;
    var name = msg.name;
    var model = msg.model;

    // 设备初始化状态添加,各种状态的调整和解读
    var status = DeviceStatusUtil.getInitStatus(type);

    var userEquipmentEntity = new UserEquipmentModel({
        e_name: name,
        terminalId: terminalId,
        home_id: homeId,
        layerName: layerName,
        homeGridId: homeGridId,
        e_type: type,
        pingpai: brand,
        typeName: model,
        status: status.status,
        ac_model: status.model,
        ac_windspeed: status.ac_windspeed,
        ac_temperature: status.ac_temperature,
        tv_ismute: status.tv_ismute
    });
    console.log(JSON.stringify(userEquipmentEntity));
    console.log(JSON.stringify(status));

    userEquipmentEntity.save(function(err) {
        if (err) {
            console.log(err);
            next(null, Code.DATABASE);
        } else {
            next(null, Code.OK);
        }
    });
};

Handler.prototype.deleteDevice = function(msg, session, next) {
    var deviceId = msg.deviceId;
    if (!!deviceId) {
        if (deviceId.indexOf(",") > -1) {
            var idArray = deviceId.split(',');
            var ids = [];
            for (var i = 0; i < idArray.length; i++) {
                ids.push(idArray[i]);
            }

            UserEquipmentModel.remove({
                _id: {
                    $in: ids
                }
            }, function(err, docs) {
                if (err) {
                    console.log(err);
                    next(null, Code.DATABASE);
                } else {
                    next(null, Code.OK);
                }
            });
        } else {
            UserEquipmentModel.remove({
                _id: new Object(deviceId)
            }, function(err, docs) {
                if (err) {
                    console.log(err);
                    next(null, Code.DATABASE);
                } else {
                    next(null, Code.OK);
                }
            });
        }
    }
};

// TODO 所有相关的删除方法

/********************************************** 初始化 end ***************************************************/


/**
 * 用户更新
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.updateUserInfo = function(msg, session, next) {
    var self = this;
    var name = msg.name;
    var mobile = session.uid;
    if (StringUtil.isBlank(name)) {
        next(null, Code.ACCOUNT.NAME_IS_BLANK);
    } else {
        self.app.rpc.user.userRemote.updateUserInfo(session, mobile, name, function(msg) {
            if (msg === 0) {
                next(null, Code.OK);
            } else {
                next(null, Code.DATABASE);
            }
        });
    }
};


var resolveHomeGrids = function(homeId, layerName, room, hall, toilet, kitchen) {
    for (var i = 1; i <= room; i++) {
        var name = "房间";
        if (room > 1) {
            name += i;
        }
        new HomeGridModel({
            homeId: homeId,
            layerName: layerName,
            gridType: 'room',
            dorder: i,
            name: name
        }).save(function(err, doc) {});
    }

    for (var j = 1; j <= hall; j++) {
        var name_1 = "客厅";
        if (hall > 1) {
            name_1 += j;
        }
        new HomeGridModel({
            homeId: homeId,
            layerName: layerName,
            gridType: 'hall',
            dorder: j,
            name: name_1
        }).save(function(err, doc) {});
    }

    for (var k = 1; k <= toilet; k++) {
        var name_2 = "卫生间";
        if (toilet > 1) {
            name_2 += k;
        }
        new HomeGridModel({
            homeId: homeId,
            layerName: layerName,
            gridType: 'toilet',
            dorder: k,
            name: name_2
        }).save(function(err, doc) {});
    }

    for (var l = 1; l <= kitchen; l++) {
        var name_3 = "厨房";
        if (kitchen > 1) {
            name_3 += l;
        }
        new HomeGridModel({
            homeId: homeId,
            layerName: layerName,
            gridType: 'kitchen',
            dorder: l,
            name: name_3
        }).save(function(err, doc) {});
    }
};

/**
 * 前台用户语音
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.userSaySomething = function(msg, session, next) {
    var self = this;
    var uid = session.uid;
    /** 用户经过讯飞解析后的文本 **/
    var words = msg.words;
    /** 辅助判断 **/
    var ipAddress = msg.ipAddress;
    var port = msg.port;

    var loccode = msg.loccode;
    var runtimeinfo_id = msg.runtimeinfo_id;

    var answer = [];
    var data = {};

    var privateData = {"isDelayOrder":false,"isCanLearn":false,
        "from":"turing","type":"data"};
    if(words.indexOf("招呼") > -1) {
        words = "跟大家打个招呼吧";
    } else if(words.indexOf('自我介绍') > -1) {
        words = "自我介绍一下";
    } else if(words.indexOf('你从哪里来') > -1) {
        words = "你从哪里来";
    }

    if(words.indexOf('欢乐喜剧人') > -1) {
        privateData.result = "现在没有频道在播放《欢乐喜剧人》";
        next(null, ResponseUtil.resp(Code.OK, privateData));
    } else if(words.indexOf('节目') > -1) {
        privateData.result = "现在最热门的节目是《锦绣未央》，23%的用户都在看这个节目，需要为你切换到该节目吗？";
        next(null, ResponseUtil.resp(Code.OK, privateData));
        next(null, ResponseUtil.resp(Code.OK, privateData));
    } else if(words.indexOf('睡觉') > -1) {
        privateData.result = "已为您把电灯关闭，电视关闭，空调关闭，晚安";
        next(null, ResponseUtil.resp(Code.OK, privateData));
    } else {
        async.waterfall([
            /** 第一步, 预置操作 图片和链接 **/
                function(callback) {
                if (words === '图片') {
                    answer.push("http://tupian.enterdesk.com/2015/gha/12/0803/08.jpg");
                    data.answer = answer;
                    data.type = 'pic';
                    next(null, ResponseUtil.resp(Code.OK, data));
                } else if (words === '链接') {
                    answer.push("<a href='http://www.orz-tech.com/'>奧智网络</a>");
                    data.answer = answer;
                    data.type = 'link';
                    next(null, ResponseUtil.resp(Code.OK, data));
                } else {
                    callback(null, uid);
                }
            },

            /** 第二步，查找用户具体信息  **/
                function(userMobile, callback) {
                self.app.rpc.user.userRemote.getUserInfoByMobile(session, userMobile, function(err, user) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, user);
                    }
                });
            },

            /** 第四步，访问brain服务器，获取智能解析结果 **/
                function(user, callback) {
                var userId = user._id;
                var params = {
                    str: words,
                    user_id: userId,
                };
                // 主服务器
                // var host = "http://122.225.88.66:8084/main/ao?str=" + params.str + "&user_id=" + params.user_id + "&home_id=" + params.home_id + "&nd=" + new Date().getTime();
                var host = "http://127.0.0.1:3000/say";

                logger.info('request smart center with params : ' + host + "::" + Moment(new Date()).format('HH:mm:ss'));
                request.post(host, {form:params}, function(err, response, body) {
                    if (err) {
                        callback(err);
                    } else {
                        if (response.statusCode === 200) {
                            logger.debug('smart center response :: ' + response.statusCode + "\n" + body);
                            callback(null, user, body);
                        } else {
                            next(null, Code.NET_FAIL);
                        }
                    }

                });
            },

            /* 第五步, 解析brain 检查返回值 */
            function(user, body, callback) {
                var javaResult = JSON.parse(body);
                if (!!javaResult && javaResult.code == 200) {
                    if(!!javaResult.data) {
                        callback(null, user, javaResult.data);
                    } else {
                        // 服务器中没有得到信息
                        var answer = [];
                        answer.push("访问的用户太多，奧创忙不过来了，请稍后再试");
                        data.answer = answer;
                        data.type = "data";
                        next(null, ResponseUtil.resp(Code.OK, data));
                    }
                } else {
                    next(null, Code.NET_FAIL);
                }
            },

            /* 第六步，查看是否是图灵机器人的返回 */
            function(user, result, callback) {
                console.log("图灵图灵图灵" + result.status);
                if(result.status === "turing") {
                    data.voiceId = result.inputstr_id;
                    data.isDelayOrder = result.delayOrder;
                    data.isCanLearn = result.iscanlearn;
                    data.from = "turing";
                    var msgObj = JSON.parse(result.msg);
                    if(msgObj.code === 100000) {
                        data.result = msgObj.text;
                    } else if(msgObj.code === 200000) {
                        data.result = msgObj.text + "<a href='" + msgObj.url + "'>点此查看</a>";
                    }
                    data.type = "data";
                    console.log("==============================图灵=========================================");
                    console.log(ResponseUtil.resp(Code.OK, data));
                    next(null, ResponseUtil.resp(Code.OK, data));
                } else {
                    callback(null, user, result);
                }
            },

            /* 第七步，查看是否是上下文问题 */
            function(user, result, callback) {
                if(!!result && !!result.optionList && result.optionList.length > 1) {
                    data.voiceId = result.inputstr_id;
                    data.isDelayOrder = result.delayOrder;
                    data.isCanLearn = result.iscanlearn;
                    data.from = "success";
                    data.result = result.msg;
                    data.type = "data";
                    next(null, ResponseUtil.resp(Code.OK, data));
                } else {
                    callback(null, user, result);
                }
            },

            /* 第八步, 发送指令(红外码,开关)操作 */
            function(user, result, callback) {
                var data = {};
                data.voiceId = result.inputstr_id;
                data.isDelayOrder = result.delayOrder;
                data.isCanLearn = result.iscanlearn;
                data.from = result.status;

                if (!!result.orderAndInfrared && result.orderAndInfrared.length > 0) {
                    var targetArray = [];
                    var devices = [];
                    var sentence = "";

                    if (result.inputstr.indexOf('我要看') === 0) {
                        SayingUtil.translateTv(result, function(tvRet) {
                            targetArray.push(tvRet);
                            if (!!result.orderAndInfrared) {
                                var render_tv = function(orderAndInfrared) {
                                    return new Promise(function(resolve, reject) {
                                        var t = orderAndInfrared;
                                        if (!!t.infrared && !!t.infrared.infraredcode) {
                                            var ircode = t.infrared.infraredcode;
                                            self.app.rpc.home.homeRemote.getDeviceById(session, t.order.ueq._id, function(err, userEquipment) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    self.app.rpc.home.homeRemote.getTerminalById(session, userEquipment.terminalId, function(err, terminal) {
                                                        if (err) {
                                                            reject(err);
                                                        } else {
                                                            var serialno = terminal.centerBoxSerialno;
                                                            var terminalCode = terminal.code;
                                                            self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                                                                if (err) {
                                                                    reject(err);
                                                                } else {
                                                                    var curPort = centerBox.curPort;
                                                                    var curIpAddress = centerBox.curIpAddress;
                                                                    console.log("---------------------寻找当前主控信信息---------------------");
                                                                    console.log("curIpAddress : " + curIpAddress + "___curPort : " + curPort);
                                                                    var param = {
                                                                        command: '3000',
                                                                        ipAddress: curIpAddress,
                                                                        serialNo: serialno,
                                                                        data: terminalCode + " " + ircode,
                                                                        port: curPort
                                                                    };
                                                                    resolve(param);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                };


                                var tvRandering = [];
                                for (var j = 0; j < result.orderAndInfrared.length; j++) {
                                    tvRandering.push(render_tv(result.orderAndInfrared[j]));
                                }
                                Promise.all(tvRandering).then(function(results) {
                                    console.log("全部分析完成，开始执行");
                                    if(results.length === 4) {
                                        self.app.get('channelService').pushMessageByUids('onMsg', results[0], [{
                                            uid: 'socketServer*otron',
                                            sid: 'connector-server-1'
                                        }]);
                                        setTimeout(function () {
                                            self.app.get('channelService').pushMessageByUids('onMsg', results[1], [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                        }, 500);
                                        setTimeout(function () {
                                            self.app.get('channelService').pushMessageByUids('onMsg', results[2], [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                        }, 1000);
                                        setTimeout(function () {
                                            self.app.get('channelService').pushMessageByUids('onMsg', results[3], [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                        }, 1500);
                                    } else if(results.length === 3) {
                                        self.app.get('channelService').pushMessageByUids('onMsg', results[0], [{
                                            uid: 'socketServer*otron',
                                            sid: 'connector-server-1'
                                        }]);
                                        setTimeout(function () {
                                            self.app.get('channelService').pushMessageByUids('onMsg', results[1], [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                        }, 500);
                                        setTimeout(function () {
                                            self.app.get('channelService').pushMessageByUids('onMsg', results[2], [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                        }, 1000);
                                    } else if(results.length === 2) {
                                        self.app.get('channelService').pushMessageByUids('onMsg', results[0], [{
                                            uid: 'socketServer*otron',
                                            sid: 'connector-server-1'
                                        }]);
                                        setTimeout(function () {
                                            self.app.get('channelService').pushMessageByUids('onMsg', results[1], [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                        }, 500);
                                    } else {
                                        self.app.get('channelService').pushMessageByUids('onMsg', results[0], [{
                                            uid: 'socketServer*otron',
                                            sid: 'connector-server-1'
                                        }]);
                                    }
                                });

                                // 判断是否延时
                                if (result.delayOrder === true) {
                                    sentence = result.delayDesc + "将为您" + JSON.stringify(targetArray);
                                } else {
                                    sentence = "已为您" + JSON.stringify(targetArray);
                                }
                                data.answer = sentence;
                                data.devices = devices;
                                data.type = "data";
                                next(null, ResponseUtil.resp(Code.OK, data));
                            }
                        });
                    } else {
                        var render_sendingIrCode = function(orderAndInfrared, targetArray, devices, sentence) {
                            return new Promise(function(resolve, reject) {
                                var t = orderAndInfrared;
                                targetArray.push(SayingUtil.translateStatus(t));
                                devices.push(t.order.ueq);
                                if (result.delayOrder !== true) {
                                    if (!!t.infrared && !!t.infrared.infraredcode) {
                                        var ircode = t.infrared.infraredcode;
                                        var inst = t.infrared.inst;
                                        self.app.rpc.home.homeRemote.getDeviceById(session, t.order.ueq._id, function(err, userEquipment) {
                                            logger.error("userEquipment:" + JSON.stringify(userEquipment));
                                            if (err) {
                                                reject(err);
                                            } else {
                                                self.app.rpc.home.homeRemote.getTerminalById(session, userEquipment.terminalId, function(err, terminal) {
                                                    if (err) {
                                                        reject(err);
                                                    } else {
                                                        var serialno = terminal.centerBoxSerialno;
                                                        var terminalCode = terminal.code;
                                                        self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                                                            if (err) {
                                                                reject(err);
                                                            } else {
                                                                var curPort = centerBox.curPort;
                                                                var curIpAddress = centerBox.curIpAddress;
                                                                console.log("---------------------寻找当前主控信信息---------------------");
                                                                console.log("curIpAddress : " + curIpAddress + "___curPort : " + curPort);
                                                                var param = {};
                                                                if(userEquipment.e_type === "电灯" || userEquipment.e_type === "窗帘") {
                                                                    var address = userEquipment.address;
                                                                    var sw;
                                                                    if(inst === "D_TEST_ON" || inst === "C_TEST_ON") {
                                                                        sw = '11';
                                                                    } else {
                                                                        sw = "18";
                                                                    }
                                                                    param = {
                                                                        command: '3008',
                                                                        ipAddress: curIpAddress,
                                                                        data: address + " " + sw,
                                                                        port: curPort
                                                                    };

                                                                    console.log("向ots推送消息:" + JSON.stringify(param));
                                                                    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                                                        uid: 'socketServer*otron',
                                                                        sid: 'connector-server-1'
                                                                    }]);
                                                                } else {
                                                                    param = {
                                                                        command: '3000',
                                                                        ipAddress: curIpAddress,
                                                                        serialNo: serialno,
                                                                        data: terminalCode + " " + ircode,
                                                                        port: curPort
                                                                    };

                                                                    console.log("向ots推送消息:" + JSON.stringify(param));
                                                                    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                                                        uid: 'socketServer*otron',
                                                                        sid: 'connector-server-1'
                                                                    }]);
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        };
                        var toRandering = [];
                        for (var i = 0; i < result.orderAndInfrared.length; i++) {
                            if(result.orderAndInfrared[i].order.ueq.length > 0) {
                                /************************************** 临时 ******************************************/
                                var t = result.orderAndInfrared[i];
                                targetArray.push(SayingUtil.translateLights(t));
                                devices = devices.concat(t.order.ueq);
                                if (result.delayOrder !== true) {
                                    if (!!t.infrared && !!t.infrared.infraredcode) {
                                        var ircode = t.infrared.infraredcode;
                                        var inst = t.infrared.inst;
                                        for(var xx=0;xx<t.order.ueq.length;xx++) {
                                            self.app.rpc.home.homeRemote.getDeviceById(session, t.order.ueq[xx]._id, function(err, userEquipment) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    self.app.rpc.home.homeRemote.getTerminalById(session, userEquipment.terminalId, function(err, terminal) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            var serialno = terminal.centerBoxSerialno;
                                                            var terminalCode = terminal.code;
                                                            self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    var curPort = centerBox.curPort;
                                                                    var curIpAddress = centerBox.curIpAddress;
                                                                    console.log("---------------------寻找当前主控信信息---------------------");
                                                                    console.log("curIpAddress : " + curIpAddress + "___curPort : " + curPort);
                                                                    var address = userEquipment.address;
                                                                    var sw;
                                                                    if(inst === "D_TEST_ON" || inst === "C_TEST_ON") {
                                                                        sw = '11';
                                                                    } else {
                                                                        sw = "18"
                                                                    }
                                                                    var param = {
                                                                        command: '3008',
                                                                        ipAddress: curIpAddress,
                                                                        data: address + " " + sw,
                                                                        port: curPort
                                                                    };

                                                                    console.log("向ots推送消息:" + JSON.stringify(param));
                                                                    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                                                        uid: 'socketServer*otron',
                                                                        sid: 'connector-server-1'
                                                                    }]);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                                /************************************** 临时 ******************************************/
                            } else {
                                toRandering.push(render_sendingIrCode(result.orderAndInfrared[i], targetArray, devices, sentence));
                            }
                        }

                        Promise.all(toRandering).then(function() {
                            console.log("全部执行完成");
                        });

                        // 判断是否延时
                        if (result.delayOrder === true) {
                            sentence = result.delayDesc + "将为您" + JSON.stringify(targetArray);
                        } else {
                            sentence = "已为您" + JSON.stringify(targetArray);
                        }
                        data.answer = sentence;
                        data.devices = devices;
                        data.type = "data";
                        next(null, ResponseUtil.resp(Code.OK, data));
                    }
                } else {
                    next(null, Code.NET_FAIL);
                }
            }
        ], function(err, result) {
            if (err) {
                logger.error(JSON.stringify(err));
                next(null, ResponseUtil.resp(Code.DATABASE));
            }
        });
    }
};

// TODO 只对在语音界面的用户推送
Handler.prototype.enterVoice = function(msg, session, next) {
    next(null, Code.OK);
};
// TODO 只对在语音界面的用户推送
Handler.prototype.leaveVoice = function(msg, session, next) {
    next(null, Code.OK);
};

/**
 * 向用户推送
 * type可选 ['txt', 'pic', 'link', 'arch']
 * 对应 文本，图片，链接，APP内部锚点
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.pushMsg = function(msg, session, next) {
    var self = this;
    var targetMobile = msg.targetMobile;
    var type = msg.type;
    var content = msg.content;
    var pic = msg.pic;
    var link = msg.link;

    var param = {
        type: type,
        data: content,
        pic: pic,
        link: link
    };

    /**
     * 不填写，向全部用户推送
     */
    if (targetMobile === "" || targetMobile === undefined || targetMobile == "undefined") {
        UserModel.find({}, function(err, docs) {
            if (!!docs) {
                for (var i = 0; i < docs.length; i++) {
                    var tm = docs[i].mobile;
                    self.app.get('channelService').pushMessageByUids('onVoice', param, [{
                        uid: tm,
                        sid: 'user-server-1'
                    }]);
                }
            }
        });
    } else {
        self.app.get('channelService').pushMessageByUids('onVoice', param, [{
            uid: targetMobile,
            sid: 'user-server-1'
        }]);
    }
};


/**
 * 向用户推送
 * type可选 ['txt', 'pic', 'link', 'arch']
 * 对应 文本，图片，链接，APP内部锚点
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.managePush = function(msg, session, next) {
    var self = this;
    var targetMobile = msg.targetMobile;
    var title = msg.title;
    var content = msg.content;

    /**
     * 不填写，向全部用户推送
     */
    if (targetMobile === "" || targetMobile === undefined || targetMobile == "undefined") {
        UserModel.find({}, function(err, docs) {
            if (!!docs) {
                for (var i = 0; i < docs.length; i++) {
                    managePushProcess(docs[i].mobile, title, content, self);
                }
            }
        });
    } else {
        managePushProcess(targetMobile, title, content, self);
    }
};

var managePushProcess = function(mobile, title, content, self) {
    NoticeModel.count({
        hasRead: 0,
        userMobile: mobile
    }, function(err, count) {
        var param = {
            command: '9009',
            title: title,
            content: content,
            addTime: new Date(),
            addTimeLabel: Moment(new Date()).format('HH:mm'),
            notReadCount: count
        };
        self.app.get('channelService').pushMessageByUids('onMsg', param, [{
            uid: mobile,
            sid: 'user-server-1'
        }]);
    });
};


/**
 * 用户学习
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.study = function(msg, session, next) {

    var inputstr_id = msg.lastVoiceId;
    var devicesString = msg.devices;
    var devices = JSON.parse(devicesString);
    console.log("_-------------------------------------------------------------");
    console.log("devicesString:" + devicesString);
    console.log("_-------------------------------------------------------------");
    var postString = {};
    postString.inputstr_id = inputstr_id;
    var orderparamlist = [];

    UserModel.find({
        mobile: session.uid
    }, function(err, userDocs) {
        if (err) {
            console.log(err);
            next(null, Code.DATABASE);
        } else {
            for (var i = 0; i < devices.length; i++) {
                var d = {};
                d.ac_temperature = devices[i].ac_temperature;
                d.ac_windspeed = devices[i].ac_windspeed;
                d.deviceId = devices[i].id || devices[i]._id;
                d.deviceType = devices[i].e_type;
                d.model = devices[i].ac_model;
                d.status = devices[i].status;
                d.user_id = userDocs[0]._id;
                d.inputstr_id = inputstr_id;
                orderparamlist.push(d);
            }
            postString.orderparamlist = orderparamlist;
            console.log('学习学习学习:::::::::::::::::::::::::::::::::::::::::::::::::::::::');
            console.log(JSON.stringify(postString));
            // request.post('http://abc.buiud.bid:8080/main/learnorder', {form: {learnParam: JSON.stringify(postString)}}, function (error, response, body) {
            request.post('http://122.225.88.66:8084/main/learnorder', {
                form: {
                    learnParam: JSON.stringify(postString)
                }
            }, function(error, response, body) {
                console.log(error);
                console.log('学习学习学习:::::::::::::::::::::::::::::::::::::::::::::::::::::::');
                console.log(response);
                console.log('学习学习学习:::::::::::::::::::::::::::::::::::::::::::::::::::::::');
                console.log(body);
                console.log('学习学习学习:::::::::::::::::::::::::::::::::::::::::::::::::::::::');
                if (!error && response.statusCode == 200) {
                    var javaResult = JSON.parse(body);
                    if (!!javaResult && javaResult.code == 200) {
                        var result = JSON.parse(javaResult.data);
                        var ret = Code.OK;
                        if (!!result) {
                            if (result[0].msg == "没有对应的虚拟命令") {
                                var err = Code.FAIL;
                                err.msg = "没有对应的虚拟命令";
                                next(null, err);
                            } else {
                                var data = {};
                                var targetArray = [];
                                var devices = [];
                                var sentence = "";
                                var delayDesc = "";
                                console.log('result.length:::' + result.length);
                                console.log("result:" + JSON.stringify(result));
                                for (var i = 0; i < result.length; i++) {
                                    data.voiceId = result[i].inputstr_id;
                                    data.isDelayOrder = result[i].delayOrder;
                                    data.isCanLearn = result[i].iscanlearn;
                                    data.from = result[i].status;

                                    delayDesc = result[i].delayDesc;

                                    var t = result[i].orderAndInfrared;
                                    targetArray.push(SayingUtil.translateStatus(t[0].order.c_ac));
                                    devices.push(t[0].order.c_ac);
                                }

                                // 判断是否延时
                                if (data.isDelayOrder === true) {
                                    sentence = delayDesc + "将为您" + JSON.stringify(targetArray);
                                } else {
                                    sentence = "已为您" + JSON.stringify(targetArray);
                                }
                                data.answer = sentence;
                                data.devices = devices;
                                ret.data = data;
                                next(null, ret);
                            }

                        }
                    } else {
                        console.log("报错：：：" + JSON.stringify(javaResult));
                    }
                }
            });
        }
    });
};

/**
 * 根据用户某句话得到设备列表
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getDeviceListByVoiceId = function(msg, session, next) {
    var deviceIds = msg.deviceIds;
    var array = deviceIds.split(",");
    UserEquipmentModel.find({
        _id: {
            $in: array
        }
    }, function(err, docs) {
        if (err) {
            console.log(err);
            next(null, Code.DATABASE);
        } else {
            var ret = Code.OK;
            ret.data = docs;
            next(null, ret);
        }
    });
};

/**
 * 用户发出遥控指令
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.remoteControll = function(msg, session, next) {
    var self = this;
    // 目前写死一个设备
    var user_id = session.uid;
    var deviceId = msg.deviceId;

    async.waterfall([
        /** 第一步, 获得设备详情 **/
            function(callback) {
            self.app.rpc.home.homeRemote.getDeviceById(session, deviceId, function(err, device) {
                if (err) {
                    callback(err);
                } else {
                    if (!!device) {
                        callback(null, device);
                    } else {
                        next(null, Code.REMOTECONTROLL.USEREQUIPMENT_NOT_EXIST);
                    }
                }
            });
        },

        /** 第二步, 发送给smart center服务器，获取红外数据 **/
            function(device, callback) {
            var deviceType = msg.deviceType === undefined ? '' : msg.deviceType;
            var status = msg.status === undefined ? '' : msg.status;
            var model = msg.model === undefined ? '' : msg.model;
            var ac_windspeed = msg.ac_windspeed === undefined ? '' : msg.ac_windspeed;
            var ac_temperature = msg.ac_temperature === undefined ? '' : msg.ac_temperature;
            var num = msg.num === undefined ? '' : msg.num;
            var chg_voice = msg.chg_voice === undefined ? '' : msg.chg_voice;
            var chg_chn = msg.chg_chn === undefined ? '' : msg.chg_chn;
            var inst = msg.inst === undefined ? '' : msg.inst;
            var data = {
                user_id: user_id,
                deviceId: deviceId,
                deviceType: deviceType,
                status: status,
                model: model,
                ac_windspeed: ac_windspeed,
                ac_temperature: ac_temperature,
                chg_chn: chg_chn,
                chg_voice: chg_voice,
                inst: inst
            };
            var host = "http://127.0.0.1:3000/remoteControl";
            console.log("直接遥控发送，参数为:" + JSON.stringify(data));
            request.post(host, {form:data}, function(err, response, body) {
                console.log("直接遥控返回:" + body);
                if (!err && response.statusCode == 200) {
                    var javaResult = JSON.parse(body);
                    var ret = Code.OK;
                    if (!!javaResult && javaResult.code == 200) {
                        callback(null, javaResult);
                    } else {
                        callback(javaResult);
                    }
                } else {
                    callback(err);
                }
            });
        },

        /** 第三步, 解析smart home的返回 **/
            function(javaResult) {
            var result = javaResult.data;
            var data = {};
            if (!!result.orderAndInfrared && result.orderAndInfrared.length > 0) {
                var render_sendingIrCode = function(ircode) {
                    return new Promise(function(resolve, reject) {
                        // 查找设备的terminalId
                        self.app.rpc.home.homeRemote.getDeviceById(session, deviceId, function(err, device) {
                            if (err) {
                                reject(err);
                            } else {
                                // 查找terminalCode
                                self.app.rpc.home.homeRemote.getTerminalById(session, device.terminalId, function(err, terminal) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        var terminalCode = terminal.code;
                                        if (!terminalCode) {
                                            terminalCode = "01";
                                        }
                                        var serialno = terminal.centerBoxSerialno;
                                        // 查找当前的ip和port
                                        self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                var curPort = centerBox.curPort;
                                                var curIpAddress = centerBox.curIpAddress;
                                                var param = {
                                                    command: '3000',
                                                    ipAddress: curIpAddress,
                                                    serialNo: serialno,
                                                    data: terminalCode + " " + ircode,
                                                    port: curPort
                                                };
                                                var sessionService = self.app.get('sessionService');
                                                console.log("向ots推送消息:" + JSON.stringify(param));
                                                self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                                    uid: 'socketServer*otron',
                                                    sid: 'connector-server-1'
                                                }]);

                                                // 向对应用户推送消息
                                                UserModel.findOne({
                                                    mobile: user_id
                                                }, function(err, user) {
                                                    if (err) {
                                                        reject(err);
                                                    } else {
                                                        sendNotice(user.mobile, self);
                                                        resolve();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                };

                var targetArray = [];
                var devices = [];
                var toRandering = [];
                for (var i = 0; i < result.orderAndInfrared.length; i++) {
                    var t = result.orderAndInfrared[i];
                    targetArray.push(SayingUtil.translateStatus(t));

                    devices.push(t.order.ueq);
                    if (!!t.infrared && !!t.infrared.infraredcode) {
                        var ircode = t.infrared.infraredcode;
                        toRandering.push(render_sendingIrCode(ircode));
                    }
                }

                Promise.all(toRandering).then(function() {
                    console.log("全部执行完成");
                    // 判断是否延时
                    if (result.delayOrder === true) {
                        sentence = result.delayDesc + "将为您" + JSON.stringify(targetArray);
                    } else {
                        sentence = "已为您" + JSON.stringify(targetArray);
                    }

                    data.answer = sentence;
                    data.devices = devices;
                    data.type = "data";
                    next(null, ResponseUtil.resp(Code.OK, data));
                });
            } else {
                if (result.status == "turing") {
                    var msgObj = JSON.parse(result.msg);
                    data = {
                        result: msgObj.text,
                        type: "data"
                    };
                } else {
                    data = {
                        result: result.msg,
                        type: "data"
                    };
                }
                next(null, ResponseUtil.resp(Code.OK, data));
            }
        }
    ], function(err, result) {
        logger.error(err);
        next(null, ResponseUtil.resp(Code.DATABASE));
    });
};

var sendNotice = function(userMobile, self) {
    console.log("设备状态信息推送..............." + userMobile);
    CenterBoxModel.find({
        userMobile: userMobile
    }, function(err, centerBoxs) {
        if (err) {
            console.log(err);
        } else {
            var ids = [];
            for (var i = 0; i < centerBoxs.length; i++) {
                ids.push(centerBoxs[i].serialno);
            }

            TerminalModel.find({
                centerBoxSerialno: {
                    $in: ids
                }
            }, function(err, terminals) {
                if (err) {
                    console.log(err);
                } else {
                    var tIds = [];
                    for (var j = 0; j < terminals.length; j++) {
                        tIds.push(terminals[j]._id);
                    }

                    UserEquipmentModel.find({
                        terminalId: {
                            $in: tIds
                        }
                    }).populate({
                        path: 'homeGridId',
                        model: 'homeGrid',
                        populate: {
                            path: 'terminal',
                            model: 'terminal'
                        }
                    }).exec(function(err, devices) {
                        if (err) {
                            console.log(err);
                        } else {
                            var ds = [];
                            for (var k = 0; k < devices.length; k++) {
                                ds.push(devices[k]);
                            }

                            var param = {
                                command: '6000',
                                devices: ds
                            };
                            self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                uid: userMobile,
                                sid: 'user-server-1'
                            }]);
                        }
                    });
                }
            });
        }
    });
};

Handler.prototype.getSensorDatas = function(msg, session, next) {
    var uid = session.uid;
    var centerBoxId = msg.centerBoxId;
    // TODO 排序
    SensorDataModel.find({
        centerBoxId: centerBoxId
    }, "-_id -centerBoxId", function(err, docs) {
        if (err) {
            console.log(err);
            next(null, Code.DATABASE);
        } else {
            var ret = Code.OK;
            ret.data = docs;
            next(null, ret);
        }
    });
};

Handler.prototype.getLastSensorDatas = function(msg, session, next) {
    var self = this;
    var uid = session.uid;
    var layerName = msg.layerName;
    var homeId = msg.homeId;

    self.app.rpc.home.homeRemote.getHomeById(session, homeId, function(err, home) {
        if (err) {
            console.log(JSON.stringify(err));
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            if (!!home) {
                if (!!home.layers) {
                    var flag = false;
                    var centerBoxSerialno = "";
                    for (var i = 0; i < home.layers.length; i++) {
                        if (layerName === home.layers[i].name) {
                            flag = true;
                            if (!!home.layers[i].centerBoxSerialno) {
                                centerBoxSerialno = home.layers[i].centerBoxSerialno;
                            }
                        }
                    }
                    if (flag) {
                        if (centerBoxSerialno !== "") {
                            self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, centerBoxSerialno, function(err, cBox) {
                                if (err) {
                                    next(null, ResponseUtil.resp(Code.DATABASE));
                                } else {
                                    self.app.rpc.home.homeRemote.getLastSensorData(session, cBox._id, function(err, sData) {
                                        if (err) {
                                            next(null, ResponseUtil.resp(Code.DATABASE));
                                        } else {
                                            if (sData && sData.length > 0) {
                                                next(null, ResponseUtil.resp(Code.OK, sData[0]));
                                            } else {
                                                next(null, ResponseUtil.resp(Code.OK));
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            next(null, ResponseUtil.resp(Code.STRUCTURE.LAYER_NOT_BINDED));
                        }
                    } else {
                        next(null, ResponseUtil.resp(Code.STRUCTURE.LAYER_NOT_EXIST));
                    }
                } else {
                    next(null, ResponseUtil.resp(Code.STRUCTURE.LAYER_NOT_EXIST));
                }
            } else {
                next(null, ResponseUtil.resp(Code.STRUCTURE.HOME_NOT_EXIST));
            }
        }
    });

};

Handler.prototype.getLastOutDoorSensorDatas = function(msg, session, next) {
    WeatherModel.findOne().sort({
        time: -1
    }).exec(function(err, data) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, data));
        }
    });
};

Handler.prototype.setCenterBoxSwitch = function(msg, session, next) {
    console.log("开关设置:::" + JSON.stringify(msg));
    if (msg.type == "temperature") {
        CenterBoxModel.update({
            "serialno": msg.serialno
        }, {
            $set: {
                "temperatureSwitch": msg.btn
            }
        }, function(error, docs) {
            next(null, ResponseUtil.resp(Code.OK));
        });
    } else if (msg.type == "humidity") {
        CenterBoxModel.update({
            "serialno": msg.serialno
        }, {
            $set: {
                "humiditySwitch": msg.btn
            }
        }, function(error, docs) {
            next(null, ResponseUtil.resp(Code.OK));
        });
    } else if (msg.type == "co") {
        CenterBoxModel.update({
            "serialno": msg.serialno
        }, {
            $set: {
                "coSwitch": msg.btn
            }
        }, function(error, docs) {
            next(null, ResponseUtil.resp(Code.OK));
        });
    } else if (msg.type == "quality") {
        CenterBoxModel.update({
            "serialno": msg.serialno
        }, {
            $set: {
                "qualitySwitch": msg.btn
            }
        }, function(error, docs) {
            next(null, ResponseUtil.resp(Code.OK));
        });
    } else if (msg.type == "pm25") {
        CenterBoxModel.update({
            "serialno": msg.serialno
        }, {
            $set: {
                "pm25Switch": msg.btn
            }
        }, function(error, docs) {
            next(null, ResponseUtil.resp(Code.OK));
        });
    }
};


Handler.prototype.getUserList = function(msg, session, next) {
    var self = this;
    var sessionService = this.app.get('sessionService');
    var uidMap = sessionService.service.uidMap;

    UserModel.find({}, function(err, docs) {
        if (err) console.log(err);
        else {
            var users = [];
            for (var i = 0; i < docs.length; i++) {
                var flag = false;
                for (var data in uidMap) {
                    if (docs[i].mobile === data) {
                        flag = true;
                    }
                }
                users.push({
                    "online": flag,
                    "user": docs[i]
                });
            }
            next(null, ResponseUtil.resp(Code.OK, users));
        }
    });
};

Handler.prototype.sendNotice = function(msg, session, next) {
    var self = this;
    var userMobile = msg.userMobile;
    var userMsg = msg.userMsg;

    var param = {
        "command": "notice",
        "userMsg": userMsg
    };

    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: userMobile,
        sid: 'user-server-1'
    }]);
};

/** 照片通知 **/
Handler.prototype.cameraAlert = function(msg, session, next) {
    var self = this;
    var url = msg.url;
    var userMobile = '13300000001';
    CameraPhotoModel.findOne({userMobile:userMobile}).sort({genTime:-1}).exec().then(function(last) {
        if(!!url) {
            if(!!last) {
                if(parseInt(last.genTime) < parseInt(msg.addTime)) {
                    var camera = new CameraPhotoModel({
                        url:url,
                        userMobile:userMobile,
                        genTime:msg.addTime
                    });
                    camera.save(function(err, c) {
                        if((parseInt(msg.addTime) - parseInt(last.genTime)) > 1000 * 60 * 1) {
                            var param = {
                                command : '9997',
                                url : url,
                                nd :msg.addTime
                            };
                            self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                uid: '13300000001',
                                sid: 'user-server-1'
                            }]);
                            var NoticeEntity = new NoticeModel({
                                userMobile: '13300000001',
                                hasRead: 0,
                                title: '您的摄像头监测到有动态物体移动，请注意查看',
                                content: msg.addTime,
                                noticeType: 9,
                                summary: msg.addTime
                            });
                            NoticeEntity.save(function(err) {
                                if (err) {
                                    logger.error(err);
                                } else {
                                    NoticeModel.count({
                                        hasRead: 0,
                                        userMobile: userMobile
                                    }, function(err, count) {
                                        // 保存成功，开始向用户发送消息
                                        var param = {
                                            command: '9002',
                                            title: '您的摄像头监测到有动态物体移动，请注意查看',
                                            content: msg.addTime,
                                            addTime: new Date(),
                                            addTimeLabel: Moment(new Date()).format('HH:mm'),
                                            summary: msg.addTime,
                                            notReadCount: count
                                        };
                                        self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                            uid: userMobile,
                                            sid: 'user-server-1'
                                        }]);
                                    });
                                }
                            });
                            next(null);
                        }
                    });
                }
            } else {
                var camera = new CameraPhotoModel({
                    url:url,
                    userMobile:userMobile,
                    genTime:msg.addTime
                });
                camera.save(function(err, c) {
                    var param = {
                        command : '9997',
                        url : url,
                        nd : new Date().getTime()
                    };
                    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                        uid: '13300000001',
                        sid: 'user-server-1'
                    }]);
                    next(null);
                });

            }
        }
    });
};

Handler.prototype.delayNotify = function(msg, session, next) {
    var self = this;
    var uid = msg.uid;
    var p = JSON.parse(msg);
    var param = {
        command: '6001',
    };
    console.log("延时命令：" + JSON.stringify(msg));
    var data = {};
    data.voiceId = p.inputstr_id;
    data.isDelayOrder = p.delayOrder;
    data.isCanLearn = p.iscanlearn;
    data.from = p.status;
    if (!!p.orderAndInfrared && p.orderAndInfrared.length > 0) {
        var targetArray = [];
        var devices = [];
        var sentence = "";

        var render_sendingIrCode = function(orderAndInfrared, targetArray, devices, sentence) {
            return new Promise(function(resolve, reject) {
                var t = orderAndInfrared;
                targetArray.push(SayingUtil.translateStatus(t.order.ueq));
                devices.push(t.order.ueq);
                if (!!t.infrared && !!t.infrared.infraredcode) {
                    var ircode = t.infrared.infraredcode;
                    self.app.rpc.home.homeRemote.getDeviceById(session, t.order.ueq.id, function(err, userEquipment) {
                        if (err) {
                            reject(err);
                        } else {
                            self.app.rpc.home.homeRemote.getTerminalById(session, userEquipment.terminalId, function(err, terminal) {
                                if (err) {
                                    reject(err);
                                } else {
                                    var serialno = terminal.centerBoxSerialno;
                                    var terminalCode = terminal.code;
                                    self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            var curPort = centerBox.curPort;
                                            var curIpAddress = centerBox.curIpAddress;
                                            console.log("---------------------寻找当前主控信信息---------------------");
                                            console.log("curIpAddress : " + curIpAddress + "___curPort : " + curPort);
                                            var param = {
                                                command: '3000',
                                                ipAddress: curIpAddress,
                                                serialNo: serialno,
                                                data: terminalCode + " " + ircode,
                                                port: curPort
                                            };
                                            console.log("(延时)向ots推送消息:" + JSON.stringify(param));
                                            self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                                                uid: 'socketServer*otron',
                                                sid: 'connector-server-1'
                                            }]);
                                            resolve();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        };
        var toRandering = [];
        for (var i = 0; i < p.orderAndInfrared.length; i++) {
            toRandering.push(render_sendingIrCode(p.orderAndInfrared[i], targetArray, devices, sentence));
        }

        Promise.all(toRandering).then(function() {
            console.log("全部执行完成");

            sentence = "已为您" + JSON.stringify(targetArray);
            data.answer = sentence;
            data.devices = devices;
            data.type = "data";
            console.log("--------------------------推送定时----------------------------------------");
            param.data = data;
            console.log(JSON.stringify(param));
            self.app.get('channelService').pushMessageByUids('onMsg', param, [{
                uid: uid,
                sid: 'user-server-1'
            }]);
        });
    }
};

Handler.prototype.tempMsgList = function(msg, session, next) {
    var json = [];
    json.push({
        title: 'title1',
        content: 'content1'
    });
    json.push({
        title: 'title2',
        content: 'content2'
    });
    json.push({
        title: 'title3',
        content: 'content3'
    });
    json.push({
        title: 'title4',
        content: 'content4'
    });
    json.push({
        title: 'title5',
        content: 'content5'
    });
    json.push({
        title: 'title6',
        content: 'content6'
    });
    json.push({
        title: 'title7',
        content: 'content7'
    });
    json.push({
        title: 'title8',
        content: 'content8'
    });
    json.push({
        title: 'title9',
        content: 'content9'
    });
    json.push({
        title: 'title10',
        content: 'content10'
    });
    next(null, ResponseUtil.resp(Code.OK, json));
};

Handler.prototype.testOn = function(msg, session, next) {
    var self = this;
    // var data = "00 10 11";
    var data = "00 01 11";
    var curPort = msg.port;
    var curIpAddress = msg.ipAddress;
    var param = {
        command: '3008',
        ipAddress: curIpAddress,
        data: data,
        port: curPort
    };
    console.log("向ots推送消息:" + JSON.stringify(param));
    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: 'socketServer*otron',
        sid: 'connector-server-1'
    }]);
    next(null, ResponseUtil.resp(Code.OK));
};

Handler.prototype.testOff = function(msg, session, next) {
    var self = this;
    // var data = "00 10 18";
    var data = "00 01 18";
    var curPort = msg.port;
    var curIpAddress = msg.ipAddress;
    var param = {
        command: '3008',
        ipAddress: curIpAddress,
        data: data,
        port: curPort
    };
    console.log("向ots推送消息:" + JSON.stringify(param));
    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: 'socketServer*otron',

        sid: 'connector-server-1'
    }]);
    next(null, ResponseUtil.resp(Code.OK));
};

/**
 消息列表
 **/
Handler.prototype.getNoticeList = function(msg, session, next) {
    console.log("进入消息列表::::::::" + JSON.stringify(msg));
    var page = msg.page;
    if (page === undefined || page < 1) {
        page = 1;
    }
    var pageSize = msg.pageSize;
    if (pageSize === undefined || pageSize < 1) {
        pageSize = 10;
    }
    var userMobile = session.uid;

    var skip = pageSize * (page - 1);
    NoticeModel.find({
        userMobile: userMobile
    }).select('userMobile addTime hasRead title content noticeType summary')
        .sort({
            addTime: -1
        }).skip(skip).limit(pageSize).exec(function(err, notices) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            var news = [];
            var today = new Date();
            var yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            for (var i = 0; i < notices.length; i++) {
                var n = {};
                var addTime = notices[i].addTime;
                if (addTime.getFullYear() == today.getFullYear() && addTime.getMonth() == today.getMonth() && addTime.getDate() == today.getDate()) {
                    n.addTime = Moment(notices[i].addTime).format('HH:mm');
                } else {
                    if (addTime.getFullYear() == yesterday.getFullYear() && addTime.getMonth() == yesterday.getMonth() && addTime.getDate() == yesterday.getDate()) {
                        n.addTime = "昨天";
                    } else {
                        n.addTime = Moment(notices[i].addTime).format('MM-DD HH:mm');
                    }
                }
                n._id = notices[i]._id;
                n.title = notices[i].title;
                n.content = notices[i].content;
                n.contentTrim = StringUtil.filterHtml(notices[i].content);
                n.summary = notices[i].summary;
                n.userMobile = notices[i].userMobile;
                n.noticeType = notices[i].noticeType;
                n.hasRead = notices[i].hasRead;
                news.push(n);
            }
            next(null, ResponseUtil.resp(Code.OK, news));
        }
    });
};

/**
 消息详情
 **/
Handler.prototype.getNoticeDetail = function(msg, session, next) {
    var id = msg.noticeId;
    var userMobile = session.uid;
    NoticeModel.findOne({
        _id: new Object(id)
    }, function(err, notice) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            // 设置为已读
            NoticeModel.update({
                _id: id
            }, {
                $set: {
                    hasRead: 1
                }
            }, function(err, docs) {
                if (err) console.log(err);
            });
            var n = {};
            n._id = notice._id;
            n.title = notice.title;
            n.content = notice.content;
            n.contentTrim = StringUtil.filterHtml(notice.content);
            n.summary = notice.summary;
            n.userMobile = notice.userMobile;
            n.noticeType = notice.noticeType;
            n.hasRead = notice.hasRead;

            var today = new Date();
            var yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            var addTime = notice.addTime;
            if (addTime.getFullYear() == today.getFullYear() && addTime.getMonth() == today.getMonth() && addTime.getDate() == today.getDate()) {
                n.addTime = Moment(notice.addTime).format('HH:mm');
            } else {
                if (addTime.getFullYear() == yesterday.getFullYear() && addTime.getMonth() == yesterday.getMonth() && addTime.getDate() == yesterday.getDate()) {
                    n.addTime = "昨天";
                } else {
                    n.addTime = Moment(notice.addTime).format('MM-DD HH:mm');
                }
            }
            NoticeModel.count({
                hasRead: 0,
                userMobile: userMobile
            }, function(err, count) {
                if (err) console.log(err);
                else {
                    next(null, {
                        "code": 200,
                        "codetxt": "操作成功",
                        "count": count,
                        data: n
                    });
                }
            });
        }
    });
};

/**
 * 删除消息
 */
Handler.prototype.deleteNotice = function(msg, session, next) {
    var userMobile = session.uid;
    if (!!msg.noticeId) {
        var idArray = msg.noticeId.split(',');
        var ids = [];
        for (var i = 0; i < idArray.length; i++) {
            ids.push(idArray[i]);
        }

        NoticeModel.remove({
            _id: {
                $in: ids
            }
        }, function(err, docs) {
            if (err) {
                next(null, ResponseUtil.resp(Code.DATABASE));
            } else {
                NoticeModel.count({
                    hasRead: 0,
                    userMobile: userMobile
                }, function(err, count) {
                    if (err) {
                        next(null, ResponseUtil.resp(Code.DATABASE));
                    } else {
                        next(null, {
                            "code": 200,
                            "codetxt": "操作成功",
                            "count": count
                        });
                    }
                });
            }
        });
    }
};

/**
 设置消息为已读
 **/
Handler.prototype.setNoticeRead = function(msg, session, next) {
    var userMobile = session.uid;
    var all = msg.all;
    console.log("allallallalalalalalal::" + all);
    if (!!all && (all == "1" || all == "all")) {
        console.log(userMobile + "___________________________________________");
        NoticeModel.update({
            userMobile: userMobile
        }, {
            $set: {
                hasRead: 1
            }
        }, {
            multi: true
        }, function(err) {
            if (err) {
                console.log(err);
                next(null, ResponseUtil.resp(Code.DATABASE));
            } else {
                next(null, {
                    "code": 200,
                    "codetxt": "操作成功",
                    "all": 1
                });
            }
        });
    } else {
        if (!!msg.noticeId) {
            var idArray = msg.noticeId.split(',');
            var ids = [];
            for (var i = 0; i < idArray.length; i++) {
                ids.push(idArray[i]);
            }

            NoticeModel.update({
                _id: {
                    $in: ids
                }
            }, {
                $set: {
                    hasRead: 1
                }
            }, function(err, docs) {
                if (err) {
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    NoticeModel.count({
                        hasRead: 0,
                        userMobile: userMobile
                    }, function(err, count) {
                        if (err) {
                            next(null, ResponseUtil.resp(Code.DATABASE));
                        } else {
                            next(null, {
                                "code": 200,
                                "codetxt": "操作成功",
                                "count": count
                            });
                        }
                    });
                }
            });
        } else {
            next(null, {
                "code": 200,
                "codetxt": "操作成功",
                "msg": "没有ID，没有操作"
            });
        }
    }
};

Handler.prototype.getNoticeNotReadCount = function(msg, session, next) {
    var userMobile = session.uid;
    NoticeModel.count({
        hasRead: 0,
        userMobile: userMobile
    }, function(err, count) {
        if (err) console.log(err);
        else {
            NoticeModel.findOne({
                userMobile: userMobile,
                hasRead: 0
            }).sort({
                addTime: -1
            }).exec(function(err, lastNotice) {
                if (err) {
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    console.log("----------------------------------------------lastnotice::" + JSON.stringify(lastNotice));
                    if (!!lastNotice) {
                        var n = {};
                        var today = new Date();
                        var yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);
                        var addTime = lastNotice.addTime;
                        if (addTime.getFullYear() == today.getFullYear() && addTime.getMonth() == today.getMonth() && addTime.getDate() == today.getDate()) {
                            n.addTime = Moment(addTime).format('HH:mm');
                        } else {
                            if (addTime.getFullYear() == yesterday.getFullYear() && addTime.getMonth() == yesterday.getMonth() && addTime.getDate() == yesterday.getDate()) {
                                n.addTime = "昨天";
                            } else {
                                n.addTime = Moment(addTime).format('MM-DD HH:mm');
                            }
                        }
                        n.title = lastNotice.title;

                        var d = {};
                        d.notice = n;
                        d.count = count;
                        console.log(d);
                        next(null, ResponseUtil.resp(Code.OK, d));
                    } else {
                        next(null, ResponseUtil.resp(Code.OK));
                    }
                }
            });
        }
    });
};

/**
 * 获取子帐号
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getSubUserList = function(msg, session, next) {
    var parentUser = session.uid;
    UserModel.find({
        parentUser: parentUser
    }, function(err, subUsers) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, subUsers));
        }
    });
};

/**
 设置子账户
 */
Handler.prototype.setSubUser = function(msg, session, next) {
    var targetMobile = msg.targetMobile;
    var selfMobile = session.uid;
    UserModel.update({
        mobile: targetMobile
    }, {
        $set: {
            parentUser: selfMobile
        }
    }, function(err, docs) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK));
        }
    });
};

Handler.prototype.getLastTerminalStatus = function(msg, session, next) {
    var terminalId = msg.terminalId;
    console.log("terminalIdd:::" + terminalId);
    TSensorDataModel.findOne({
        terminalId: {
            $in: terminalId
        }
    }).sort({
        addTime: -1
    }).exec(function(err, sensorDatas) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            TerminalModel.findOne({
                _id: new Object(terminalId)
            }, function(err, terminal) {
                if (err) {
                    console.log(err);
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    var homeGridId = terminal.homeGridId;
                    UserEquipmentModel.count({
                        terminalId: terminalId,
                        status: '开',
                        e_type: {
                            $ne: '窗帘'
                        }
                    }, function(err, count) {
                        if (err) {
                            console.log(err);
                            next(null, ResponseUtil.resp(Code.DATABASE));
                        } else {
                            next(null, {
                                "code": 200,
                                "codetxt": "操作成功",
                                "count": count,
                                "data": sensorDatas,
                                "homeGridId": homeGridId
                            });
                        }
                    });
                }
            });

        }
    });
};

/**
 * 电视机状态反转
 * */
Handler.prototype.reverseTvStatus = function(msg, session, next) {
    var deviceId = msg.deviceId;
    UserEquipmentModel.findOne({
        _id: new Object(deviceId)
    }, function(err, tv) {
        if (err) {
            console.log(err);
            next(null, Code.DATABASE);
        } else {
            var s = tv.status;
            if (s == "开") {
                s = "关";
            } else {
                s = "开";
            }
            UserEquipmentModel.update({
                _id: new Object(deviceId)
            }, {
                $set: {
                    status: s
                }
            }, function(updateErr, tv) {
                if (updateErr) {
                    console.log(updateErr);
                    next(null, ResponseUtil.resp(Code.DATABASE));
                } else {
                    next(null, ResponseUtil.resp(Code.OK));
                }
            });
        }
    });
};

/******************************  在线统计  开始  ************************************/
Handler.prototype.getOnlineInfo = function(msg, session, next) {

};

/******************************  在线统计  结束  ************************************/


/******************************  物业方法  开始  ************************************/
/**
 * 获取账号快递信息
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.getCourierList = function(msg, session, next) {
    var userMobile = session.uid;
    CourierModel.find({
        userMobile: userMobile
    }).sort({
        time: -1
    }).exec(function(err, docs) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, docs));
        }
    });
};

Handler.prototype.addNewCourier = function(msg, session, next) {
    var self = this;
    var userMobile = msg.userMobile;
    var type = msg.type;
    var data = msg.data;

    /**
     * 新的快递收发
     * @type {{command: string, data: *}}
     */
    var param = {
        command: '8002',
        data: data
    };
    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: userMobile,
        sid: 'user-server-1'
    }]);
};

/**
 * 获取物业缴费记录列表
 */
Handler.prototype.getPayList = function(msg, session, next) {
    var userMobile = session.uid;
    PayModel.find({
        userMobile: userMobile
    }).sort({
        time: -1
    }).exec(function(err, docs) {
        if (err) {
            console.log(err);
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, docs));
        }
    });
};

/**
 * 增加新的家政服务请求
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.addNewHouseKeeping = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var note = msg.note;
    var age = msg.age;
    var sex = msg.sex;
    var type = msg.type;
    var address = msg.address;
    var name = msg.name;
    // var HouseKeepingEntity = new HouseKeepingModel({
    // 	note:note,
    // 	age:age,
    // 	type:type,
    // 	sex:sex,
    // 	address:address,
    // 	userMobile:userMobile,
    // 	name:name
    // });
    // HouseKeepingEntity.save(function(err) {
    // 	if(err) {
    // 		console.log(err);
    // 		next(null, Code.DATABASE);
    // 	} else {
    // 		next(null, Code.OK);
    // 	}
    // });

    var param = {
        type: "houseKeeping",
        note: note,
        age: age,
        sex: sex,
        address: address,
        userMobile: userMobile,
        name: name
    };
    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: 'estate',
        sid: 'user-server-1'
    }]);

    next(null, ResponseUtil.resp(Code.OK));
};

/**
 * 增加新的保修信息
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.addNewRepair = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var address = msg.address;
    var name = msg.name;
    var describ = msg.describ;
    // var RepairEntity = new RepairModel({
    // 	isSolve:0,
    // 	describ:describ,
    // 	address:address,
    // 	userMobile:userMobile,
    // 	name:name
    // });
    // RepairEntity.save(function(err) {
    // 	if(err) {
    // 		console.log(err);
    // 		next(null, Code.DATABASE);
    // 	} else {
    // 		next(null, Code.OK);
    // 	}
    // });

    var param = {
        type: "repair",
        isSolve: 0,
        describ: describ,
        address: address,
        userMobile: userMobile,
        name: name
    };
    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: 'estate',
        sid: 'user-server-1'
    }]);

    next(null, ResponseUtil.resp(Code.OK));
};

Handler.prototype.addNewComplaint = function(msg, session, next) {
    var self = this;
    var userMobile = session.uid;
    var address = msg.address;
    var name = msg.name;
    var describ = msg.describ;
    // var ComplaintEntity = new ComplaintModel({
    // 	isSolve:0,
    // 	describ:describ,
    // 	address:address,
    // 	userMobile:userMobile,
    // 	name:name
    // });
    // ComplaintEntity.save(function(err) {
    // 	if(err) {
    // 		console.log(err);
    // 		next(null, Code.DATABASE);
    // 	} else {
    // 		next(null, Code.OK);
    // 	}
    // });
    var param = {
        type: "complaint",
        isSolve: 0,
        describ: describ,
        address: address,
        userMobile: userMobile,
        name: name
    };
    self.app.get('channelService').pushMessageByUids('onMsg', param, [{
        uid: 'estate',
        sid: 'user-server-1'
    }]);

    next(null, ResponseUtil.resp(Code.OK));
};

/******************************  物业方法  结束  ************************************/


Handler.prototype.toSend = function(msg, session, next) {
    console.log("toSend...." + JSON.stringify(msg));
};

/******************************  临时测试  结束  ************************************/
Handler.prototype.controllerList = function(msg, session, next) {
    CenterBoxModel.find({}, function(err, docs) {
        if (err) {
            next(null, ResponseUtil.resp(Code.DATABASE));
        } else {
            next(null, ResponseUtil.resp(Code.OK, docs));
        }
    });
};

Handler.prototype.deleteCtrl = function(msg, session, next) {
    var serialno = msg.serialno;
    CenterBoxModel.remove({
        serialno: serialno
    }, function(err) {
        if (err) {
            console.log(err);
            cb(-1);
        } else {
            cb(0);
        }
    });
};

Handler.prototype.tvChannelList = function(msg, session, next) {
    var page = msg.page;
    if (!page) page = 1;
    var pageSize = msg.pageSize;
    if (!pageSize) pageSize = 15;
    var skip = pageSize * (page - 1);
    TvChannel.find({}).limit(pageSize).skip(skip).exec().then(function(channels) {
        next(null, ResponseUtil.resp(Code.OK, channels));
    }).catch(function(err) {
        console.log(err);
        next(null, ReponseUtil.resp(Code.DATABASE));
    });
};

/******************************  临时测试  结束  ************************************/
var TempModel  = require("../../../mongodb/TempModel");
Handler.prototype.testPush = function(msg, session, next) {
    var self = this;
    var type = msg.type;
    if(type === 9) {
        TempModel.update({}, {$set:{flag:false}});
    } else if(type === 1) {
        TempModel.update({}, {$set:{flag:true}});
        self.app.rpc.home.homeRemote.getLastSensorData(session, '583299f1d0220c5ca9bbc3d2', function(err, datas) {
            if (err) {
                next(null, ResponseUtil.resp(Code.DATABASE));
            } else {
                if(!!datas && datas.length > 0) {
                    var d = datas[0];
                    var result = {
                        command: '4000',
                        temperature: 40,
                        humidity: d.humidity,
                        pm25: d.pm25,
                        quality: d.quality,
                        centerBoxSerialno: '34ffdc054754353638812443',
                        addTime: new Date()
                    };
                    console.log('-------------------------------推送成功了----------------------------');
                    self.app.get('channelService').pushMessageByUids('onMsg', result, [{
                        uid: '18657312311',
                        sid: 'user-server-1'
                    }]);
                    next(null, ResponseUtil.resp(Code.OK));
                }
            }
        });
    } else {
        var param = {
            command: '9996',
            type:type
        };
        self.app.get('channelService').pushMessageByUids('onMsg', param, [{
            uid: '18657312311',
            sid: 'user-server-1'
        }]);
        next(null, ResponseUtil.resp(Code.OK));
    }
};