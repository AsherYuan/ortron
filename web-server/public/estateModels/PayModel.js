var mongoose = require('../mongoose.js');

var PaySchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    userMobile: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: ''
    },
    money: {
        type: String,
        default: ''
    },
    isPay: {
        type: Number,
        default: 0
    }
});

var PayModel = mongoose.model('pay', PaySchema);
module.exports = PayModel;
