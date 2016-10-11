var mongoose=require('../mongoose.js');

var WeaSchema=new mongoose.Schema({
    area:{type:String,default:'嘉兴'},
    time:{type:Date,default:Date.now},
    temperature:{type:String,default:''},
    humidity:{type:String,default:''},
    pm:{type:Number,default:0}
});

var WeatherModel = mongoose.model('weather',WeaSchema);
module.exports=WeatherModel;