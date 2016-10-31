var ResponseUtil = module.exports;

ResponseUtil.resp = function(code, data) {
    if (!!code.code) {
        var ret_code = code.code;
        var ret_codetxt = code.codetxt;
        var ret_data = data;
        return {
            code: ret_code,
            codetxt: ret_codetxt,
            data: ret_data
        };
    } else {
        return {
            code: 9999,
            codetxt: 'program error, need programers fixing bugs'
        };
    }
};
