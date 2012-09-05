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
    if (name.length > 40) {
        return name.slice(0, 40);
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
    
    add: function (name) {
        var note = createNewNote(name),
            login = this.login;
        
        this.save = function (callback) {
            User.findOne({ 'login': login }, function (err, user) {
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
                        
                        commons.log('New NOTE: ' + login + ' - ' +  note.name);
                        callback(null, createObj(note.link, note.name));
                    });
                    return;
                }
                
                callback(new Error('Invalid name of note: ' + note.name));
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