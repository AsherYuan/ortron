var mongoose = require('../mongoose.js');

var WaitingUserChoiseSchema = new mongoose.Schema({
    loccode:String,
    runtimeinfo_id:String,
    optionList:Array,
    userMobile:String,
    addTime:{type:Date, default:Date.now},
    answered:{type:Boolean, default:false}
});
var WaitingUserChoiseModel = mongoose.model("waitingUserChoise", WaitingUserChoiseSchema);
module.exports = WaitingUserChoiseModel;
