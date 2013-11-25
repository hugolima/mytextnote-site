var User = require('../models').User,
    Note = require('../models').Note,
    commons = require('../commons');

var createObj = function (link, name) {
    var obj = {
        'link': link,
        'name': name
    };
    
    return obj;
};

var createListObjWithLinkAndName = function (notes) {
    var i, note, newNotes = [];
    
    for (i = 0; i < notes.length; i += 1) {
        note = createObj(notes[i].link, notes[i].name);
        newNotes.push(note);
    }
    
    return newNotes;
};

var cropName = function (name) {
    if (name.length > 60) {
        return name.slice(0, 60);
    }
    
    return name;
};

var createNewNote = function (name) {
    var note = new Note({
        'name': cropName(name),
        'content': ''
    });
    
    return note;
};

var noteRepository = {
    login: '',
    
    user: function (login) {
        this.login = login;
        return this;
    },
    
    list: function (callback) {
        User.findOne({ 'login': this.login }, function (err, user) {
            if (err) {
                callback(err);
                return;
            }
            
            callback(null, createListObjWithLinkAndName(user.notes));
        });
    },
    
    add: function (name, callback) {
        var note = createNewNote(name),
            varLogin = this.login;
        
        User.findOne({ 'login': this.login }, function (err, user) {
            if (err) {
                callback(err);
                return;
            }
            
            if (note.name && note.name.trim() !== '') {
                user.notes.push(note);
                user.save(function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    
                    commons.log('New NOTE: ' + varLogin + ' - ' +  note.name);
                    callback(null, createObj(note.link, note.name));
                });
                return;
            }
            
            callback(new Error('Invalid name of note: ' + note.name));
        });
    },
    
    note: function (id) {
        this.get = function (callback) {
            User.findOne({ 'login': this.login }, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, user.notes.id(id));
            });
        };
        
        this.find = function (callback) {
            var noteID = id;
            
            User.find({ 'login': this.login, 'notes._id': noteID }, function (err, users) {
                if (err) {
                    callback(err);
                    return;
                }
                
                if (users.length === 1) {
                    callback(null, users[0].notes.id(noteID));
                    return;
                }
                
                callback(null, undefined);
            });
        };
        
        this.content = function (content) {
            this.save = function (callback) {
                User.findOne({ 'login': this.login }, function (err, user) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    
                    user.notes.id(id).content = content;
                    user.notes.id(id).updated = Date.now();
                    
                    user.save(function (err) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback();
                    });
                });
            };
            
            return this;
        };
        
        this.name = function (name) {
            this.save = function (callback) {
                User.findOne({ 'login': this.login }, function (err, user) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    
                    if (name && name.trim() !== '') {
                        user.notes.id(id).name = cropName(name);
                        user.notes.id(id).updated = Date.now();
                        user.save(function (err) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            callback();
                        });
                        return;
                    }
                    
                    callback(new Error('Invalid name of note: ' + name));
                });
            };
            
            return this;
        };
        
        this.remove = function (callback) {
            var login = this.login;
            User.findOne({ 'login': this.login }, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                
                var noteName = user.notes.id(id).name;
                user.notes.id(id).remove();
                user.save(function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    
                    commons.log('NOTE removed: ' + login + ' - ' +  noteName);
                    callback();
                });
            });
        };
        
        return this;
    }
};

module.exports = noteRepository;