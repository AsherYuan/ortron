var mongoose = require('../mongoose.js');

var SuggestionSchema = new mongoose.Schema({
	suggestion: {type: String, default: ''},
	drsg: {type: String, default: ''},
	flu: {type: String, default: ''},
	addTime : {type:Date, default:Date.now}
});

var SuggestionModel = mongoose.model('suggestion', SuggestionSchema);
module.exports = SuggestionModel;