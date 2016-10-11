var exp = module.exports;
var utils = require('./utils');
var dispatcher = require('./dispatcher');

exp.user = function(session, msg, app, cb){

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log("session:" + session);
    console.log("msg:" + JSON.stringify(msg));
    console.log("app:" + JSON.stringify(app));
    console.log("cb:" + JSON.stringify(cb));
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");


    var servers = app.getServersByType('user');
    if(!servers || servers.length === 0) {
        cb(new Error('can not find main servers.'));
        return;
    }

    var serverid = session.get('serverid');
    if (!serverid){
        serverid = utils.getServerId();
    }
    if (!serverid){
        serverid = 1;
    }

    var res = dispatcher.findByServerid(serverid, servers);

    cb(null, res.id);
};