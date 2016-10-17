var express = require('express');
var app = express.createServer();
var UserVerifyModel = require("./mongodb/models/UserVerifyModel");
var UserModel = require('./mongodb/models/UserModel');

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
			// if (!!verify) {
			// 	if (verifyCode === verify.verify) {
			// 		if (userMobile === undefined || userMobile === "") {
			// 			res.send("{\"code\":2001, \"codetxt\":\"手机号码不能为空\"}");
			// 		} else if (password === undefined || password === "") {
			// 			res.send("{\"code\":2002, \"codetxt\":\"密码不能为空\"}");
			// 		} else if (!checkPhone(userMobile)) {
			// 			res.send("{\"code\":2006, \"codetxt\":\"手机号码格式不正确\"}");
			// 		} else {
			// 			UserModel.find({
			// 				$or: [{
			// 					'mobile': userMobile
			// 				}, {
			// 					'username': username
			// 				}]
			// 			}, function (err, docs) {
			// 				if (err) {
			// 					res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
			// 				} else {
			// 					if (docs.length === 0) {
			// 						var UserEntity = new UserModel({
			// 							mobile: userMobile,
			// 							username: userMobile,
			// 							password: password
			// 						});
			// 						UserEntity.save(function (err, docs) {
			// 							if (err) {
			// 								res.send("{\"code\":101, \"codetxt\":\"数据库错误\"}");
			// 							} else {
			// 								res.send("{\"code\":200, \"codetxt\":\"操作成功\"}");
			// 							}
			// 						});
			// 					} else {
			// 						res.send("{\"code\":200, \"codetxt\":\"操作成功\"}");
			// 					}
			// 				}
			// 			});
			// 		}
			// 	} else {
			// 		res.send("{\"code\":2007, \"codetxt\":\"验证码错误\"}");
			// 	}
			// } else {
			// 	res.send("{\"code\":2007, \"codetxt:\"验证码不能为空\"}");
			// }
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
