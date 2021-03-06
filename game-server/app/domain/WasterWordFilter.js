/**
 * User: AsherYuan
 * Date: 15-11-15
 * Time: 上午11:22
 */
var WasterWordFilter = module.exports;

var verbs = [
    '设置','设定','调节','调整','帮我把','调到','设为','设成','设到','调成','调为','为我把'
];

var preps = [
    '为','成','到'
];

var particles = [
    '啊','了','呢','哦','。'
];

var punctuation = ["，",'。','；','：','“','”','？','！'];

var combines = [];

for(var v in verbs) {
    for(var p in preps) {
        combines.push(verbs[v] + preps[p]);
    }
}

WasterWordFilter.filter = function(words) {
    for(var c in combines) {
        words = words.replace(combines[c], "");
    }
    for(var v in verbs) {
        words = words.replace(verbs[v], "");
    }
    for(p in punctuation) {
        words = words.replace(punctuation[p], "");
    }
    return words;
};

WasterWordFilter.filterPunctuation = function(str) {
    for(p in punctuation) {
        str = str.replace(punctuation[p], "");
    }
    return str;
};
