var connect = require('connect'),
    http = require('http'),
    resource = require('resource-router'),
    RedisStore = require('connect-redis')(connect),
    config = require('./lib/config'),
    staticDir = __dirname + '/static';

require('./lib/init')();

var server = connect()
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
    .use(connect.logger({ buffer: true }))
    .use(require('./lib/middleware').sessionSecurity)
    .use(connect.static(staticDir))
    .use('/user', resource(require('./lib/controllers/user')))
    .use('/notes', resource(require('./lib/controllers/note')))
    .listen(config.web.port);