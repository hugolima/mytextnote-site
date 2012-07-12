var io = require('socket.io'),
    commons = require('../commons'),
    parseCookie = require('connect').utils.parseCookie,
    notes = require('../repository/notes');

var noteContent = function (sessStore) {
    io.of('/noteContentSocket').on('connection', function (socket) {
        socket.on('updateNoteContent', function (noteData) {
            var id = noteData.link.split('/')[3],
                content = noteData.content,
                sid = parseCookie(socket.handshake.headers.cookie)['connect.sid'];
            
            sessStore.get(sid, function (err, data) {
                if (err || !data || !data.user_login) {
                    socket.send('Problems getting the authenticate user!');
                    if (err) { commons.log('Error getting user: ' + err); }
                }
                notes.user(data.user_login).note(id).content(content).save(function (err) {
                    if (err) {
                        socket.send('Problems updating this note!');
                        commons.log('Error updating note content: ' + err);
                    }
                });
            });
        });
        socket.on('disconnect', function () {
            commons.log('Conection finalized.');
        });
    });
};

module.exports.init = function (server, sessStore) {
    io = io.listen(server);
    
    // WebSockets protocol is not yet supported by Heroku.
    // I'm waiting for that to take this code off.
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
    });
    
    noteContent(sessStore);
};