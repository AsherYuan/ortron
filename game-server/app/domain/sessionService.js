/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-7-19
 * Time: 下午3:35
 * To change this template use File | Settings | File Templates.
 */
var pomelo = require("../../node_modules/pomelo/lib/pomelo.js");
var utils = require("../util/utils.js");
var sessionService = module.exports;
var memCache = pomelo.app.get("memclient");
var messageService = require('./messageService.js');
var memcached = require("../memcached/memcached");

sessionService.getMutiSession = function(uidList , cb){
    var cacheUidList = [];
    for(var i = 0; i < uidList.length; i++){
        cacheUidList.push(sessionService.getSessionCacheKey(uidList[i]));
    }
    memCache.getMulti(cacheUidList ,cb);
};

sessionService.getSession = function(uid , cb){
    var cachekey = sessionService.getSessionCacheKey(uid);
    memCache.get(cachekey,function(err,data){
        utils.invokeCallback(cb , err , data);
    });
};

sessionService.delSession = function(uid ,cb){
    var cacheKey = sessionService.getSessionCacheKey(uid);
    memCache.del(cacheKey , function(err){
       utils.invokeCallback(cb , err);
    });
};

sessionService.addSession = function(uid , data){
    var cachekey = sessionService.getSessionCacheKey(uid);
    memCache.set(cachekey , data , 60*60*24 );
};

sessionService.getSessionCacheKey = function(uid){
    return "sessionKey_"+uid+"_wanglonghai";  //tmp  防干扰
};


sessionService.STATUS = {
    Free : 1,   //空闲
    Busy : 2    //忙碌
};

/**
 * 更改用户状态
 * @param uid
 * @param status 1：空闲 2：忙碌
 * @param cb
 */
sessionService.updateUserStatus = function(uid , status , cb){
    sessionService.getSession(uid , function(err ,data){
        if(!!err){
            console.log("用户未上线，不能修改用户状态");
            utils.invokeCallback(cb , err)
        }else{
            data.status = status;
            sessionService.addSession(uid , data);
            utils.invokeCallback(cb , null);
        }
    });
};

/**
 * 获取多个用户状态 -1:状态未知 0：不在线 1：空闲 2：忙碌
 * @param uidList
 * @param cb
 */
sessionService.getMutiUserStatus = function(uidList , cb){
    if(!uidList || uidList.length == 0){
        utils.invokeCallback(cb , null , []);
    }
    else{
        sessionService.getMutiSession(uidList, function(err , res){
            var result = {};
            for(var key in res){
                result[key.split("_")[2]] = res[key];
            }
            utils.invokeCallback(cb ,err ,result);
        });
    }
};

/**
 * 将消息push到uid的客户端
 * @param uid
 * @param msg
 * @param cb
 */
sessionService.pushMessageToClient = function(uid , msg , cb){
    sessionService.getSession(uid ,function(err , session){
        if(!!err || !session){
            utils.invokeCallback(cb , err);
            console.log(err);
            console.log(session);
            console.log("push message to client error");
        }else{
            messageService.pushMessageToClient({"uid": uid, "sid": session.frontendId},msg);
            utils.invokeCallback(cb , null);
        }
    });

};

/**
 * 将消息push到uids的客户端
 * @param uid
 * @param msg
 * @param cb
 */
sessionService.pushMessageToClients = function(uids , msg , cb){
    sessionService.getMutiSession(uids ,function(err , session){
        if(!!err || !session){
            utils.invokeCallback(cb , err);
            console.log(err);
            console.log(session);
            console.log("push message to client error");
        }else{
            var cArr = [];
            for(var i = 0 ; i < uids.length; i ++) {
                var targetSession = session[memcached.getKeyWithPrefix(sessionService.getSessionCacheKey(uids[i]))];
                if(!targetSession) continue;
                cArr.push({"uid":uids[i],"sid":targetSession.frontendId});
            }
            messageService.pushMessageByUids(msg,cArr);
            utils.invokeCallback(cb , null);
        }
    });

};
