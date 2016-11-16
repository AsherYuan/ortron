var express = require('express');
var app = express.createServer();
var UserVerifyModel = require("./mongodb/models/UserVerifyModel");
var UserModel = require('./mongodb/models/UserModel');
var FloorModel = require('./mongodb/models/FloorModel');
var FloorModelModel = require('./mongodb/models/FloorModelModel');
var rinfraredModel = require('./mongodb/models/rinfraredModel');
var NoticeModel = require('./mongodb/models/NoticeModel');
var Moment = require('moment');
var StringUtil = require('./mongodb/StringUtil.js');
var SensorDataModel = require('./mongodb/models/SensorDataModel');
var TSensorDataModel = require('./mongodb/models/TSensorDataModel');
var TvChannelModel = require('./mongodb/models/TvChannelModel');

app.configure(function () {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/public');
	app.set('view options', {layout: false});
	app.set('basepath', __dirname + '/public');
});

app.post('/sendVerify', function (req, res) {
	var userMobile = req.body.userMobile;
	var token = Math.random() * 1000000;
	token = parseInt(token);
	if (token < 100000) {
		token = token + 100000;
	} else if (token > 999999) {
		token = token - 100000;
	}

	UserVerifyModel.update({userMobile: userMobile}, {
		verify: token,
		verifyTime: Date.now()
	}, {upsert: true}, function (err) {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + token + "}");
		}
	});
});

app.post('/register', function (req, res) {
	var userMobile = req.body.userMobile;
	var password = req.body.password;
	var verifyCode = req.body.verifyCode;

	UserVerifyModel.findOne({userMobile: userMobile}, function (err, verify) {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
			if (userMobile === undefined || userMobile === "") {
				res.send("{\"code\":2001, \"codetxt\":\"手机号码不能为空\"}");
			} else if (password === undefined || password === "") {
				res.send("{\"code\":2002, \"codetxt\":\"密码不能为空\"}");
			} else if (!checkPhone(userMobile)) {
				res.send("{\"code\":2006, \"codetxt\":\"手机号码格式不正确\"}");
			} else {
				UserModel.find({'mobile': userMobile}, function (err, docs) {
					if (err) {
						res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
					} else {
						if (docs.length === 0) {
							var UserEntity = new UserModel({
								mobile: userMobile,
								username: userMobile,
								password: password
							});
							UserEntity.save(function (err, docs) {
								if (err) {
									res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
								} else {
									res.send("{\"code\":200, \"codetxt\":\"操作成功\"}");
								}
							});
						} else {
							res.send("{\"code\":2008, \"codetxt\":\"该手机号码已经在使用中了\"}");
						}
					}
				});
			}
		}
	});
});

/**
 * 获取区域列表
 */
app.post('/getAreaList', function (req, res) {
	var areaList = [
		"中心城区","南湖新区","秀洲新区","城西区","城北区","西南区","国际商务区","城南区","湘家荡度假区","五县"
	];
	res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(areaList) + "}");
});

/**
 * 根据区域获取小区列表
 * @param msg
 * @param session
 * @param next
 */
app.post('/getFloorList', function (req, res) {
	var area = req.body.area;
	var page = req.body.page;
	var pageSize = req.body.pageSize;
	if(!page) {
		page = 1;
	}
	if(!pageSize) {
		pageSize = 10;
	} else {
		pageSize = parseInt(pageSize);
	}
	var skip = pageSize * (page - 1);
	FloorModel.find({area:area}).skip(skip).limit(pageSize).exec().then(function(floors) {
		res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(floors) + "}");
	}).catch(function(err) {
		res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
	});
});

/**
 * 根据小区获取户型列表
 * @param msg
 * @param session
 * @param next
 */
app.post('/getFloorModelList', function (req, res) {
	var floorUrl = req.body.floorUrl;
	var page = req.body.page;
	var pageSize = req.body.pageSize;
	if(!page) {
		page = 1;
	}
	if(!pageSize) {
		pageSize = 10;
	} else {
		pageSize = parseInt(pageSize);
	}
	var skip = pageSize * (page - 1);
	FloorModelModel.find({floorUrl:floorUrl}).skip(skip).limit(pageSize).exec().then(function(floorModels) {
		res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(floorModels) + "}");
	}).catch(function(err) {
		res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
	});
});

app.get('/ircode', function (req, res) {
	var typeID = req.query.typeID;
	var inst = req.query.inst;
	var page = req.query.page;
	var pageSize = req.query.pageSize;
	if(!page) {
		page = 1;
	}
	if(!pageSize) {
		pageSize = 10;
	} else {
		pageSize = parseInt(pageSize);
	}
	var skip = pageSize * (page - 1);
	if(!!typeID) {
		var param = {typeID:typeID, inst:inst};
		if(!inst) {
			param = {typeID:typeID};
		}
		console.log(param);
		rinfraredModel.find(param).skip(skip).limit(pageSize).exec().then(function(list) {
			res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(list) + "}");
		}).catch(function(err) {
			res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
		});
	} else {
		res.send("{\"code\":102, \"codetxt\":\"typeID不能为空\"}");
	}
});

/** 获取电视台列表 **/
app.get('/getChannelList', function (req, res) {
	TvChannelModel.find({}, function(err, channels) {
		if(err) {
			console.log(err);
			res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
		} else {
			res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(channels) + "}");
		}
	});
});

