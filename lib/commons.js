var crypto = require('crypto'),
    config = require('./config'),
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

var sha2 = function (str, encoding) {
    return crypto
        .createHash('sha256')
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
        var salt = config.passSalt;
        return sha2(salt + str);
    },
    
    handleError : function (res, err, msgInfo) {
        this.log('ERROR HANDLER: ' + err);
        this.sendRespNok(res, msgInfo);
    },
    
    log : function (msg) {
        console.log('### [MYTEXTNOTE] : ' + msg);
    }
};

module.exports = commons;