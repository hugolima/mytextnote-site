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

var findUser = function (login, callback) {
    User.findOne({ 'login': login }, function (err, user) {
        if (err) {
            callback(err);
            return;
        }
        
        if (user) {
            callback(null, user);
            return;
        }
        
        var error = new commons.ObjectNotFoundError('User not found: ' + login);
        commons.log(error);
        
        callback(error);
    });
};

var userRepository = {
    login : '',
    
    user : function (login) {
        this.login = login;
        
        this.getName = function (callback) {
            findUser(this.login, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
                callback(null, user.name);
            });
        };
        
        this.get = function (callback) {
            findUser(this.login, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
                callback(null, user);
            });
        };
        
        this.update = function (newUserData, callback) {
            if (!validateUserData(this.login, newUserData)) {
                process.nextTick(function() {
                    callback(new Error('User data not valid!'));
                });
                return;
            }
            
            findUser(this.login, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
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
            });
        };
        
        this.authenticate = function (password, callback) {
            findUser(this.login, function (err, user) {
                if (err) {
                    if (err instanceof commons.ObjectNotFoundError) {
                        callback(null, false);
                    } else {
                        callback(err);
                    }
                    return;
                }
                
                if (user.password === commons.hashPassword(password)) {
                    commons.log('User authenticated: ' + user.login);
                    callback(null, true);
                    return;
                }
                
                commons.log('Invalid password for user: ' + user.login);
                callback(null, false);
            });
        };
        
        return this;
    }
};

module.exports = userRepository;