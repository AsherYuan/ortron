var RegexUtil = module.exports;

RegexUtil.checkPhone = function(phone) {
    console.log(/^1[3|4|5|7|8]\d{9}$/.test(phone));
    if(!(/^1[3|4|5|7|8]\d{9}$/.test(phone))){
        return false;
    }
    return true;
};
