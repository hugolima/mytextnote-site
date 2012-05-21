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
        if (note) {
            commons.sendRespOk(res, note);
        } else {
            commons.sendRespNok(res, 'Note not found for this user!');
        }
    });
};

var update = function (req, res) {
    var login = req.session.user_login,
        idNote = req.params.id,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).note(idNote).content(fields.content).save(function (err) {
            if (!err) {
                commons.sendRespOk(res);
            } else {
                commons.sendRespNok(res, 'Problems updating this note!');
            }
        });
    });
};

var newNote = function (req, res) {
    var login = req.session.user_login,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).add(fields.name, fields.desc).save(function (note) {
            if (note) {
                commons.sendRespOk(res, note);
            } else {
                commons.sendRespNok(res, 'Problems adding this new note!');
            }
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