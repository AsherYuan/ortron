var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var SensorDataModel = require('../../../mongodb/models/SensorDataModel');
var TerminalModel = require('../../../mongodb/models/TerminalModel');
var TSensorDataModel = require('../../../mongodb/models/TSensorDataModel');
var UserModel = require('../../../mongodb/models/UserModel');
var async = require("async");
var logger = require('pomelo-logger').getLogger('pomelo',  __filename);


module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message-
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	console.log("################msg" + JSON.stringify(msg));
	var self = this;
	var rid = 'otron'; // 暂时全部统一m
	var uid = msg.uid + "*" + rid;
	var sessionService = self.app.get('sessionService');
	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', function() {
		console.log('session closed');
	});

	console.log("self.app.get('serverId'):" + self.app.get('serverId'));

	// 如果不是TcpServer来的，放入allPushChannel频道里
	if(uid !== 'socketServer*otron') {
		var channelName = 'allPushChannel';
		var channel = self.app.get('channelService').getChannel(channelName, true);
		//把用户添加到channel 里面
		if (!!channel) {
			channel.add(uid, self.app.get('serverId'));
		}
	}
};

/**
 * 接受到主控发送的消息，并进行处理和消息推送
 * @param  {[type]}   msg     [description]
 * @param  {[type]}   session [description]
 * @param  {Function} next    [description]
 * @return {[type]}           [description]
 */
Handler.prototype.socketMsg = function(msg, session, next) {
	var self = this;
    var serialno = msg.serialno;
    var command = msg.command;
    var code = msg.code;
    var terminalCode = msg.terminalCode;
    var ipAddress = msg.ipAddress;
    var port = msg.port;
    var data = msg.data;

    var param = {
        serailno:serialno,
        command:command,
        code:code,
        terminalCode:terminalCode,
        ipAddress:ipAddress,
        port:port,
        data:data
    };

    logger.info("接收到主控信息:command___" + command + ":serailno___" + serailno + ":code___" + code + ":termianlCode___" + terminalCode + ":ipAddress___" + ipAddress + ":port___" + port + ":" + new Date());

    async.waterfall([
        /** 第一步, 接收到主控的消息，获取主控的相关数据 **/
        function(callback) {
            self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, serialno, function(err, centerBox) {
                if(err) {
                    callback(err);
                } else {
                    callback(null, centerBox, param);
                }
            });
        },
        function(centerBox, param, callback) {
            var result = {
                userMobile:centerBox.userMobile
            };
            if(param.command === '1000') {
                result = {
                    command: '1000',
                    msg: '控制器上线, 串号:' + param.serialno,
                    serialno : param.serialno
                };
                callback(null, result);
            } else if (param.command === '999') {
                result = {
                    command: '999',
                    msg: '控制器下线, 串号:' + param.serialno,
                    serialno: param.serialno
                };
                callback(null, result);
            } else if (param.command === '998') {
                result = {
                    command:'998',
                    centerBoxSerialno : param.serialno,
                    terminalCode : param.terminalCode,
                    msg: '终端下线, 终端编码:' + param.terminalCode
                };
                callback(null, result);
            } else if(param.command === '1001') {
                result = {
                    command:'1001',
                    terminalCode:param.terminalCode,
                    centerBoxSerialno:param.serialno,
                    msg: '终端上线, 终端编码:' + param.terminalCode
                };
                callback(null, result);
            } else if(param.command == '2000') {
                result = {
                    command:'2000',
                    ipAddress: param.ipAddress,
                    port : param.port,
                    data:param.data
                };
                callback(null, result);
            } else if(param.command == '2001') {
                result = {
                    command:'2001',
                    ipAddress: param.ipAddress,
                    port : param.port,
                    data: param.data
                };
                callback(null, result);
            } else if(param.command == '2002') {
                result = {
                    command:'2002',
                    ipAddress: param.ipAddress,
                    port : param.port,
                    data:param.data
                };
                callback(null, result);
            } else if(param.command == '2005') {
                var tCode = param.data.substring(0, 2);
                var humidity = parseInt(param.data.substring(6, 8), 16);
                var temperature = parseInt(param.data.substring(8, 10), 16);

                self.app.rpc.home.homeRemote.getTerminaListByCenterBoxAndCode(session, param.serialno, tCode, function(err, terminals) {
                    if(err) {
                        callback(err);
                    } else {
                        if(!! terminals && terminals.length > 0) {
                            var terminal = terminals[0];
                            self.app.rpc.home.homeRemote.saveTSensorData(session, terminal._id, temperature, humidity, function(err) {
                                if(err) {
                                    callback(err);
                                } else {
                                    result = {
                                        command:'2005',
                                        terminalCode:tCode,
                                        humidity:humidity,
                                        temperature:temperature,
                                        centerBoxSerialno:param.serialno,
                                        addTime:new Date(),
                                        terminalId:terminal._id,
                                        homeGridId:terminal.homeGridId
                                    };
                                }
                            });
                        }
                    }
                });
            } else if(param.command == '3000') {
                result = {
                    command:'3000',
                    ipAddress: param.ipAddress,
                    port : param.port,
                    data:param.data
                };
            } else if(param.command == '3007') {
                result = {
                    command: '3007',
                    ipAddress: param.ipAddress,
                    port: param.port,
                    data: param.data
                };
            } else if(param.command == '7001') {
                result = {
                    command:'7001',
                    data: param.data
                };
            } else if(param.command == '4000') {
                var centerBoxSensorData = param.data;
                var temp = centerBoxSensorData.substring(2, 4) + centerBoxSensorData.substring(0, 2);
                temp = parseInt(temp, 16) / 10;
                var wet = centerBoxSensorData.substring(6, 8) + sencenterBoxSensorDatasorData.substring(4, 6);
                wet = parseInt(wet, 16) / 10;
                var co = centerBoxSensorData.substring(10, 12) + centerBoxSensorData.substring(8, 10);
                co = parseInt(co, 16);
                var pm25 = centerBoxSensorData.substring(14, 16) + centerBoxSensorData.substring(12, 14);
                pm25 = parseInt(pm25, 16);
                var quality = centerBoxSensorData.substring(18, 20) + centerBoxSensorData.substring(16, 18);
                quality = parseInt(quality, 16);
                result = {
                    command:'4000',
                    data:param.data,
                    temperature:temp,
                    humidity:wet,
                    co:co,
                    pm25:0,
                    quality:quality,
                    centerBoxSerialno:param.serialno,
                    addTime:new Date()
                };

                self.app.rpc.home.homeRemote.getCenterBoxBySerailno(session, param.serialno, function(err, centerBox) {
                    if(err) {
                        callback(err);
                    } else {
                        self.app.rpc.home.homeRemote.saveSensorData(session, centerBox._id, result.temperature, result.humidity, result.co, result.quality, result.pm25, function(err) {
                            if(err) {
                                callback(err);
                            }
                        });
                    }
                });
            }


            callback(null, result);
        },

        function(result, callback) {
            logger.debug("#############推送消息############" + result.userMobile + "\n" + JSON.stringify(result));
            self.app.get('channelService').pushMessageByUids('onMsg', result, [{
                uid: result.userMobile,
                sid: 'user-server-1'
            }]);
        }
    ], function(err, result) {
        next(null, ResponseUtil.resp(Code.DATABASE));
    });
};


