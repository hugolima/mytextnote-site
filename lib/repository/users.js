var User = require('../models').User,
    commons = require('../commons');

var userRepository = {
    login: '',
    
    get : function (login) {
        this.login = login;
        return this;
    },
    
    authenticate : function (password, fn) {
        User.findOne({ 'login': this.login }, function (err, user) {
            if (user && user.password === commons.hashPassword(password)) {
                console.log('### user authenticated: ' + user.login);
                fn(true);
            } else {
                fn(false);
            }
        });
    }
};

module.exports = userRepository;