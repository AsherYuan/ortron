/**
 * Created with JetBrains WebStorm.
 * User: AsherYuan
 * Date: 14-1-2
 * Time: 上午11:22
 */

var SayingUtil = module.exports;

// 根据状态调整返回给用户的语句
SayingUtil.translateStatus = function(equipment) {
    var ret ="";
    if(!!equipment) {
        ret = "把";
        if((!!equipment.e_name) && equipment.e_name.length > 0) {
            ret += equipment.e_name;
        } else {
            ret += equipment.pingpai + equipment.e_type;
        }

        if(equipment.status == "关") {
            ret = "关闭电源";
        } else {
            if(equipment.e_type == "空调") {
                ret += "打开,并设置为" + equipment.ac_model + ",";
                if(equipment.ac_windspeed == 0) {
                    ret += "自动,";
                } else if(equipment.ac_windspeed == 1) {
                    ret += "小风,";
                } else if(equipment.ac_windspeed == 2) {
                    ret += "中风,";
                } else if(equipment.ac_windspeed == 3) {
                    ret += "大风,";
                }
                ret += equipment.ac_temperature + "度";
            } else if(equipment.e_type == "电视") {
                ret += "打开";
            } else if(equipment.e_type == "电灯") {
                ret = "打开";
            } else if(equipment.e_type == "窗帘") {
                ret = "打开";
            }
        }
    } else {
        ret = "没有任何操作";
    }

    return ret;
};

