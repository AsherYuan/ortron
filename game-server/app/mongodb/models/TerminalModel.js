var mongoose = require('../mongoose.js');
var TerminalSchema = new mongoose.Schema({
    centerBoxSerialno:String,
    homeGridId:String,
    code:String,
    type:String,
    ssid:String,
    passwd:String,
    regTime : { type:Date, default:Date.now },
    isOnline : {type:Boolean, default:false},
    lastSensorDataTime : { type:Date, default:Date.now }
});
var TerminalModel = mongoose.model("terminal", TerminalSchema);
module.exports = TerminalModel;
