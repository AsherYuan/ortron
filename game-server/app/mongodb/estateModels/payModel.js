var mongoose=require('../mongoose.js');

var paySchema=new mongoose.Schema({
	name:{type:String,default:''},
	userMobile:{type:String,default:''},
	time:{type:String,default:''},
	money:{type:String,default:''},
	isPay:{type:Number,default:0}
});

var payModel = mongoose.model('pay',paySchema);
module.exports=payModel;