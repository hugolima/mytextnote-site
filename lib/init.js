var config = require('./config'),
    mongoose = require('mongoose');

var init = function () {
    mongoose.connect(config.mongo.url);    
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
    
    return true;
};

module.exports = init;