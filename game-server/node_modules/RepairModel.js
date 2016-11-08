var mongoose = require('../mongoose.js');

var RepairScheam = new mongoose.Schema({
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
        type: Number,
        default: 0
    }
});

var RepairModel = mongoose.model('repair', RepairScheam);
module.exports = RepairModel;
