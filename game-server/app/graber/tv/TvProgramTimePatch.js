var TvProgramModel = require('../../mongodb/tv/TvProgramModel');

TvProgramModel.find({}, function(err, ps) {
	if(err) {

	} else {
		for(var i=0;i<ps.length;i++) {
			updateTime(ps[i]);
		}
	}
});

var updateTime = function(ps) {
	var b = new Date(ps.beginTime.getTime() + 2 * 24 * 60 * 60 * 1000);
	var e = new Date(ps.endTime.getTime() + 2 * 24 * 60 * 60 * 1000);
	var id = ps._id + "";
	TvProgramModel.update({_id:new Object(id)}, {$set:{beginTime:b, endTime:e}}, function(err, n) {
		console.log(err + "___" + JSON.stringify(n));
	});
};
