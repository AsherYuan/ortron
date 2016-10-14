var UserModel = require('../../../mongodb/models/UserModel');
var CenterBoxModel = require('../../../mongodb/models/CenterBoxModel');
var TerminalModel = require('../../../mongodb/models/TerminalModel');
var HomeGridModel = require('../../../mongodb/models/HomeGridModel');
var UserEquipmentModel = require('../../../mongodb/models/UserEquipmentModel');

var StringUtil = require('../../../util/StringUtil');

module.exports = function (app) {
	return new Cron(app);
};
var Cron = function (app) {
	this.app = app;
};

/**
 * 定时任务，定时给所有用户去推送消息
 */
Cron.prototype.currentData = function () {
	var self = this;
	UserModel.find({}, function(err, users) {
		if(err) {
			console.log(err);
		} else {
			for(var i=0;i<users.length;i++) {
				var ids = new Array();
				ids.push(users[i].mobile);
				ids.push(users[i].parentUser);

				sendNotice(users[i].mobile, ids, self);
			}
		}
	});
};


var sendNotice = function(userMobile, ids, self) {
	CenterBoxModel.find({userMobile:{$in:ids}}, function(err, centerBoxs) {
		if(err) {
			console.log(err);
		} else {
			var ids = new Array();
			for(var i=0;i<centerBoxs.length;i++) {
				ids.push(centerBoxs[i].serialno);
			}

			console.log("centerBoxIds::::" + JSON.stringify(ids));

			TerminalModel.find({centerBoxSerialno:{$in:ids}}, function(err, terminals) {
				if(err) {
					console.log(err);
				} else {
					var tIds = new Array();
					for(var j=0;j<terminals.length; j++) {
						tIds.push(terminals[j]._id);
					}

					console.log("terminaIds::::" + JSON.stringify(tIds));
					UserEquipmentModel.find({terminalId:{$in:tIds}}).populate({
						path: 'homeGridId',
						model: 'homeGrid',
						populate: {
							path: 'terminal',
							model: 'terminal'
						}
					}).exec(function(err, devices) {
						if(err) {
							console.log(err);
						} else {
							var ds = new Array();
							for(var k=0;k<devices.length;k++) {
								ds.push(devices[k]);
							}

							var param = {
								command: '6000',
								devices:ds
							};
							self.app.get('channelService').pushMessageByUids('onMsg', param, [{
								uid: userMobile,
								sid: 'user-server-1'
							}]);
						}
					});
				}
			});
		}
	});
}