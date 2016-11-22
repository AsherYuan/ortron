var mongoose = require('./mongoose.js');

var RecentLocationSchema = new mongoose.Schema({
	userMobile:String,
	addTime:{type:Date, default:Date.now},
	location:String
});

var RecentLocationModel = mongoose.model('recentLocation', RecentLocationSchema);
module.exports = RecentLocationModel;