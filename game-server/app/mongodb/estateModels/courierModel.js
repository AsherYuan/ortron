var mongoose=require('../mongoose.js');

var courierSchema=new mongoose.Schema({
	name:{type:String,default:''},
	userMobile:{type:String,default:''},
	sendOrReceiver:{type:Number,default:''},
	time:{type:String,default:new Date().toLocaleString()},
	address:{type:String,default:''},
	courierCompany:{type:String,default:''},
	isSendOrReceiver:{type:Number,default:0}
});

var courierModel = mongoose.model('courier',courierSchema);
module.exports=courierModel;