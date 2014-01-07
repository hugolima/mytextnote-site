var User = require('../models').User,
    Note = require('../models').Note,
    commons = require('../commons');

var createObj = function (id, name) {
    var obj = {
        'id': id,
        'name': name
    };
    
    return obj;
};

var createListWithIdAndName = function (notes) {
    var i, note, newNotes = [];
    
    for (i = 0; i < notes.length; i += 1) {
        note = createObj(notes[i]._id, notes[i].name);
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
            
            callback(null, createListWithIdAndName(user.notes));
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
                    callback(null, createObj(note._id, note.name));
                });
                return;
            }
            
            callback(new Error('Invalid name of note: ' + note.name));
        });
    },
    
    code: function (code) {
        this.find = function (callback) {
            var noteID = commons.getNoteID(code) ;
            
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
        
        return this;
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