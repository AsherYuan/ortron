/**
 * User: AsherYuan
 * Date: 15-11-15
 * Time: 上午11:22
 */
var UserEquipmentModel = require('../mongodb/models/UserEquipmentModel');
var HomeModel = require('../mongodb/models/HomeModel');
var async = require("async");

var WordsPreparer = module.exports;

var keywords = {
    "模式":{
		'制冷':['制冷','冷空调','冷风','冷气'],
		'制热':['制热','热空调','热风','热气'],
		'通风':['通风','除湿'],
		'自动':['自动模式']
	},
    "风速":{
		'自动':['自动','通风','自然风'],
		'小风':['小风','弱风'],
		'中风':['中风','普通风'],
		'大风':['大风','强风']
	},
    "温度":{
		'1度':['1度','一度'],
		'2度':['2度','二度','两度'],
		'3度':['3度','三度'],
		'4度':['4度','四度'],
		'5度':['5度','五度'],
		'6度':['6度','六度'],
		'7度':['7度','七度'],
		'8度':['8度','八度'],
		'9度':['9度','九度'],
		'10度':['10度','十度'],
		'11度':['11度','十一度'],
		'12度':['12度','十二度'],
		'13度':['13度','十三度'],
		'14度':['14度','十四度'],
		'15度':['15度','十五度'],
		'16度':['16度','十六度'],
		'17度':['17度','十七度'],
		'18度':['18度','十八度'],
		'19度':['19度','十九度'],
		'20度':['20度','二十度'],
		'21度':['21度','二十一度'],
		'22度':['22度','二十二度'],
		'23度':['23度','二十三度'],
		'24度':['24度','二十四度'],
		'25度':['25度','二十五度'],
		'26度':['26度','二十六度'],
		'27度':['27度','二十七度'],
		'28度':['28度','二十八度'],
		'29度':['29度','二十九度'],
		'30度':['30度','三十度']
	},
    "开关":{
		'开':['开空调'],
		'关':['关空调']
	}
};

WordsPreparer.translateKeywords = function(input, userMobile, callback) {
	var isPatternFlag = false;
	// 判断是否完全是温度指令
	for(var k in keywords) {
		if(k === "温度") {
			var item = keywords[k];
			for(var kk in item) {
				var subItem = item[kk];
				for(var i=0;i<subItem.length;i++) {
					if(input === subItem[i]) {
						isPatternFlag = true;
					}
				}
			}
		}
	}
	// 判断是否包含模式和风速调整
	for(var k in keywords) {
		if(k === "温度") {
			continue;
		} else {
			var item = keywords[k];
			for(var kk in item) {
				var subItem = item[kk];
				for(var i=0;i<subItem.length;i++) {
					if(input.indexOf(subItem[i]) > -1) {
						isPatternFlag = true;
					}
				}
			}
		}
	}
	if(!isPatternFlag) {
		callback(input);
	} else {
		HomeModel.find({userMobile:userMobile}, function(err, homes) {
			if(err) {
				console.log(err);
				callback(input);
			} else {
				if(!!homes && homes.length > 0) {
					var homeIds = [];
					for(var i=0;i<homes.length;i++) {
						homeIds.push(homes[i]._id);
					}
					UserEquipmentModel.find({home_id:{$in:homeIds}, e_type:'空调'}, function(err, userEquipments) {
						if(err) {
							console.log(err);
							callback(input);
						} else {
							if(!!userEquipments && userEquipments.length === 1) {
								var device = userEquipments[0];
								var status = device.status;
								var model = device.ac_model;
								var wind = device.ac_windspeed;
								var temp = device.ac_temperature;

								if(wind === 0) {
									wind = "自动";
								} else if(wind === 1) {
									wind = "小风";
								} else if(wind === 2) {
									wind = "中风";
								} else if(wind === 3) {
									wind = "大风";
								}
								temp = temp + "度";

								var m_items = keywords["模式"];
								for(var m_k in m_items) {
									var m_subItems = m_items[m_k];
									for(var mi=0;mi<m_subItems.length;mi++) {
										if(input.indexOf(m_subItems[mi]) > -1) {
											model = m_k;
										}
									}
								}

								var w_items = keywords["风速"];
								for(var w_k in w_items) {
									var w_subItems = w_items[w_k];
									for(var wi=0;wi<w_subItems.length;wi++) {
										if(input.indexOf(w_subItems[wi]) > -1) {
											wind = w_k;
										}
									}
								}

								var t_items = keywords["温度"];
								for(var t_k in t_items) {
									var t_subItems = t_items[t_k];
									for(var ti=0;ti<t_subItems.length;ti++) {
										if(input.indexOf(t_subItems[ti]) > -1) {
											temp = t_k;
										}
									}
								}
								var s_items = keywords["开关"];
								for(var s_k in s_items) {
									var s_subItems = s_items[s_k];
									for(var si=0;si<s_subItems.length;si++) {
										if(input.indexOf(s_subItems[si]) > -1) {
											status = s_k;
										}
									}
								}

								var ret = '空调' + model + wind + temp;
								callback(ret);
							} else {
								callback(input);
							}
						}
					});
				} else {
					callback(input);
				}
			}
		});
	}
};
