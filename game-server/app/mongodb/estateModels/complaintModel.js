var mongoose=require('../mongoose.js');

var complaintScheam=new mongoose.Schema({
	name:{type:String,default:''},
	userMobile:{type:String,default:''},
	address:{type:String,default:''},
	time:{type:String,default:new Date().toLocaleString()},
	describ:{type:String,default:''},
	isSolve:{type:String,default:0}
});

var complaintModel = mongoose.model('complaint',complaintScheam);
module.exports=complaintModel;