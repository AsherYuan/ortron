/**
 * User: AsherYuan
 * Date: 15-11-15
 * Time: 上午11:22
 */
var UserEquipmentModel = require('../mongodb/models/UserEquipmentModel');
var HomeModel = require('../mongodb/models/HomeModel');
var HomeGridModel = require('../mongodb/models/HomeGridModel');
var async = require("async");

var StructureFilter = module.exports;

StructureFilter.filter = function(input, userMobile, callback) {
	/** 获取用户所有房型数据 **/
	async.waterfall([
		function(cb) {
			HomeModel.find({userMobile:userMobile}, function(err, homes) {
				if(err) {
					callback(null, input, "", "");
				} else {
					if(!!homes && homes.length > 0) {
						cb(null, homes[0]);
					} else {
						callback(null, input, "", "");
					}
				}
			});
		},
		function(home, cb) {
			var layerNames = [];
			var layers = home.layers;
			for(var l=0;l<layers.length;l++) {
				layerNames.push(layers[l].name);
			}
			cb(null, layerNames, home);
		},
		function(layerNames, home, cb) {
			HomeGridModel.find({homeId:home._id}, function(err, grids) {
				if(err) {
					callback(null, input, "", "");
				} else {
					if(!!grids && grids.length > 0) {
						var structure = {};
						for(var i=0;i<layerNames.length;i++) {
							structure[layerNames[i]] = [];
							for(var j=0;j<grids.length;j++) {
								if(grids[j].layerName === layerNames[i]) {
									structure[layerNames[i]].push(grids[j].name);
								}
							}
						}
						cb(null, structure);
					} else {
						callback(null, input, "", "");
					}
				}
			});
		},
		function(structure) {
			var layer = "";
			var grid = "";
			for(var layerName in structure) {
				if(input.indexOf(layerName) > -1) {
					layer = layerName;
					input = input.replace(layerName, "");
					break;
				}
			}
			// if(layer === "") {
			// 	callback(null, input, "", "");
			// } else {
			// 	for(var i=0;i<structure[layer].length;i++) {
			// 		var gridName = structure[layer][i];
			// 		if(input.indexOf(gridName) > -1) {
			// 			grid = gridName;
			// 			input = input.replace(gridName, "");
			// 			break;
			// 		}
			// 	}
			// 	callback(null, input, layer, grid);
			// }
			for(var x in structure) {
                for(var i=0;i<structure[x].length;i++) {
                    var gridName = structure[x][i];
                    if(input.indexOf(gridName) > -1) {
                        grid = gridName;
                        input = input.replace(gridName, "");
                        break;
                    }
                }
            }
            callback(null, input, layer, grid);
		}
	], function(err, result) {
		callback(err, result);
	});
};
