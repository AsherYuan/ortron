var mongoose = require('../mongoose.js');

var ComplaintScheam = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    userMobile: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: new Date().toLocaleString()
    },
    describ: {
        type: String,
        default: ''
    },
    isSolve: {
        type: String,
        default: 0
    }
});

var ComplaintModel = mongoose.model('complaint', ComplaintScheam);
module.exports = ComplaintModel;
