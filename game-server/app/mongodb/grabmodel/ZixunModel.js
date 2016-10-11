var mongoose = require('../mongoose.js');

var ZixunSchema = new mongoose.Schema({
	title: {type: String, default: ''},
	text: {type: String, default: ''},
	href: {type: String, default: ''},
	addTime: {type: Date, default: Date.now}
});

var ZixunModel = mongoose.model('zixun', ZixunSchema);
module.exports = ZixunModel;