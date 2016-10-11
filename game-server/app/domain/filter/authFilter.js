var authConfig = require('../auth/authConfig');
var tokenManager = require('../auth/token');
var Code = require('../code');
var sessionManager = require('../sessionService.js');
var UserModel = require('../../mongodb/models/UserModel');


module.exports = function() {
  return new Filter();
};

var Filter = function() {

};

Filter.prototype.before = function(msg, session, next) {
  console.log('_____________before______________');
  var token = msg.token;
  //根据token获取uid
  var res = tokenManager.parse(token, authConfig.authSecret);
  console.log(res);
  if(!res) {
    next(null, Code.ENTRY.FA_TOKEN_INVALID);
    return;
  }
  // Token解析成功 开始验证数据
  var uid = res.uid;
  console.log('sessionUid::' + session.uid + "______token.uid::" + uid);

  UserModel.find({"mobile":uid}, function(err, docs){
    if(err) console.log(err);
    else {
      // 用户没找到
      if(docs.length === 0) {
        next(null, Code.ACCOUNT.USER_NOT_EXIST);
        return;
      } else {

        sessionManager.getSession(uid, function(err, data) {
          if(err) {
            console.log(err);
          } else {
            console.log(data);
          }
        });
        next();
        //
        //
        // sessionManager.addSession(uid,{status:1, frontendId:session.frontendId});
        // session.on('closed', onUserLeave.bind(null, self.app));
        // session.bind(uid);
        // // 将uid存入session中
        // session.set('uid', uid);
        // next(null, Code.OK);
        // return;
      }
    }
  });
};


/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
  if(!session || !session.uid) {
    return;
  }
  console.log('用户离开,session消除 [' + session.uid + "]");
  sessionManager.delSession(session.uid);
};