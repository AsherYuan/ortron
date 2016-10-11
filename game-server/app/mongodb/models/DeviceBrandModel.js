var mongoose = require('../mongoose.js');

var DeviceBrandSchema = new mongoose.Schema({
  type:String,
  name:String
});
var DeviceBrandModel = mongoose.model("deviceBrand", DeviceBrandSchema);
module.exports = DeviceBrandModel;