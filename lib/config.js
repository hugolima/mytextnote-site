var config = {};

config.mongo = {};
config.web = {};
config.redis = {};

config.mongo.url = 'mongodb://localhost/mytextnote';

config.web.port = 3000;
config.web.sessSecret = 'ECIDfù0fuhf_Gddffä093211D7_48H00ff@xxFF';
config.web.sessMaxAge = 50000;

if (process.env.REDISTOGO_URL) {
    var rtg = require('url').parse(process.env.REDISTOGO_URL);
    config.redis.port = rtg.port;
    config.redis.host = rtg.hostname;
    config.redis.pass = rtg.auth.split(":")[1];
} else {
    config.redis.port = 6379;
    config.redis.host = 'localhost';
}

module.exports = config;