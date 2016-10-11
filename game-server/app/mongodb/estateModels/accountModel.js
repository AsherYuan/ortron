var mongoose=require('../mongoose.js');

var accountSchema=new mongoose.Schema({
	username:{type:String,default:''},
	password:{type:String,default:''},
	floorId:{type:String, ref:"floor"}
});

var accountModel = mongoose.model('account', accountSchema);
module.exports=accountModel;
