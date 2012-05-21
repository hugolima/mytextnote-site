var commons = require('./commons');

var sessSecurity = function (req, res, next) {
    
    if (req.url !== '/' && req.url !== '/user/login' && !req.url.match('^/public/') && !req.session.user_login) {
        if (req.headers['x-requested-with']) {
            commons.sendNotAuthenticated(res);
        } else {
            commons.sendToLoginPage(res);
        }
    } else {
        if (req.url === '/' && req.session.user_login) {
            commons.sendRedirect(res, '/main.html');
            return;
        }
        next();
    }
};

var uncaughtErrorHandler = function (req, res, next) {
    
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', function (err) {
        console.log('### Uncaught Error: ' + err);
        commons.sendRespError(res, 'Error processing request.');
    });
    
    next();
};

module.exports.sessionSecurity = sessSecurity;
module.exports.uncaughtErrorHandler = uncaughtErrorHandler;