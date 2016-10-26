var RinfraredModel = require('./app/mongodb/models/RinfraredModel');

var refresh = function(id, code) {
    RinfraredModel.update({_id:new ObjectId(id)}, {$set:{eLevel:code}}, function(err) {
        if(err) {
            console.log("update err: " + err);
        }
    });
};
var left = 20000;
/**
 * 刷新红外数据
 * @type {Number}
 */
RinfraredModel.count({infrared:null}, function(err, count) {
    console.log("还有 " + count + " 条记录");
});
RinfraredModel.find({infrared:null}).limit(20000).exec().then(function(list) {
    for(var i=0;i<list.length;i++) {
        var ir = list[i];
        var e = ir.eLevel;
        if(e.indexOf(",") > -1) {
            var r = trans(e);
            RinfraredModel.update({_id:ir._id}, {$set:{infrared:r}}, function(err, docs) {
                console.log((left--) + "____docs:" + JSON.stringify(docs));
            });
        }

    }
}).catch(function(err) {
    console.log(err);
});

var trans = function(waveInfo) {
    var standerd = 580;
    var arrays = waveInfo.split(",");
    var result = "";
    if(arrays.length < 1 || standerd < 1) {
        result = "数据错误";
    } else {
        var sb = "";
        for(var i=0;i<arrays.length;i++) {
            var binary = toBinary(arrays[i], standerd);
            if(i === 98) {
                binary += "0";
            }
            sb += binary;
        }
        result = sb;
    }
    var length = result.length;
    var circleTimes = Math.floor(length / 8);
    var finalString = "";
    for(var x=0;x<circleTimes;x++) {
        byteString = result.substring(x*8, (x+1) * 8);
        var decimal = parseInt(byteString, 2);
        var hex = decimal.toString(16);
        if(hex.length === 1) {
            hex = "0" + hex;
        }
        finalString += hex.toUpperCase() + " ";
    }
    return finalString;
};


var toBinary = function(singleWave, standerd) {
    var isHigh = false;
	isHigh = singleWave.indexOf("H") > -1;
	var realData = singleWave.substring(1);
	var bitCount = realData / standerd;
    bitCount = Math.round(bitCount);
    var sb = "";
	if(isHigh) {
		for(var x=0;x<bitCount;x++) {
            sb += "1";
		}
	} else {
		for(var y=0;y<bitCount;y++) {
			sb += "0";
		}
	}
    // console.log("realData:" + realData);
    // console.log("standerd:" + standerd);
    // console.log("bitCount:" + bitCount);
    // console.log("sb:" + sb);
	return sb;
};


/****  testing **/
// var source = "H4350,L4350,H582,L1580,H582,L582,H582,L1580,H582,L1580,H582,L582,H582," +
//              "L582,H582,L1580,H582,L582,H582,L582,H582,L1580,H582,L582,H582,L582,H582," +
//              "L1580,H582,L1580,H582,L582,H582,L1580,H582,L582,H582,L582,H582,L582,H582," +
//              "L1580,H582,L1580,H582,L1580,H582,L1580,H582,L1580,H582,L1580,H582,L1580,H582," +
//              "L1580,H582,L582,H582,L582,H582,L582,H582,L582,H582,L582,H582,L582,H582,L582," +
//              "H582,L582,H582,L582,H582,L1580,H582,L582,H582,L582,H582,L582,H582,L1580,H582," +
//              "L1580,H582,L1580,H582,L1580,H582,L582,H582,L1580,H582,L1580,H582,L1580,H582," +
//              "L5000,H4350,L4350,H582,L1580,H582,L582,H582,L1580,H582,L1580,H582,L582,H582," +
//              "L582,H582,L1580,H582,L582,H582,L582,H582,L1580,H582,L582,H582,L582,H582,L1580," +
//              "H582,L1580,H582,L582,H582,L1580,H582,L582,H582,L582,H582,L582,H582,L1580,H582," +
//              "L1580,H582,L1580,H582,L1580,H582,L1580,H582,L1580,H582,L1580,H582,L1580,H582," +
//              "L582,H582,L582,H582,L582,H582,L582,H582,L582,H582,L582,H582,L582,H582,L582,H582," +
//              "L582,H582,L1580,H582,L582,H582,L582,H582,L582,H582,L1580,H582,L1580,H582,L1580," +
//              "H582,L1580,H582,L582,H582,L1580,H582,L1580,H582,L1580,H582,L5000,";
// var target = "36 FF 00 8A 22 A2 A2 A2 28 AA 22 22 22 22 AA AA 8A A2 22 28 88 80 1F E0 11 44 54 54 54 45 15 44 44 44 44 55 55 51 54 44 45 11 10 ";
// var temp   = "   FF 00 8A 22 A2 A2 A2 28 AA 22 22 22 22 AA AA 8A A2 22 28 88 80 1F E0 11 44 54 54 54 45 15 44 44 44 44 55 55 51 54 44 45 11 10";
// var t = trans(source);
