var User = require('../models').User,
    File = require('../models').File;

var createObj = function (link, name) {
    var obj = {
        'link': link,
        'name': name
    };
    
    return obj;
};

var createListObjWithLinkAndName = function (files) {
    var i, file, newFiles = [];
    
    for (i = 0; i < files.length; i += 1) {
        file = createObj(files[i].link, files[i].name);
        newFiles.push(file);
    }
    
    return newFiles;
};

var createNewFile = function (name, desc) {
    var file = new File({
        'name': name,
        'desc': desc,
        'content': ''
    });
    
    return file;
};

var fileRepository = {
    login: '',
    
    user: function (login) {
        this.login = login;
        return this;
    },
    
    list: function (fn) {
        User.findOne({ 'login': this.login }, function (err, user) {
            fn(createListObjWithLinkAndName(user.files));
        });
    },
    
    add: function (name, desc) {
        var file = createNewFile(name, desc),
            login = this.login;
        
        this.save = function (fn) {
            User.findOne({ 'login': this.login }, function (err, user) {
                if (file.name) {
                    user.files.push(file);
                    user.save(function (err) {
                        if (!err) {
                            console.log('new file: ' + login + ' - ' +  file.name);
                            fn(createObj(file.link, file.name));
                        } else {
                            console.log(err);
                            fn();
                        }
                    });
                }
            });
        };
        
        return this;
    },
    
    file: function (id) {
        this.get = function (fn) {
            User.findOne({ 'login': this.login }, function (err, user) {
                fn(user.files.id(id));
            });
        };
        
        this.content = function (content) {
            this.save = function (fn) {
                User.findOne({ login: this.login }, function (err, user) {
                    user.files.id(id).content = content;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                fn();
            };
            
            return this;
        };
        
        return this;
    }
};

module.exports = fileRepository;