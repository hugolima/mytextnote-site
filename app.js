var connect = require('connect'),
    http = require('http'),
    resource = require('resource-router'),
    mongoose = require('mongoose'),
    RedisStore = require('connect-redis')(connect),
    config = require('./lib/config');

var staticDir = __dirname + '/static';
mongoose.connect(config.mongo.url);

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
    .use('/files', resource(require('./lib/controllers/file')))
    .listen(config.web.port);