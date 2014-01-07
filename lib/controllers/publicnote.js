var notes = require('../repository/notes'),
    commons = require('../commons');

var get = function (req, res) {
    var login = req.params.login,
        code = req.params.code;
        
    notes.user(login).code(code).find(function (err, note) {
        if (err) {
            commons.handleError(res, err, 'Problems getting this public note!');
            return;
        }
        
        if (note && note.public === true) {
            commons.sendRespOk(res, note);
        } else {
            commons.sendRespNok(res, 'It was not possible to get this note!');
        }
    });
};

module.exports = function (app) {
    app.resource('/:login/:code', {
        'get': get
    });
};