var mongoose = require('../mongoose.js');

var NoticeScheme = new mongoose.Schema({
	userMobile:String,
	addTime:{type:Date, default:Date.now},
	hasRead:Number,
	title:String,
	summary:String,
	content:String,
	noticeType:Number /** 1 新闻资讯 2 特殊天气预警 **/
});
var NoticeModel = mongoose.model("notice", NoticeScheme);
module.exports = NoticeModel;