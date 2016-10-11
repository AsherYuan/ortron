var mongoose = require('../mongoose.js');
var CenterBoxSchema = new mongoose.Schema({
    userMobile : String,
    serialno : String,
    ssid : String,
    passwd : String,
    code : String,
    hasConnected:{type:Boolean, default:false},
    regTime : { type:Date, default:Date.now },
    lastLoginTime : { type:Date, default:Date.now },
    temperatureSwitch : String,
    humiditySwitch : String,
    qualitySwitch : String,
    coSwitch : String,
    pm25Switch : String,
    curIpAddress : String,
    curPort : Number
});
var CenterBoxModel = mongoose.model("centerBox", CenterBoxSchema);
module.exports = CenterBoxModel;

// exports.save = function(serialno, code) {
//     CenterBoxModel.find({"serialno":serialno, 'code':code}, function(error, docs) {
//         if(error) {
//             console.log("CenterBoxModel.prototype.find: error : " + error);
//         } else {
//             if(docs.length === 0) {
//                 // 数据库中不存在数据，插入数据
//                 var CenterBoxEntity = new CenterBoxModel({
//                     serialno:serialno,
//                     code:code
//                 });
//
//                 CenterBoxEntity.save(function(error,doc){
//                     if(error) {
//                         console.log("CenterBoxEntity.prototype.save: error : " + error);
//                     } else {
//                         var saveMsg = "新增centerBox保存成功";
//                         console.log(saveMsg);
//                         // sock.write(saveMsg);
//                     }
//                 });
//             } else {
//                 // 数据库中已经有记录了，修改该上下线状态，修改最后登录时间
//                 var conditions = {"serialno" : serialno, 'code' : code};
//                 var update = {$set : { lastLoginTime : new Date() }};
//                 CenterBoxModel.update(conditions, update, function(error) {
//                     if(error) {
//                         console.log("CenterBoxModel.prototype.update: error : " + error);
//                     } else {
//                         var saveMsg = "更新最后登录时间成功";
//                         console.log(saveMsg);
//                         // sock.write(saveMsg);
//                     }
//                 });
//             }
//         }
//     });
// };
//
// exports.getMaxCode = function() {
//     CenterBoxModel.find();
//     var code = '0002';
//     return code;
// };
//
// exports.getList = function(cb) {
//     CenterBoxModel.find({}, function(err, docs) {
//        cb(err, docs);
//     });
// };
//
// exports.delteCtrl = function(serialno, cb) {
//     CenterBoxModel.remove({serialno:serialno}, function(err) {
//         if(err) {
//             console.log(err);
//             cb(-1);
//         } else {
//             cb(0);
//         }
//     });
// };