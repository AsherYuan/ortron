var mongoose = require('../mongoose.js');

var BrandModelSchema = new mongoose.Schema({
    brand: String,
    model: String,
    tid: String,
    type:String
});
var BrandModelModel = mongoose.model("brandModel", BrandModelSchema);
module.exports = BrandModelModel;
