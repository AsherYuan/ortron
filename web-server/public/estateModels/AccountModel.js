var mongoose = require('../mongoose.js');

var AccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    floorId: String,
    floor: {
        type: String,
        ref: "floor"
    }
});

var AccountModel = mongoose.model('account', AccountSchema);
module.exports = AccountModel;
