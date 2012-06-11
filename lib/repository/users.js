var User = require('../models').User,
    commons = require('../commons');

var userRepository = {
    login: '',
    
    user : function (login) {
        this.login = login;
        
        this.getName = function (callback) {
            User.findOne({ 'login': this.login }, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (user) {
                    callback(null, user.name);
                    return;
                }
                
                callback(new Error('User not found: ' + login));
            });
        };
        
        return this;
    },
    
    authenticate : function (password, callback) {
        User.findOne({ 'login': this.login }, function (err, user) {
            if (err) {
                callback(err);
                return;
            }
            
            if (user && user.password === commons.hashPassword(password)) {
                commons.log('User authenticated: ' + user.login);
                callback(null, true);
                return;
            }
            
            callback(null, false);
        });
    }
};

module.exports = userRepository;