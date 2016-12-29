var Error_cn = {
    FA_TOKEN_INVALID: 'token验证失败',
    FA_USER_NOT_EXIST: '用户不存在',
    DUPLICATED_LOGIN: '重复登录',
    ACCOUNT : {
        NAME_IS_BLANK : '姓名不能为空',
        MOBILE_IS_BLANK : '手机号码不能为空',
        PASSWORD_IS_BLANK : '密码不能为空',
        USER_NOT_EXIST : '用户不存在',
        PASSWORD_NOT_CORRECT : '密码不正确',
        USERNAME_IS_BLANK : '用户名不能为空',
        MOBILE_FORMAT_ERROR : '手机号码格式不正确',
        VERIFY_ERROR : '验证码不正确'
    },
    STRUCTURE : {
        USER_NO_HOME : '用户尚未设置家庭信息',
        HOME_EXIST : '该家庭已经存在',
        HOME_NOT_EXIST : '该家庭不存在',
        CENTERBOX_SERIAL_NO_EXIST : '该主控已经存在',
        CENTERBOX_OCCUPIED : '该主控已经被其他楼层占用了',
        CENTERBOX_INITED : '该主控已经初始化过了',
        CENTERBOX_NOT_EXIST : '该主控不存在',
        LAYER_EXIST : '楼层已存在',
        LAYER_NOT_EXIST : '楼层不存在',
        LAYER_NOT_BINDED : '楼层未绑定',
        TERMINAL_ALREADY_EXIST: '终端已经存在'
    },
    REMOTECONTROLL : {
        USEREQUIPMENT_NOT_EXIST : '用户设备不存在'
    },
    ESTATE : {
        USERNAME_IS_BLANK : '用户名不能为空',
        PASSWORD_IS_BLANK : '密码不能为空',
        MANAGER_NOT_EXIST : '该管理员不存在',
        PASSWORD_NOT_CORRECT : '密码不正确'
    },
    SUCC : "操作成功",
    FAIL : "操作失败",
    NET_FAIL : '网络通信错误',
    BUSY : "服务器忙",
    SERVER_CLOSE : "服务器已关闭",
    COMMON: "通用错误",
    DATABASE : "数据库报错",
    PARAMERROR : "参数错误",
    NODATA : "没有对应数据"
};

lang_cn = {
  Error : Error_cn
};

var lang = module.exports;
lang.localLang = lang_cn;
lang.error = lang.localLang.Error;
