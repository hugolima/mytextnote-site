var commons = require('./commons'),
    config = require('./config'),
    notes = require('./repository/notes'),
    send = require('connect').static.send,
    notePageOptions = {root: config.staticDir, path: '/public/note.html', redirect: false};

var sessSecurity = function (req, res, next) {
    
    if (req.url !== '/' && req.url !== '/user/login' && !req.url.match('^/public/') && !req.session.user_login) {
        if (req.headers['x-requested-with']) {
            commons.sendNotAuthenticated(res);
        } else {
            commons.sendToLoginPage(res);
        }
        return;
    }
    
    if (req.url === '/' && req.session.user_login) {
        commons.sendRedirect(res, '/main.html');
        return;
    }
    
    next();
};

var showPublicNotePage = function (req, res, next) {
    var login, noteID, notFoundMsg = 'User or Note not found';
    
    if (req.url.split('/').length === 3
            && req.url !== '/'
            && !req.url.match('^/public/')
            && !req.url.match('^/session/')
            && !req.url.match('^/user/')
            && !req.url.match('^/note/')
            && !req.url.match('.html$')) {
        
        login = req.url.split('/')[1];
        code = req.url.split('/')[2];
        
        notes.user(login).code(code).find(function (err, note) {
            if (err) {
                commons.log('Error trying to get a public note [' + login + ', ' + code + ']: ' + err.message);
                commons.send404(res, notFoundMsg);
                return;
            }
            
            if (note && note.public === true) {
                send(req, res, next, notePageOptions);
            } else {
                commons.send404(res, notFoundMsg);
            }
        });
        
        return;
    }
    
    next();
};

module.exports.sessionSecurity = sessSecurity;
module.exports.showPublicNotePage = showPublicNotePage;