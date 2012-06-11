var config = require('./config'),
    mongoose = require('mongoose'),
    commons = require('./commons');

var init = function () {
    
    process.on('uncaughtException', function (err) {
        commons.log('Uncaught Error: ' + err);
    });
    
    mongoose.connect(config.mongo.url);
    
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
};

module.exports = init;