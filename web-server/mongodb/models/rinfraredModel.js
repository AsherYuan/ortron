var mongoose = require('../mongoose.js');
var rinfraredSchema = new mongoose.Schema({
	typeID : {type:String},
	inst : { type:String },
	eLevel : {type:String}
});
var rinfraredModel = mongoose.model("rinfrared", rinfraredSchema, "rinfrared");
module.exports = rinfraredModel;