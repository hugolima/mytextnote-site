var User = require('../models').User,
    Note = require('../models').Note;

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

var createNewNote = function (name, desc) {
    
    if (name.length > 40) {
        name = name.slice(0, 40);
    }
    
    var note = new Note({
        'name': name,
        'desc': desc,
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
    
    list: function (fn) {
        User.findOne({ 'login': this.login }, function (err, user) {
            fn(createListObjWithLinkAndName(user.notes));
        });
    },
    
    add: function (name, desc) {
        var note = createNewNote(name, desc),
            login = this.login;
        
        this.save = function (fn) {
            User.findOne({ 'login': this.login }, function (err, user) {
                if (note.name && note.name.trim() !== '') {
                    user.notes.push(note);
                    user.save(function (err) {
                        if (!err) {
                            console.log('### new NOTE: ' + login + ' - ' +  note.name);
                            fn(createObj(note.link, note.name));
                        } else {
                            console.log(err);
                            fn();
                        }
                    });
                } else {
                    fn();
                }
            });
        };
        
        return this;
    },
    
    note: function (id) {
        this.get = function (fn) {
            User.findOne({ 'login': this.login }, function (err, user) {
                fn(user.notes.id(id));
            });
        };
        
        this.content = function (content) {
            this.save = function (fn) {
                User.findOne({ 'login': this.login }, function (err, user) {
                    user.notes.id(id).content = content;
                    user.save(function (err) {
                        if (!err) {
                            fn();
                        } else {
                            console.log(err);
                            fn(err);
                        }
                    });
                });
            };
            
            return this;
        };
        
        return this;
    }
};

module.exports = noteRepository;