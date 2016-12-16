var mongoose = require('./mongoose.js');

var TempSchema = new mongoose.Schema({
	flag:Boolean
});

var TempModel = mongoose.model('temp', TempSchema);
module.exports = TempModel;


var tt = new TempModel({flag:false});
tt.save();