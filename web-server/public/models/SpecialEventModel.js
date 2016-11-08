var mongoose = require('../mongoose.js');

var ActionSchema = new mongoose.Schema({
	targetDeviceId:String, /* 目标设备ID */
	detail:String, /* 动作描述 */
	remoteControlParam:String /* 遥控操作参数,格式参照user.userHandler.remoteControl */
});

var SpecialEventSchema = new mongoose.Schema({
	addTime:{type:Date, default:Date.now}, /* 数据生成时间 */
	toMobile:String, /* 目标用户 */
	hasSend:Number, /* 是否已发送，推送池用 */
	sendTime:{type:Date, default:Date.now}, /* 推送时间 */
	title:String, /* 推送标题 */
	content:String, /* 推送内容 */
	clientId:String, /*个推需要的字段*/
	level:Number, /* 等级1-5 */
	type:Number, /*1 交互操作推送 2 确认动作推送 3 文本描述推送 （等级3以下的推送根据用户使用习惯来判断类型设置，等级3以上的强制推送) */
	hasConfirm:Number, /* 用户是否已确认，type==1 || type == 2 情况下有效 其他类型忽略, 0,未确认，1 已确认 2 点击确认 3 点击取消 */
	action:[ActionSchema], /* type==1 || type==2 时有效，代表将要执行的操作 */
	result:String,
});
var SpecialEventModel = mongoose.model("SpecialEvent", SpecialEventSchema);
module.exports = SpecialEventModel;