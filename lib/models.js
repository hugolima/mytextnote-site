var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NoteSchema = new Schema({
    name : String,
    desc : String,
    content : String
});

NoteSchema.virtual('link').get(function () {
    return '/notes/get/' + this._id;
});

var UserSchema = new Schema({
    login : { type: String, unique: true },
    password : String,
    name  : String,
    email : String,
    notes : [NoteSchema]
});

module.exports.User = mongoose.model('User', UserSchema);
module.exports.Note = mongoose.model('Note', NoteSchema);