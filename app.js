var connect = require('connect'),
    http = require('http'),
    resource = require('resource-router'),
    RedisStore = require('connect-redis')(connect),
    config = require('./lib/config'),
    staticDir = __dirname + '/static';

var MyTextNote = (function () {
    
    var init = function () {
        require('./lib/init')();
        
        var server = connect()
            .use(connect.favicon())
            .use(connect.logger({ buffer: true }))
            .use(connect.cookieParser())
            .use(connect.session({
                store: new RedisStore({
                    port: config.redis.port,
                    host: config.redis.host,
                    pass: config.redis.pass
                }),
                secret: config.web.sessSecret,
                cookie: { maxAge: config.web.sessMaxAge }
            }))
            .use(require('./lib/middleware').sessionSecurity)
            .use('/session', resource(require('./lib/controllers/session')))
            .use('/user', resource(require('./lib/controllers/user')))
            .use('/notes', resource(require('./lib/controllers/note')))
            .use(connect.static(staticDir))
            .listen(config.web.port);
    };
    
    return {"init": init};
}());

MyTextNote.init();