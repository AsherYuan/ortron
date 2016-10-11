var HomeModel = require("../../../mongodb/models/HomeModel");

var HomeRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

module.exports = function(app) {
    return new HomeRemote(app);
};

HomeRemote.prototype.getHomeList = function(userMobile, cb) {
    HomeModel.find({userMobile:userMobile}, function(err, homes) {
        if(err) {
            // TODO
            console.log(err);
        } else {
            cb(homes);
        }
    });
};
