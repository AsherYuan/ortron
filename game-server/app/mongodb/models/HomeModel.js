var mongoose = require('../mongoose.js');

var HomeLayerSchema = new mongoose.Schema({
  name : String,
  room : Number,
  hall : Number,
  toilet : Number,
  kitchen : Number,
  centerBoxSerialno : String
});

var HomeSchema = new mongoose.Schema({
  floorId : String,
  floorName : String,
  addTime : {type:Date, default:Date.now },
  userMobile : String,
  layers:[HomeLayerSchema]
});
var HomeModel = mongoose.model("home", HomeSchema);
module.exports = HomeModel;