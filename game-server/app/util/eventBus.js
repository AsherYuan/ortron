/**
 * Created with JetBrains WebStorm.
 * User: zhangjun
 * Date: 6/24/13
 * Time: 3:51 下午
 * To change this template use File | Settings | File Templates.
 * 事件总线
 */

var EventEmitter = require('events').EventEmitter;
var EventBus = new EventEmitter();
module.exports = EventBus;