/**
 * Created with JetBrains WebStorm.
 * User: zhangjun
 * Date: 6/22/13
 * Time: 1:06 下午
 * To change this template use File | Settings | File Templates.
 */
var cachedclient = module.exports;
var utils = require('../util/utils');
var pomelo = require('pomelo');
var _mem;
var _keyPre = pomelo.app.get("Otron_Serverid") + "_";
const DEFAULT_CACHETIME = 600;     //默认缓存时间10分钟

cachedclient.init = function(app){
    if (!!_mem){
        return cachedclient;
    } else {
        var M = require('memcached');
        _mem = new M(app.get('memcached'),{ compressionThreshold:10 });
        return cachedclient;
    }
};

/**
 * 得到加过前缀之后的key
 * @param key
 */
cachedclient.getKeyWithPrefix = function(key){
    return _keyPre + key;
}

/**
 * 查询memcached
 * @param key 要查询的key, 如果传递的是数组，则会自动掉用getMulti方法
 * @param cb 回调
 * 如果没有查询到数据，返回false
 * 使用举例
 * mem.get('testkey',function(err,data){
        console.log(data);
   });
 */
cachedclient.get = function(key, cb){
    key = _keyPre + key;
    _mem.get(key, function( err, result ){
        utils.invokeCallback(cb, err, result);
    });
};

/**
 * 查询多项
 * @param keyArray
 * @param cb
 */
cachedclient.getMulti = function(keyArray, cb){
    var len = keyArray.length;
    for (var i=0; i<len; i++){
        keyArray[i] = _keyPre + keyArray[i];
    }
    _mem.getMulti(keyArray, function( err, result ){
        utils.invokeCallback(cb, err, result);
    });
};

/**
 * 设置memcahed
 * @param key
 * @param value
 * @param lifetime memcahed过期时间 单位为秒 不传则为默认时间
 * @param cb
 * 使用举例
 * mem.set('testkey', 'testvalue', function(err,data){
        console.log(data);
   });
 */
cachedclient.set = function(key, value, lifetime, cb){
    //对参数进行处理
    if (typeof arguments[2] == 'function')  {
        cb = arguments[2];
        lifetime = 0;
    }

    //默认缓存时间
    if (!lifetime){
        lifetime = DEFAULT_CACHETIME;
    }

    key = _keyPre + key;
    _mem.set( key, value, lifetime, function( err, result ){
        utils.invokeCallback(cb, err, result);
    });
}

/**
 * 让memcached中的值增加
 * @param key
 * @param value
 * @param lifetime
 * @param cb
 * 当memcached中的值为数字时才能使用
 */
cachedclient.add = function(key, value, lifetime, cb){
    key = _keyPre + key;
    _mem.add( key, value, lifetime, function( err, result ){
        utils.invokeCallback(cb, err, result);
    });
}

/**
 * 删除
 * @param key
 * @param cb
 */
cachedclient.del = function(key, cb){
    key = _keyPre + key;
    _mem.del(key, function( err, result ){
        utils.invokeCallback(cb, err, result);
    });
}
