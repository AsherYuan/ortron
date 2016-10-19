var AccountModel = require('../../../mongodb/estateModels/accountModel');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

/**
 * 登录功能，后期需要APP端配合，改增为只做登录验证，和token获取，实际初始化session这些功能放入auth接口
 * TODO
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.login = function (msg, session, next) {
    var self = this;
    var username = msg.username;
    var password = msg.password;
    if (StringUtil.isBlank(username)) {
        next(null, ResponseUtil.resp(Code.ESTATE.MOBILE_IS_BLANK));
    } else if (StringUtil.isBlank(password)) {
        next(null, ResponseUtil.resp(Code.ESTATE.PASSWORD_IS_BLANK));
    } else {
        self.app.rpc.estate.estateRemote.login(session, username, password, function(err, token) {
            if(err) {
                next(null, err);
            } else {
                next(null, {code:200, codetxt:'操作成功', data:manager, token:token});
            }
        });
    }
};
