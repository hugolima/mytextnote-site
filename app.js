var connect = require('connect'),
    resource = require('resource-router'),
    RedisStore = require('connect-redis')(connect),
    config = require('./lib/config');

var MyTextNote = (function () {
    
    var init = function init() {
            require('./lib/init')();
            
            var server = connect()
                .use(connect.favicon())
                .use(connect.logger({ buffer: true }))
                .use(connect.cookieParser())
                .use(connect.session({
                    store: new RedisStore({
                        port: config.redis.port,
                        host: config.redis.host,
                        pass: config.redis.pass
                    }),
                    secret: config.web.sessSecret,
                    cookie: { maxAge: config.web.sessMaxAge }
                }))
                .use(require('./lib/middleware').sessionSecurity)
                .use('/session', resource(require('./lib/controllers/session')))
                .use('/user', resource(require('./lib/controllers/user')))
                .use('/notes', resource(require('./lib/controllers/note')))
                .use(connect.static(__dirname + '/static'))
                .listen(config.web.port);
                
            this.server = server;
        },
        startSocketio = function startSocketio() {
            var io = require('socket.io').listen(this.server),
                noteContentSocket;
            
            noteContentSocket = io
                .of('/noteContentSocket')
                .on('connection', function (socket) {
                    socket.on('updateNoteContent', function (noteInfo) {
                        console.log('Note ID: ' + noteInfo.id);
                        console.log('Note Content: ' + noteInfo.content);
                        //socket.send('Msg received here at server!!');
                    });
                    socket.on('disconnect', function () {
                        console.log('Conections finalized.');
                    });
                });
        };
        
    return {
        server: '',
        'init': init,
        'startSocketio': startSocketio
    };
}());

MyTextNote.init();
MyTextNote.startSocketio();