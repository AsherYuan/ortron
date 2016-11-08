var mongoose = require('../mongoose.js');

var CourierSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    userMobile: {
        type: String,
        default: ''
    },
    sendOrReceiver: {
        type: Number,
        default: ''
    },
    time: {
        type: String,
        default: new Date().toLocaleString()
    },
    address: {
        type: String,
        default: ''
    },
    courierCompany: {
        type: String,
        default: ''
    },
    isSendOrReceiver: {
        type: Number,
        default: 0
    }
});

var CourierModel = mongoose.model('courier', CourierSchema);
module.exports = CourierModel;
