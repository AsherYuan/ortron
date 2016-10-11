var mongoose = require('../mongoose.js');

var TerminalSchema = new mongoose.Schema({
  centerBoxSerialno:String,
  homeGridId:String,
  code:String,
  type:String,
  regTime : { type:Date, default:Date.now }
});

var HomeGridScheme = new mongoose.Schema({
  homeId : String,
  gridType : String,
  layerName : String,
  terminal:{type:String, ref:"terminal"},
  terminalId:String,
  dorder : Number,
  name : String
});
var HomeGridModel = mongoose.model("homeGrid", HomeGridScheme);
module.exports = HomeGridModel;