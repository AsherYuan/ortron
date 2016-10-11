var mongoose = require('../mongoose.js');

var UserEquipmentSchema = new mongoose.Schema({
    e_name:String,
    terminalId:String,
    home_id:String,
    layerName:String,
    homeGridId:{type:String, ref:"homeGrid"},
    e_type:String,
    pingpai:String,
    typeName:String,
    status:String,
    ac_model:String,
    ac_windspeed:Number,
    ac_temperature:Number,
    addTime:{type:Date, default:Date.now},
    tv_ismute:String

});
var UserEquipmentModel = mongoose.model("userEquipment", UserEquipmentSchema, "userEquipment");
module.exports = UserEquipmentModel;