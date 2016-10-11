var Lang = require('./data/language.js');

module.exports = {
    OK: {'code': 200, 'codetxt': Lang.error.SUCC},
    FAIL: {'code': 500, 'codetxt': Lang.error.FAIL},
    NET_FAIL: {'code': 501, 'codetxt': Lang.error.NET_FAIL},
    TOO_BUSY: {'code': 555, 'codetxt': Lang.error.BUSY},

    SERVER_CLOSE: {'code': 561, 'codetxt': Lang.error.SERVER_CLOSE},

    COMMON: {'code': 100, 'codetxt': Lang.error.COMMON},

    DATABASE: {'code': 101, 'codetxt': Lang.error.DATABASE},

    PARAMERROR: {'code': 102, 'codetxt': Lang.error.PARAMERROR},

    NODATA : {'code' : 103, 'codetxt' : Lang.error.NODATA},

    ENTRY: {
        FA_TOKEN_INVALID: {'code': 1001, 'codetxt': Lang.error.FA_TOKEN_INVALID},
        FA_USER_NOT_EXIST: {'code': 1002, 'codetxt': Lang.error.FA_USER_NOT_EXIST},
        DUPLICATED_LOGIN: {'code': 1003, 'codetxt': Lang.error.DUPLICATED_LOGIN},
    },

    ACCOUNT: {
        MOBILE_IS_BLANK: {'code': 2001, 'codetxt': Lang.error.ACCOUNT.MOBILE_IS_BLANK},
        PASSWORD_IS_BLANK: {'code': 2002, 'codetxt': Lang.error.ACCOUNT.PASSWORD_IS_BLANK},
        USER_NOT_EXIST: {'code': 2003, 'codetxt': Lang.error.ACCOUNT.USER_NOT_EXIST},
        PASSWORD_NOT_CORRECT: {'code': 2004, 'codetxt': Lang.error.ACCOUNT.PASSWORD_NOT_CORRECT},
        NAME_IS_BLANK: {'code': 2004, 'codetxt': Lang.error.ACCOUNT.NAME_IS_BLANK},
        USERNAME_IS_BLANK: {'code': 2005, 'codetxt': Lang.error.ACCOUNT.USERNAME_IS_BLANK},
        MOBILE_FORMAT_ERROR: {'code': 2006, 'codetxt': Lang.error.ACCOUNT.MOBILE_FORMAT_ERROR}
    },

    STRUCTURE: {
        USER_NO_HOME: {'code': 3001, 'codetxt': Lang.error.STRUCTURE.USER_NO_HOME}
    },

    REMOTECONTROLL : {
        USEREQUIPMENT_NOT_EXIST : {'code' : 4001, 'codetxt' : Lang.error.REMOTECONTROLL.USEREQUIPMENT_NOT_EXIST}
    }
};
