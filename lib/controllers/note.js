var formidable = require('formidable'),
    notes = require('../repository/notes'),
    commons = require('../commons');

var list = function (req, res) {
    var login = req.session.user_login;
    
    notes.user(login).list(function (err, noteList) {
        if (err) {
            commons.handleError(res, err, 'Problems listing note\'s user!');
            return;
        }
        commons.sendRespOk(res, noteList);
    });
};

var addNote = function (req, res) {
    var login = req.session.user_login,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        notes.user(login).add(fields.name, function (err, note) {
            if (err) {
                commons.handleError(res, err, 'Problems adding note!');
                return;
            }
            commons.sendRespOk(res, note);
        });
    });
};

var get = function (req, res) {
    var login = req.session.user_login,
        id = req.params.id;
    
    notes.user(login).note(id).get(function (err, note) {
        if (err) {
            commons.handleError(res, err, 'Problems getting this note!');
            return;
        }
        
        if (note) {
            commons.sendRespOk(res, note);
        } else {
            commons.sendRespNok(res, 'Note not found for this user!');
        }
    });
};

var rename = function (req, res) {
    var login = req.session.user_login,
        id = req.params.id,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, f) {
        notes.user(login).note(id).name(f.newName).save(function (err) {
            if (err) {
                commons.handleError(res, err, 'Problems renaming this note!');
                return;
            }
            commons.sendRespOk(res);
        });
    });
};

var remove = function (req, res) {
    var login = req.session.user_login,
        idNote = req.params.id;
    
    notes.user(login).note(idNote).remove(function (err) {
        if (err) {
            commons.handleError(res, err, 'Problems deleting this note!');
            return;
        }
        commons.sendRespOk(res);
    });
};

module.exports = function (app) {
    app.resource('/list', {
        'get': list
    });
    app.resource('/add', {
        'post': addNote
    });
    app.resource('/id/:id', {
        'get': get,
        'post': rename,
        'delete': remove
    });
};