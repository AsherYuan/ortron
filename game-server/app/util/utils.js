var Code = require('../domain/code');
var Pomelo = require('pomelo');
var utils = module.exports;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
    if(!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * 用法
 * @param err
 * 如果err中包含errcode，直接返回err
 * 如果err为空或者err中不包含errcode，则返回Code.COMMON
 *
 * 如果直接调用utils.invokeError()，会返回Code.COMMON
 *
 * @returns {*}
 */
utils.invokeError = function (err){
    if (err && err.errcode){
        return err;
    }
    else{
        return Code.COMMON;
    }
};

/**
 * clone an object
 */
utils.clone = function(origin) {
    if(!origin) {
        return;
    }

    var obj = {};
    for(var f in origin) {
        if(origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

utils.deepClone = function(origin) {
    if(!origin || typeof (origin) != 'object') {
        return origin;
    }

    var obj;
    if (origin instanceof Array){
        obj = [];
    }
    else{
        obj = {};
    }
    for(var f in origin) {
        if(origin.hasOwnProperty(f)) {
            obj[f] = utils.deepClone(origin[f]);
        }
    }
    return obj;
};

utils.size = function(obj) {
    if(!obj) {
        return 0;
    }

    var size = 0;
    for(var f in obj) {
        if(obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

utils.isEmpty = function(obj) {
    for(var i in obj)
    {
        return false;
    }
    return true;
};

utils.copyTo = function(fromObj, toObj) {
    for(var f in fromObj) {
        if(fromObj.hasOwnProperty(f)) {
            toObj[f] = fromObj[f];
        }
    }
    return toObj;
};

/**
 * a .NET-like format string function, output string by replacing {0}, {1}... with input params
 * @returns {*}
 * @constructor
 */
utils.StringFormat = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};

/**
 * sort-func. in descending, use exsample: array.sort(sortby('keyword'));
 * @param name
 * @returns {Function}
 */
utils.sortby = function(name){
    return function(o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return b - a;
            }
            return typeof a < typeof b ? 1 : -1;
        }
        else {
            throw ("error");
        }
    }
};

utils.sortbyAsc = function(name){
    return function(o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a - b;
            }
            return typeof a > typeof b ? 1 : -1;
        }
        else {
            throw ("error");
        }
    };
}
/**
 *
 * @param array
 * @param obj
 * @returns {boolean}
 */
utils.contains = function(array, obj) {
    var i = array.length;
    while (i--) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
};

//cal MD5
var crypto = require('crypto');
utils.md5 = function(text) {
    var buf = new Buffer(2048);
    var len = buf.write(text, 0);
    var binData = buf.toString('binary', 0, len);
    var sign = (crypto.createHash('md5').update(binData).digest('hex'));

    return sign;
};

utils.getServerId = function() {
    return Pomelo.app.get('LordCard_Serverid');
};

utils.isServerZIYOUZHIYI = function() {
    return (this.getServerId() == 1);
};

utils.isServerWANGGUOZHIBI = function() {
    return (this.getServerId() == 2);
};

utils.isServerNANHU = function() {
    return (this.getServerId() == 3);
};

/**
 * 判断日期有效性
 * @param year
 * @param month
 * @param date
 * @param destMonth 目标月
 * @param destDate   目标日
 * @returns {boolean}
 */
utils.isDateValidWithDest = function(year, startMonth , startDate, destMonth, destDate){
    var date = new Date();
    var startDate = new Date(year + '/' + startMonth + '/' + startDate);
    var destDate = new Date(year + '/' + destMonth + '/' + destDate);
    if(date >= startDate && date <= destDate) {
        return true;
    } else {
        return false;
    }
};