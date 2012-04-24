var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var FileSchema = new Schema({
    name : String,
    desc : String,
    content : String
});


FileSchema.virtual('link').get(function () {
    return '/files/get/' + this._id;
});


var UserSchema = new Schema({
    login : { type: String, unique: true },
    password : String,
    name  : String,
    email : String,
    files : [FileSchema]
});


module.exports.File = mongoose.model('File', FileSchema);
module.exports.User = mongoose.model('User', UserSchema);