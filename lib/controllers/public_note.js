var notes = require('../repository/notes'),
    commons = require('../commons');

var get = function (req, res) {
    var login = req.params.login,
        id = req.params.id;
    
    notes.user(login).note(id).get(function (err, note) {
        if (err) {
            commons.handleError(res, err, 'Problems getting this note!');
            return;
        }
        
        if (note) {
            connect.utils.static.send()
            commons.sendRespOk(res, note);
        } else {
            commons.sendRespNok(res, 'Note not found for this user!');
        }
    });
};

module.exports = function (app) {
    app.resource('/', {
        'get': get
    });
};