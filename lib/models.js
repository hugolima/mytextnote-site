var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NoteSchema = new Schema({
    name : String,
    content : String,
    public : { 'type': Boolean, 'default': false },
    created : { 'type': Date, 'default': Date.now },
    updated : Date
});

NoteSchema.virtual('link').get(function () {
    return '/notes/note/' + this._id;
});

var UserSchema = new Schema({
    login : { type: String, unique: true },
    password : String,
    name  : String,
    email : String,
    created : {'type': Date, 'default': Date.now},
    notes : [NoteSchema]
});

module.exports.User = mongoose.model('User', UserSchema);
module.exports.Note = mongoose.model('Note', NoteSchema);