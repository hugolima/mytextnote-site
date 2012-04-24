var formidable = require('formidable'),
    files = require('../repository/files'),
    commons = require('../commons');

var list = function (req, res) {
    var login = req.session.user_login;
    
    files.user(login).list(function (fileList) {
        commons.sendRespOk(res, fileList);
    });
};

var get = function (req, res) {
    var login = req.session.user_login,
        idFile = req.params.id;
    
    files.user(login).file(idFile).get(function (file) {
        commons.sendRespOk(res, file);
    });
};

var update = function (req, res) {
    var login = req.session.user_login,
        idFile = req.params.id,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        files.user(login).file(idFile).content(fields.content).save(function () {
            commons.sendRespOk(res);
        });
    });
};

var newFile = function (req, res) {
    var login = req.session.user_login,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        files.user(login).add(fields.name, fields.desc).save(function (file) {
            commons.sendRespOk(res, file);
        });
    });
};

module.exports = function (app) {
    app.resource('/', {
        'get': list
    });
    app.resource('/add', {
        'post': newFile
    });
    app.resource('/get/:id', {
        'get': get,
        'post': update
    });
};