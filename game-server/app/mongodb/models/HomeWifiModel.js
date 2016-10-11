var mongoose = require('../mongoose.js');

var HomeWifiSchema = new mongoose.Schema({
  ssid:String,
  passwd:String,
  usermobile:String,
  addTime:{ type:Date, default:Date.now }
});
var HomeWifiModel = mongoose.model("homeWifi", HomeWifiSchema);
module.exports = HomeWifiModel;