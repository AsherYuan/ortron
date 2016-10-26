var mongoose = require('../mongoose.js');

var RinfraredSchema = new mongoose.Schema({
    typeID:String,
    inst:String,
    eLevel:String,
    infrared:String
});
var RinfraredModel = mongoose.model("rinfrared", RinfraredSchema, "rinfrared");
module.exports = RinfraredModel;
