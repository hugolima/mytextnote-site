var config = {};

config.mongo = {};
config.web = {};
config.redis = {};

config.mongo.url = process.env.MONGOLAB_URI || 'mongodb://localhost/mytextnote';

config.web.port = process.env.PORT || 3000;
config.web.sessSecret = 'ECIDfù0fuhf_Gddffä093211D7_48H00ff@xxFF';
config.web.sessMaxAge = 600000;

if (process.env.REDISTOGO_URL) {
    var redisUrl = require('url').parse(process.env.REDISTOGO_URL);
    config.redis.port = redisUrl.port;
    config.redis.host = redisUrl.hostname;
    config.redis.pass = redisUrl.auth.split(":")[1];
} else {
    config.redis.port = 6379;
    config.redis.host = 'localhost';
}

module.exports = config;