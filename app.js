var connect = require('connect'),
    resource = require('resource-router'),
    RedisStore = require('connect-redis')(connect),
    config = require('./lib/config');

var MyTextNote = (function () {
    
    var init = function init() {
        require('./lib/init')();
        
        var sessStore = new RedisStore({
                port: config.redis.port,
                host: config.redis.host,
                pass: config.redis.pass
            }),
            server = connect()
                .use(connect.favicon())
                .use(connect.logger({ buffer: true }))
                .use(connect.cookieParser())
                .use(connect.session({
                    store: sessStore,
                    secret: config.web.sessSecret,
                    cookie: { maxAge: config.web.sessMaxAge }
                }))
                .use(require('./lib/middleware').sessionSecurity)
                .use('/session', resource(require('./lib/controllers/session')))
                .use('/user', resource(require('./lib/controllers/user')))
                .use('/notes', resource(require('./lib/controllers/note')))
                .use(connect.static(__dirname + '/static'))
                .listen(config.web.port);
        
        require('./lib/controllers/websocket').init(server, sessStore);
    };
    
    return {
        'init': init
    };
}());

MyTextNote.init();