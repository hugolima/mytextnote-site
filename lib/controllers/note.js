var formidable = require('formidable'),
    notes = require('../repository/notes'),
    commons = require('../commons');

var list = function (req, res) {
    var login = req.session.user_login;
    
    notes.user(login).list(function (noteList) {
        commons.sendRespOk(res, noteList);
    });
};

var addNote = function (req, res) {
    var login = req.session.user_login,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).add(fields.name).save(function (note) {
            if (note) {
                commons.sendRespOk(res, note);
            } else {
                commons.sendRespNok(res, 'Problems adding this new note!');
            }
        });
    });
};

var get = function (req, res) {
    var login = req.session.user_login,
        id = req.params.id;
    
    notes.user(login).note(id).get(function (note) {
        if (note) {
            commons.sendRespOk(res, note);
        } else {
            commons.sendRespNok(res, 'Note not found for this user!');
        }
    });
};

var update = function (req, res) {
    var login = req.session.user_login,
        id = req.params.id,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).note(id).content(fields.content).save(function (err) {
            if (!err) {
                commons.sendRespOk(res);
            } else {
                commons.sendRespNok(res, 'Problems updating this note!');
            }
        });
    });
};

var remove = function (req, res) {
    var login = req.session.user_login,
        idNote = req.params.id;
    
    notes.user(login).note(idNote).remove(function (err) {
        if (!err) {
            commons.sendRespOk(res);
        } else {
            commons.sendRespNok(res, 'Problems deleting this note!');
        }
    });
};

module.exports = function (app) {
    app.resource('/', {
        'get': list
    });
    app.resource('/add', {
        'post': addNote
    });
    app.resource('/note/:id', {
        'get': get,
        'post': update,
        'delete': remove
    });
};