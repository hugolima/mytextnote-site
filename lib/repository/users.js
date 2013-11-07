var User = require('../models').User,
    commons = require('../commons');

var validateEmail = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

var validateUserData = function (login, userData) {
    var error = 0;
    
    if (!userData.name || userData.name.trim() === '') {
        commons.log('User name is required: ' + login);
        error++;
    }
    
    if (!userData.email || userData.email.trim() === '') {
        commons.log('User email is required: ' + login);
        error++;
    } else if (!validateEmail(userData.email)) {
        commons.log('User email is invalid: ' + login + ' - ' + userData.email);
        error++;
    }
    
    if (userData.pwd) {
        if (userData.pwd.replace(/\s+/g,'').length < 4) {
            error++;
            commons.log('User password has less than 4 digits: ' + login);
        }
        else if (userData.pwd !== userData.confPwd) {
            error++;
            commons.log('The confirmation password doesn\'t match with the password provided: ' + login);
        }
    }
    
    if (error) {
        return false;
    }
    
    return true;
};

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
        
        this.get = function (callback) {
            User.findOne({ 'login': this.login }, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (user) {
                    callback(null, user);
                    return;
                }
                
                callback(new Error('User not found: ' + login));
            });
        };
        
        this.update = function (newUserData, callback) {
            if (!validateUserData(this.login, newUserData)) {
                process.nextTick(function() {
                    callback(new Error('User data not valid!'));
                });
                return;
            }
            
            User.findOne({ 'login': this.login }, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (user) {
                    user.name = newUserData.name;
                    user.email = newUserData.email;
                    
                    if (newUserData.pwd) {
                        user.password = commons.hashPassword(newUserData.pwd);
                    }
                    
                    user.save(function (err) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback();
                    });
                    
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