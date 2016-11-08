var mongoose = require('../mongoose.js');
var TSensorDataSchema = new mongoose.Schema({
    terminalId:String,
    temperature:Number,
    humidity:Number,
    addTime:{type:Date, default:Date.now}
});
var TSensorDataModel = mongoose.model("tSensorData", TSensorDataSchema);
module.exports = TSensorDataModel;