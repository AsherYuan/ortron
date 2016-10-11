var mongoose = require('../mongoose.js');

var SensorDataSchema = new mongoose.Schema({
  centerBoxId:String,
  temperature:Number,
  humidity:Number,
  co2:Number,
  pm25:Number,
  quality:Number,
  addTime:{type:Date, default:Date.now}
});
var SensorDataModel = mongoose.model("sensorData", SensorDataSchema);
module.exports = SensorDataModel;