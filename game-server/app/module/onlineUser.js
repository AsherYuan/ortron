/*!
 * Pomelo -- consoleModule onlineUser
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
var logger = require('../util/logger.js');
var utils = require('../util/utils');

module.exports = function(opts) {
  return new Module(opts);
};

module.exports.moduleId = 'onlineUser';

var Module = function(opts) {
  opts = opts || {};
  this.app = opts.app;
  this.type = opts.type || 'pull';
  this.interval = opts.interval || 5;
};

Module.prototype.monitorHandler = function(agent, msg, cb) {
  var connectionService = this.app.components.__connection__;
  if(!connectionService) {
    logger.logGameError('not support connection: %j', agent.id);
    return;
  }
  var msg = connectionService.getStatisticsInfo();

  agent.notify(module.exports.moduleId, msg);

};

Module.prototype.masterHandler = function(agent, msg, cb) {
  if(!msg) {
    // pull interval callback
    var list = agent.typeMap['connector'];
    if(!list || list.length === 0) {
      return;
    }
    agent.notifyByType('connector', module.exports.moduleId);
    return;
  }

  var data = agent.get(module.exports.moduleId);
  if(!data) {
    data = {};
    agent.set(module.exports.moduleId, data);
  }

  data[msg.serverId] = msg;
};

Module.prototype.clientHandler = function(agent, msg, cb) {
  utils.invokeCallback(cb, null, agent.get(module.exports.moduleId));
};
