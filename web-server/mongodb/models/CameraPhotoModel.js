var mongoose = require('../mongoose.js');

var CameraPhotoSchema = new mongoose.Schema({
	userMobile:String,
	url:String,
	genTime:String
});

var CameraPhotoModel = mongoose.model('cameraphoto', CameraPhotoSchema);
module.exports = CameraPhotoModel;
