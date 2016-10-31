var StringUtil = module.exports;

// 删除左右两边的空格
StringUtil.trim = function(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
};


StringUtil.trimAll = function(str) {
    var result = str;
    result = str.replace(/(^\s+)|(\s+$)/g, '');
    result = result.replace(/\s/g, '');
    return result;
};

StringUtil.isBlank = function(str) {
    if (str === null || str === undefined) {
        return true;
    } else {
        str = StringUtil.trim(str);
        if (str === '') {
            return true;
        } else {
            return false;
        }
    }
};

StringUtil.str2hex = function(str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        val += str.charCodeAt(i).toString(16);
    }
    return val;
};

StringUtil.str2bytes = function(str) {
    var pos = 0;
    var len = str.length;
    if (len % 2 !== 0) {
        return null;
    }
    len /= 2;
    var hexA = [];
    for (var i = 0; i < len; i++) {
        var s = str.substr(pos, 2);
        var v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
};

StringUtil.length = function(str) {
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            len += 2;
        }
    }
    return len;
};

StringUtil.filterHtml = function(str) {
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str.value = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    return str;
};

StringUtil.numberTrans = function(chnStr) {
    var chnNumChar = {零: 0,一: 1,二: 2,三: 3,四: 4,五: 5,六: 6,七: 7,八: 8,九: 9,两:2,十:10, 百:100,千:1000,万:10000,亿:999};
    var words = [];
    var single = '';
    for(var i=0;i<chnStr.length;i++) {
        if(chnNumChar[chnStr[i]]) {
            single += chnStr[i];
        } else {
            if(single !== '') {
                words.push(single);
                single = '';
            }
        }
    }

    if(words.length > 0) {
        for(var j=0;j<words.length;j++) {
            var number = chineseToNumber(words[j]);
            chnStr = chnStr.replace(words[j], number + "");
        }
    }

    return chnStr;
};

var chineseToNumber = function(chnStr) {
    var chnNumChar = {零: 0,一: 1,二: 2,三: 3,四: 4,五: 5,六: 6,七: 7,八: 8,九: 9,两:2};
    var chnNameValue = {
        十: {
            value: 10,
            secUnit: false
        },
        百: {
            value: 100,
            secUnit: false
        },
        千: {
            value: 1000,
            secUnit: false
        },
        万: {
            value: 10000,
            secUnit: true
        },
        亿: {
            value: 100000000,
            secUnit: true
        }
    };

    var rtn = 0;
    var section = 0;
    var number = 0;
    var secUnit = false;
    var str = chnStr.split('');

    for (var i = 0; i < str.length; i++) {
        var num = chnNumChar[str[i]];
        if (typeof num !== 'undefined') {
            number = num;
            if (i === str.length - 1) {
                section += number;
            }
        } else {
            console.log(str[i]);
            var unit = chnNameValue[str[i]].value;
            secUnit = chnNameValue[str[i]].secUnit;
            if (secUnit) {
                section = (section + number) * unit;
                rtn += section;
                section = 0;
            } else {
                section += (number * unit);
            }
            number = 0;
        }
    }
    return rtn + section;
};
