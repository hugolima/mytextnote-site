var formidable = require('formidable'),
    notes = require('../repository/notes'),
    commons = require('../commons');

var list = function (req, res) {
    var login = req.session.user_login;
    
    notes.user(login).list(function (noteList) {
        commons.sendRespOk(res, noteList);
    });
};

var get = function (req, res) {
    var login = req.session.user_login,
        idNote = req.params.id;
    
    notes.user(login).note(idNote).get(function (note) {
        commons.sendRespOk(res, note);
    });
};

var update = function (req, res) {
    var login = req.session.user_login,
        idNote = req.params.id,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).note(idNote).content(fields.content).save(function () {
            commons.sendRespOk(res);
        });
    });
};

var newNote = function (req, res) {
    var login = req.session.user_login,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).add(fields.name, fields.desc).save(function (note) {
            commons.sendRespOk(res, note);
        });
    });
};

module.exports = function (app) {
    app.resource('/', {
        'get': list
    });
    app.resource('/add', {
        'post': newNote
    });
    app.resource('/get/:id', {
        'get': get,
        'post': update
    });
};