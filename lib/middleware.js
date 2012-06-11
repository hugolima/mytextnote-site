var commons = require('./commons');

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

module.exports.sessionSecurity = sessSecurity;