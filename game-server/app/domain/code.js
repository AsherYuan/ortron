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
        MOBILE_FORMAT_ERROR: {'code': 2006, 'codetxt': Lang.error.ACCOUNT.MOBILE_FORMAT_ERROR},
        VERIFY_ERROR: {'code': 2007, 'codetxt': Lang.error.ACCOUNT.VERIFY_ERROR}
    },

    STRUCTURE: {
        USER_NO_HOME: {'code': 3001, 'codetxt': Lang.error.STRUCTURE.USER_NO_HOME},
        HOME_EXIST: {'code':3002, 'codetxt': Lang.error.STRUCTURE.HOME_EXIST},
        HOME_NOT_EXIST: {'code':3003, 'codetxt': Lang.error.STRUCTURE.HOME_NOT_EXIST},
        CENTERBOX_SERIAL_NO_EXIST : {'code':3004, 'codetxt':Lang.error.STRUCTURE.CENTERBOX_SERIAL_NO_EXIST},
        CENTERBOX_OCCUPIED : {'code':3005, 'codetxt':Lang.error.STRUCTURE.CENTERBOX_OCCUPIED},
        CENTERBOX_INITED : {'code':3006, 'codetxt':Lang.error.STRUCTURE.CENTERBOX_INITED},
        CENTERBOX_NOT_EXIST : {'code':3007, 'codetxt':Lang.error.STRUCTURE.CENTERBOX_NOT_EXIST},
        LAYER_EXIST: {'code':3008, 'codetxt': Lang.error.STRUCTURE.LAYER_EXIST},
        LAYER_NOT_EXIST: {'code':3009, 'codetxt': Lang.error.STRUCTURE.LAYER_NOT_EXIST},
        LAYER_NOT_BINDED: {'code':3010, 'codetxt': Lang.error.STRUCTURE.LAYER_NOT_BINDED},
        TERMINAL_ALREADY_EXIST: {'code':3010, 'codetxt': Lang.error.STRUCTURE.TERMINAL_ALREADY_EXIST}
    },

    REMOTECONTROLL : {
        USEREQUIPMENT_NOT_EXIST : {'code' : 4001, 'codetxt' : Lang.error.REMOTECONTROLL.USEREQUIPMENT_NOT_EXIST}
    },

    ESTATE: {
        USERNAME_IS_BLANK: {'code': 5001, 'codetxt': Lang.error.ESTATE.USERNAME_IS_BLANK},
        PASSWORD_IS_BLANK: {'code': 5002, 'codetxt': Lang.error.ESTATE.PASSWORD_IS_BLANK},
        MANGAER_NOT_EXIST: {'code': 5003, 'codetxt': Lang.error.ESTATE.MANAGER_NOT_EXIST},
        PASSWORD_NOT_CORRECT: {'code': 5004, 'codetxt': Lang.error.ESTATE.PASSWORD_NOT_CORRECT}
    }
};
