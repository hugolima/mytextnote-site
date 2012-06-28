var config = {};

config.mongo = {};
config.web = {};
config.redis = {};

config.mongo.url = process.env.MONGOLAB_URI || 'mongodb://localhost/mytextnote';

config.web.port = process.env.PORT || 3000;
config.web.sessSecret = process.env.MYTEXTNOTE_SESSION_SECRET || 'test';
config.web.sessMaxAge = 300000;

if (process.env.REDISTOGO_URL) {
    var redisUrl = require('url').parse(process.env.REDISTOGO_URL);
    config.redis.port = redisUrl.port;
    config.redis.host = redisUrl.hostname;
    config.redis.pass = redisUrl.auth.split(':')[1];
} else {
    config.redis.port = 6379;
    config.redis.host = 'localhost';
}

config.passSalt = process.env.MYTEXTNOTE_PASS_SALT || 'test';

module.exports = config;