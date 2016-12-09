/**
 * User: AsherYuan
 * Date: 15-11-15
 * Time: 上午11:22
 */
var TvChannelModel = require("../mongodb/tv/TvChannelModel");
var SayingUtil = module.exports;

// 准备电视机的返回
SayingUtil.translateTv = function(result, cb) {
    var channel = "";
    if(!!result.orderAndInfrared) {
        for(var i=0;i<result.orderAndInfrared.length;i++) {
            var order = result.orderAndInfrared[i].order;
            var c_tv = order.c_tv;
            if(c_tv.num) {
                channel += c_tv.num;
            }
        }
        TvChannelModel.findOne({channelNum:parseInt(channel)}, function(err, c) {
            if(err || (!c)) {
                console.log(err);
                cb(result.inputstr.replace("我要看", "切换到") + "," + channel + "频道");
            } else {
                var x = result.inputstr.replace("我要看", "");
                if(x === c.channel) {
                    cb(result.inputstr.replace("我要看", "切换到") + "," + channel + "频道");
                } else {
                    cb(result.inputstr.replace("我要看", "切换到") + "," + c.channel + "," + channel + "频道");
                }
            }
        });
    } else {
        cb(result.inputstr.replace("我要看", "切换到"));
    }
};

// 根据状态调整返回给用户的语句
SayingUtil.translateStatus = function(orderAndInfrared) {
    var equipment = orderAndInfrared.order.ueq;
    var inst = orderAndInfrared.infrared.inst;
    var ret ="";
    if(!!equipment) {
        ret = "把";
        if((!!equipment.e_name) && equipment.e_name.length > 0) {
            ret += equipment.e_name;
        } else {
            ret += equipment.pingpai + equipment.e_type;
        }

        if(equipment.status == "关") {
            if(equipment.e_type == "空调") {
                ret += "关闭电源";
            } else if(equipment.e_type == "电灯") {
                ret += "关闭电源";
            } else if(equipment.e_type == "窗帘") {
                ret += "关上";
            } else if(equipment.e_type == "电视") {
                ret += "关闭电源";
            }
        } else {
            if(equipment.e_type == "空调") {
                ret += "打开,并设置为" + equipment.ac_model + ",";
                if(equipment.ac_windspeed === 0) {
                    ret += "自然风,";
                } else if(equipment.ac_windspeed == 1) {
                    ret += "小风,";
                } else if(equipment.ac_windspeed == 2) {
                    ret += "中风,";
                } else if(equipment.ac_windspeed == 3) {
                    ret += "大风,";
                }
                ret += equipment.ac_temperature + "度";
            } else if(equipment.e_type == "电视") {
                if(inst === "T_V+") {
                    ret += "调大音量";
                } else if(inst === "T_V-") {
                    ret += "减小音量";
                } else if(inst === "T_P-") {
                    ret += "切换到上一个频道";
                } else if(inst === "T_P+") {
                    ret += "切换到下一个频道";
                } else if(inst === "T_ONOFF") {
                    ret += "打开";
                } else if(inst === "T_MUTE") {
                    if(equipment.is_mute === "1") {
                        ret += "设置为静音";
                    } else {
                        ret += "取消静音";
                    }
                }
            } else if(equipment.e_type == "电灯") {
                ret += "打开";
            } else if(equipment.e_type == "窗帘") {
                ret += "打开";
            }
        }
    } else {
        ret = "没有任何操作";
    }

    return ret;
};
