var mongoose = require('../mongoose.js');
var FloorScheme = new mongoose.Schema({
    url : {type:String}, //访问地址
    name : { type:String },//设备序列号
    area : {type:String}, // 编码
    busiCircle : { type:String }, //首次注册时间
    address : { type:String } // 最后登录时间
});
var FloorModel = mongoose.model("floor", FloorScheme);
module.exports = FloorModel;