var io = require('socket.io'),
    commons = require('../commons'),
    parseCookie = require('connect').utils.parseCookie,
    notes = require('../repository/notes'),
    getAuthenticatedUserLogin,
    noteContent;

getAuthenticatedUserLogin = function (sessStore, sid, callback) {
    sessStore.get(sid, function (err, data) {
        if (err || !data || !data.user_login) {
            if (err) {
                commons.log('Error getting user: ' + err);
            }
            callback(new Error('Problems getting the authenticated user!'));
            return;
        }
        
        callback(null, data.user_login);
    });
};

noteContent = function (ioSocket, sessStore) {
    var noteContentSocket = ioSocket
        .of('/note')
        .on('connection', function (socket) {
            socket.on('updateContent', function (data) {
                var id = data.id,
                    content = data.content,
                    eventID = data.eventID,
                    sid = parseCookie(socket.handshake.headers.cookie)['connect.sid'];
                    
                getAuthenticatedUserLogin(sessStore, sid, function (err, login) {
                    if (err) {
                        socket.emit('error', {'eventID': eventID, 'msg': 'Problems getting the authenticate user!'});
                        return;
                    }
                    
                    notes.user(login).note(id).content(content).save(function (err) {
                        if (err) {
                            commons.log('Error updating note content: ' + err);
                            socket.emit('error', {'eventID': eventID, 'msg': 'Problems updating this note!'});
                            return;
                        }
                        
                        socket.emit('success', eventID);
                    });
                });
            });
            
            socket.on('disconnect', function () {
                commons.log('Connection of "/note" Socket finalized.');
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
    
    noteContent(io, sessStore);
};