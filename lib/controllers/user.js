var formidable = require('formidable'),
    users = require('../repository/users'),
    commons = require('../commons');

var login = function (req, res) {
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        var login = fields.login,
            pass = fields.password;
            
        users.get(login).authenticate(pass, function (ok) {
            if (ok) {
                req.session.user_login = login;
                commons.sendRespOk(res, {'nextPage': '/main.html'});
            } else {
                commons.sendRespNok(res, 'The username or password is incorrect');
            }
        });
    });
};

var logout = function (req, res) {
    req.session.user_login = undefined;
    req.session.destroy();
    
    commons.sendToLoginPage(res);
};

var getName = function (req, res) {
    var login = req.session.user_login;
    
    users.get(login).getName(function (name) {
        if (name) {
            commons.sendRespOk(res, name);
        } else {
            commons.sendRespNok(res, 'Problems getting the user name!');
        }
    });
};

module.exports = function (app) {
    app.resource('/login', {
        'post': login
    });
    app.resource('/logout', {
        'get': logout
    });
    app.resource('/name', {
        'get': getName
    });
};