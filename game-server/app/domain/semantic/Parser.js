var server_address = "https://wenzhi.api.qcloud.com/v2/index.php?";
var Action = 'TextClassify';
var Region = 'sh';
var Timestamp = new Date().getTime();
var Nonce = Math.round(Math.random()*100000);
var SecretId = 'AKIDVDEn1pA7ms9TVMc6hVPK0mJyAvSjB5wC';
var SecretKey = 'iNBBt2ogJR82yxrYNrW2w9HvBwf8j4gv';

var content = '你好';

var CommonParam = {
    'Action' : Action,
    'content' : content,
    'Nonce' : Nonce,
    'Region' : Region,
    'SecretId' : SecretId,
    'Timestamp' : Timestamp
};
var url = '';
for(var k in CommonParam) {
    url += k + "=" + CommonParam[k];
}
console.log(url);
// var Signature = ;

// https://wenzhi.api.qcloud.com/v2/index.php?
//     Action=TextClassify
//     &Nonce=345122
//     &Region=sz
//     &SecretId=AKIDz8krbsJ5yKBZQpn74WFkmLPx3gnPhESA
//     &Timestamp=1408704141
//     &Signature=HgIYOPcx5lN6gz8JsCFBNAWp2oQ
//     &content=腾讯入股京东
