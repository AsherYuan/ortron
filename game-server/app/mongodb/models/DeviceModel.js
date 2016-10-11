var mongoose = require('../mongoose.js');

var DeviceStatusSchema = new mongoose.Schema({
  power:Number,
  temperature:Number,
  wind:Number,
  mode:Number,
  channel:Number,
  volume:Number
});

var DeviceSchema = new mongoose.Schema({
  homeId:mongoose.Schema.Types.ObjectId,
  layerName:String,
  terminalId:String,
  homeGridId:String,
  type:String,
  brand:String,
  series:String,
  addTime:{type:Date, default:Date.now},
  name:String,
  status:DeviceStatusSchema
});
var DeviceModel = mongoose.model("device", DeviceSchema);
module.exports = DeviceModel;