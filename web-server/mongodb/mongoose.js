var mongoose = require('mongoose');
mongoose.connect('mongodb://122.225.56.14:27017/otron');
mongoose.Promise = require('bluebird');
module.exports = mongoose;
