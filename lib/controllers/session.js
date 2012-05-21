var commons = require('../commons');

var check = function (req, res) {
    commons.sendRespOk(res);
};

module.exports = function (app) {
    app.resource('/check', {
        'get': check
    });
};