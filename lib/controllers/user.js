var formidable = require('formidable'),
    users = require('../repository/users'),
    commons = require('../commons');

var login = function (req, res) {
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        var login = fields.login,
            pass = fields.password;
            
        users.user(login).authenticate(pass, function (err, ok) {
            if (err) {
                commons.handleError(res, err, 'Problems authenticating user!');
                return;
            }
            
            if (ok) {
                req.session.user_login = login;
                commons.sendRespOk(res, {'nextPage': '/main.html'});
                return;
            }
            
            commons.sendRespNok(res, 'The username or password is incorrect');
        });
    });
};

var logout = function (req, res) {
    delete req.session.user_login;
    req.session.destroy();
    
    commons.sendToLoginPage(res);
};

var getName = function (req, res) {
    var login = req.session.user_login;
    
    users.user(login).getName(function (err, name) {
        if (err) {
            commons.handleError(res, err, 'Problems getting the user name!');
            return;
        }
        commons.sendRespOk(res, name);
    });
};

var getUser = function (req, res) {
    var login = req.session.user_login;
    
    users.user(login).get(function (err, user) {
        if (err) {
            commons.handleError(res, err, 'Problems getting the user!');
            return;
        }
        commons.sendRespOk(res, user);
    });
};

var update = function (req, res) {
    var login = req.session.user_login,
        form = new formidable.IncomingForm();
    
    form.parse(req, function (error, fields) {
        var userData = {
            'name': fields.name,
            'email': fields.email,
            'pwd': fields.pwd,
            'confPwd': fields.confPwd
        };
        
        users.user(login).update(userData, function (err) {
            if (err) {
                commons.handleError(res, err, 'Problems updating user data!');
                return;
            }
            commons.sendRespOk(res);
        });
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
    app.resource('/data', {
        'get': getUser
    });
    app.resource('/update', {
        'post': update
    });
};