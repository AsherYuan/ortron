var mongoose = require('mongoose');
mongoose.connect('mongodb://122.225.88.66:27017/otron');
mongoose.Promise = require('bluebird');
module.exports = mongoose;
