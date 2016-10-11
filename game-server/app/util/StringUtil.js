var StringUtil = module.exports;

// 删除左右两边的空格
StringUtil.trim = function(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
};


StringUtil.trimAll = function(str) {
    var result = str;
    result = str.replace(/(^\s+)|(\s+$)/g,'');
	result = result.replace(/\s/g, '');
	return result;
}

StringUtil.isBlank = function(str) {
    if(str === null || str === undefined) {
        return true;
    } else {
        str = StringUtil.trim(str);
        if(str === '') {
            return true;
        } else {
            return false;
        }
    }
};

StringUtil.str2hex = function(str) {
    var val = "";
    for(var i=0;i<str.length;i++) {
        val += str.charCodeAt(i).toString(16);
    }
    return val;
};

StringUtil.str2bytes = function(str) {
    var pos = 0;
    var len = str.length;
    if(len % 2 !== 0) {
        return null;
    }
    len /= 2;
    var hexA = [];
    for(var i=0;i<len;i++) {
        var s = str.substr(pos, 2);
        var v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
};

StringUtil.length = function(str) {
    var len = 0;
    for (var i=0; i<str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
            len++;
        } else {
            len += 2;
        }
    }
    return len;
};

StringUtil.filterHtml = function(str) {
    str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
    str.value = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
    return str;
};