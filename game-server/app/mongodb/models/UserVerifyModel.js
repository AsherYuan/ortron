var mongoose = require('../mongoose.js');

var UserVerifySchema = new mongoose.Schema({
	userMobile:String,
	verify:String,
	verifyTime:{type:Date, default:Date.now()}
});
var UserVerifyModel = mongoose.model("userVerify", UserVerifySchema);
module.exports = UserVerifyModel;