Handler.prototype.webMsg = function(msg, session, next) {
	var self = this;

	var command = msg.command;
	var port = msg.port;
	var param = {
		msg: ''
	};
	if(command == '2000') {
		param = {
			command: '2000',
			ipAddress: msg.ipAddress,
			port:port
		};
	} else if (command == '2001') {
		param = {
			command: '2001',
			ipAddress: msg.ipAddress,
			port:port
		};
	} else if(command == '2002') {
		param = {
			command: '2002',
			ipAddress: msg.ipAddress,
			data: msg.terminalCode,
			port:port
		};
	} else if(command == '2005') {
		param = {
			command: '2005',
			ipAddress: msg.ipAddress,
			data: msg.terminalCode,
			port:port
		};
	} else if(command == '3000') {
		var terminalCode = msg.terminalCode;

		var suffix1 = ' 36 FF 00 8A 22 A2 A2 A2 28 A2 88 88 88 A2 AA AA 22 2A 22 2A 88 80 1F E0 11 44 54 54 54 45 14 51 11 11 14 55 55 44 45 44 45 51 10 00 00'; // 18度
						// 36 FF 00 8A 22 A2 A2 A2 28 8A 88 88 8A 22 AA 88 A2 AA A2 88 88 80 1F E0 11 44 54 54 54 45 11 51 11 11 44 55 51 14 55 54 51 11 10
		var suffix2 = ' 36 FF 00 8A 22 A2 A2 A2 28 AA 22 22 22 22 AA A2 A2 A8 A2 28 88 80 1F E0 11 44 54 54 54 45 15 44 44 44 44 55 54 54 55 14 45 11 10 00 00'; // 24度
		var data = terminalCode + suffix1;
		param = {
			command: '3000',
			ipAddress: msg.ipAddress,
			data: data,
			port:port
		};
	} else if(command == '3007') {
		var jCode = msg.terminalCode;
		var jData = jCode + '01FFFF';
		param = {
			command: '3007',
			ipAddress: msg.ipAddress,
			data: jData,
			port:port
		};
	}

	console.log('向OTS发送请求：：' + JSON.stringify(param));
	console.log(self.app.get('serverId'));

	self.app.get('channelService').pushMessageByUids('onMsg', param, [{
		uid: 'socketServer*otron',
		sid: 'connector-server-1'
	}]);
};

Handler.prototype.controllerList = function(msg, session, next) {
	var self = this;
	CenterBoxModel.getList(function(err, docs) {
		if(err) {
			next(err);
		} else {
			next(null, docs);
		}
	});
};

Handler.prototype.deleteController = function(msg, session, next) {
	var self = this;

	var serialno = msg.serialno;
	CenterBoxModel.delteCtrl(serialno, function(flag) {
		next(null, {flag:flag});
	});
};

Handler.prototype.monitorhooker = function(msg, session, next) {
	next(null, Code.OK);
};
