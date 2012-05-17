var crypto = require('crypto'),
    initPage = '/';

var sendResp = function (res, respObj) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(respObj));
    res.end();
};

var createRespData = function (data, ok, msg) {
    return {
        'success': ok || false,
        'message': msg || '',
        'object': data || {}
    };
};

var createRespNotAuthenticated = function () {
    return {
        'notAuthenticated': true,
        'loginPage': initPage
    };
};

var sha1 = function (str, encoding) {
    return crypto
        .createHash('sha1')
        .update(str)
        .digest(encoding || 'hex');
};

var commons = {

    sendToLoginPage : function (res) {
        res.statusCode = 302;
        res.setHeader('Location', initPage);
        res.end();
    },
    
    sendNotAuthenticated : function (res) {
        var respObj = createRespNotAuthenticated();
        sendResp(res, respObj);
    },
    
    sendRespError : function (res, errorMsg) {
        res.statusCode = 500;
        res.end(errorMsg);
    },
    
    sendRespOk : function (res, data) {
        var respObj = createRespData(data, true);
        sendResp(res, respObj);
    },
    
    sendRespNok : function (res, msg) {
        var respObj = createRespData('', false, msg);
        sendResp(res, respObj);
    },
    
    sendRedirect : function (res, page) {
        res.statusCode = 302;
        res.setHeader('Location', page);
        res.end();
    },
    
    hashPassword : function (str) {
        var salt = 'EMC_#0$_cért.135790_xäFF';
        return sha1(salt + str);
    }
};

module.exports = commons;