app.post("/setChannelAlias", function(req, res) {
	var cid = req.body.cid;
	var alias = req.body.alias;
	if(!!cid && !!alias) {
		TvChannelModel.update({_id:new Object(cid)}, {$set:{alias:alias}}, function(err, updateInfo) {
			if(err) {
				res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
			} else {
				res.send("{\"code\":200, \"codetxt\":\"操作成功\"}");
			}
		});
	} else {
		res.send("{\"code\":200, \"codetxt\":\"操作成功\"}");
	}
});

/****************************************** 消息相关接口 开始 ************************************************/
/** 消息通知 **/
app.get('/getNoticeList', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var page = req.query.page;
	if (page === undefined || page < 1) {
		page = 1;
	}
	var pageSize = req.query.pageSize;
	if (pageSize === undefined || pageSize < 1) {
		pageSize = 10;
	}
	var userMobile = req.query.userMobile;

	var skip = pageSize * (page - 1);
	NoticeModel.find({userMobile: userMobile}).select('userMobile addTime hasRead title content noticeType summary')
		.sort({addTime: -1}).skip(skip).limit(pageSize).exec(function (err, notices) {
		if (err) {
			console.log(err);
			res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
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
			res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(news) + "}");
		}
	});
});

/**
 消息详情
 **/
app.get('/getNoticeDetail', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var id = req.query.noticeId;
	var userMobile = req.query.userMobile;
	NoticeModel.findOne({_id: new Object(id)}, function (err, notice) {
		if (err) {
			console.log(err);
			res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
		} else {
			// 设置为已读
			NoticeModel.update({_id: id}, {$set: {hasRead: 1}}, function (err, docs) {
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
			NoticeModel.count({hasRead: 0, userMobile: userMobile}, function (err, count) {
				if (err) {
					console.log(err);
					res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
				} else {
					res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"count\":" + count + ", \"data\":" + JSON.stringify(n) + "}");
				}
			});
		}
	});
});

/**
 * 删除消息
 */
app.get('/deleteNotice', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var userMobile = req.query.userMobile;
	var noticeId = req.query.noticeId;
	if (!!noticeId) {
		var idArray = noticeId.split(',');
		var ids = [];
		for (var i = 0; i < idArray.length; i++) {
			ids.push(idArray[i]);
		}

		NoticeModel.remove({_id: {$in: ids}}, function (err, docs) {
			if (err) {
				res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
			} else {
				NoticeModel.count({hasRead: 0, userMobile: userMobile}, function (err, count) {
					if (err) {
						console.log(err);
						res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
					} else {
						res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"count\":" + count + "}");
					}
				});
			}
		});
	}
});

/**
 设置消息为已读
 **/
app.get('/setNoticeRead', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var userMobile = req.query.userMobile;
	var all = req.query.all;
	var noticeId = req.query.noticeId;
	if(!!all && (all == "1" || all == "all")) {
		NoticeModel.update({userMobile:userMobile}, {$set: {hasRead:1}},  { multi: true }, function(err) {
			if(err) {
				console.log(err);
				res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
			} else {
				res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"all\":1}");
			}
		});
	} else {
		if (!!noticeId) {
			var idArray = noticeId.split(',');
			var ids = [];
			for (var i = 0; i < idArray.length; i++) {
				ids.push(idArray[i]);
			}

			NoticeModel.update({_id: {$in: ids}}, {$set: {hasRead: 1}}, function (err, docs) {
				if (err) {
					console.log(err);
					res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
				} else {
					NoticeModel.count({hasRead: 0, userMobile: userMobile}, function (err, count) {
						if (err) {
							res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
						} else {
							res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"count\":" + count + "}");
						}
					});
				}
			});
		} else {
			res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"msg\":\"没有ID，没有操作\"}");
		}
	}
});

app.get('/getNoticeNotReadCount', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var userMobile = req.query.userMobile;
	NoticeModel.count({hasRead: 0, userMobile: userMobile}, function (err, count) {
		if (err) {
			console.log(err);
			res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
		} else {
			NoticeModel.findOne({userMobile: userMobile, hasRead:0}).sort({addTime: -1}).exec(function (err, lastNotice) {
				if(err) {
					console.log(err);
					res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
				} else {
					if(!!lastNotice) {
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
						res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(d) + "}");
					} else {
						res.send("{\"code\":200, \"codetxt\":\"操作成功\"}");
					}
				}
			});
		}
	});
});
/****************************************** 消息相关接口 结束 ************************************************/





/****************************************** 传感器温度曲线 开始 ************************************************/
app.get('/getSensorDataHistory', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var centerBoxId = req.query.centerBoxId;
	SensorDataModel.find({centerBoxId:centerBoxId}).limit(200).sort({addTime:-1}).exec().then(function(data) {
		res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(data) + "}");
	}).catch(function(err) {
		res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
	});
});

app.get('/getTSensorDataHistory', function (req, res) {
	res.set("Access-Control-Allow-Origin", "*");
	var terminalId = req.query.terminalId;
	TSensorDataModel.find({terminalId:terminalId}).limit(200).sort({addTime:-1}).exec().then(function(data) {
		res.send("{\"code\":200, \"codetxt\":\"操作成功\", \"data\":" + JSON.stringify(data) + "}");
	}).catch(function(err) {
		res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
	});
});
/****************************************** 传感器温度曲线 结束 ************************************************/






app.configure('development', function () {
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function () {
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public', {maxAge: oneYear}));
	app.use(express.errorHandler());
});

console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");

app.listen(3001);


var checkPhone = function(phone) {
	console.log(/^1[3|4|5|7|8]\d{9}$/.test(phone));
	if(!(/^1[3|4|5|7|8]\d{9}$/.test(phone))){
		return false;
	}
	return true;
};
