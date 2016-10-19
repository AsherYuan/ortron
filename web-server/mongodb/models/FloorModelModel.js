var mongoose = require('../mongoose.js');
var FloorModelScheme = new mongoose.Schema({
  floorUrl : {type:String },
  name : { type:String },
  hall : { type:Number, default:0},
  room : { type:Number, default:0},
  toilet : { type:Number, default:0 },
  kitchen : { type:Number, default:0 }
});
var FloorModelModel = mongoose.model("floorModel", FloorModelScheme);
module.exports = FloorModelModel;