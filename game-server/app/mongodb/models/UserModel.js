var mongoose = require('../mongoose.js');

var HomeLayerSchema = new mongoose.Schema({
    name : String,
    room : Number,
    hall : Number,
    toilet : Number,
    kitchen : Number,
    centerBoxSerialno : String
});

var HomeSchema = new mongoose.Schema({
    floorId : String,
    floorName : String,
    addTime : {type:Date, default:Date.now },
    userMobile : String,
    layers:[HomeLayerSchema]
});

var HomeWifiSchema = new mongoose.Schema({
    ssid:String,
    passwd:String,
    usermobile:String,
    addTime:{ type:Date, default:Date.now }
});

var CenterBoxSchema = new mongoose.Schema({
    userMobile : String,
    serialno : String,
    ssid : String,
    passwd : String,
    code : String,
    hasConnected:{type:Boolean, default:false},
    regTime : { type:Date, default:Date.now },
    lastLoginTime : { type:Date, default:Date.now },
    temperatureSwitch : String,
    humiditySwitch : String,
    qualitySwitch : String,
    coSwitch : String,
    pm25Switch : String,
    curIpAddress : String,
    curPort : Number
});

var UserScheme = new mongoose.Schema({
    mobile : {type:String},//手机号
    username : {type:String}, // 用户名
    password : {type:String}, // 密码
    regTime : { type:Date, default:Date.now }, //首次注册时间
    lastLoginTime : { type:Date, default:Date.now }, // 最后登录时间
    name:{type:String}, //真实姓名
    homeInfo : [HomeSchema],
    homeWifi: [HomeWifiSchema],
    centerBox : [CenterBoxSchema],
    city : {type:String, default:'嘉兴'},
    parentUser : String // 父帐号ID
});
var UserModel = mongoose.model("user", UserScheme);
module.exports = UserModel;