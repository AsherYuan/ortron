var mongoose=require('../mongoose.js');

var housekeepingSchema=new mongoose.Schema({
	name:{type:String,default:''},
	userMobile:{type:String,default:''},
	address:{type:String,default:''},
	type:{type:String,default:''},
	sex:{type:String,default:0},
	age:{type:String,default:''},
	note:{type:String,default:''},
	time:{type:String,default:new Date().toLocaleString()}
});

var housekeepingModel = mongoose.model('housekeeping',housekeepingSchema);
module.exports=housekeepingModel;