var mongoose = require('../mongoose.js');

var RDeviceSchema = new mongoose.Schema({
    typeID:String,
    typeName:String,
    devType:String,
    brand:String
});
var RDeviceModel = mongoose.model("rdevice", RDeviceSchema, "rdevice");
module.exports = RDeviceModel;