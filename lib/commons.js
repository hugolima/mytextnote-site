var crypto = require('crypto'),
    loginPage = '/public/login.html';

var sendResp = function (res, respObj) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(respObj));
    res.end();
};

var createRespData = function (data, ok, msg) {
    return {
        success: ok || false,
        message: msg || '',
        object: data || {}
    };
};

var createRespNotAuthenticated = function () {
    return {
        notAuthenticated: true,
        loginPage: loginPage
    };
};

var sha1 = function (str, encoding) {
    return crypto
        .createHash('sha1')
        .update(str)
        .digest(encoding || 'hex');
};

var commons = {};

commons.sendToLoginPage = function (res) {
    res.statusCode = 302;
    res.setHeader('Location', loginPage);
    res.end();
};

commons.sendNotAuthenticated = function (res) {
    var respObj = createRespNotAuthenticated();
    sendResp(res, respObj);
};

commons.sendRespOk = function (res, data) {
    var respObj = createRespData(data, true);
    sendResp(res, respObj);
};

commons.sendRespNok = function (res, msg) {
    var respObj = createRespData('', false, msg);
    sendResp(res, respObj);
};

commons.hashPassword = function (str) {
    var salt = 'EMC_#0$_cért.135790_xäFF';
    return sha1(salt + str);
};

module.exports = commons;