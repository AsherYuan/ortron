var mongoose=require('../mongoose.js');

var accountSchema=new mongoose.Schema({
	username:String,
	password:String,
	floorId:String,
	floor:{type:String, ref:"floor"}
});

var accountModel = mongoose.model('account', accountSchema);
module.exports=accountModel;
