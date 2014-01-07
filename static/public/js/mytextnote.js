window.MYTN = (function () {
    var COMMON, SERVER, SESSION, WEBSOCKET, USER, NOTES;
    
    COMMON = (function () {
        var restoreToDefaults = function () {
            $('.btn').button('reset');
            $('.modal').modal('hide');
            $('.imgLoader').hide();
        };
        
        var showGenericMsg = function() {};
        
        var clickOnEnter = function (idBtn) {
            $(document).on('keypress', function (event) {
                if (event.which === 13) {
                    event.preventDefault();
                    $('#' + idBtn).click();
                }
            });
        };
        
        var clearClickOnEnter = function () {
            $(document).off('keypress');
        };
        
        var iterateLi = function (idUl, fn) {
            $('#' + idUl).find('li').each(fn);
        };
        
        var by = function (name) {
            return function (o, p) {
                var a, b;
                if (typeof o === 'object' && typeof p === 'object' && o && p) {
                    a = typeof o[name] === 'string' ? o[name].toUpperCase() : o[name];
                    b = typeof p[name] === 'string' ? p[name].toUpperCase() : p[name];
                    
                    if (a === b) {
                        return 0;
                    }
                    
                    if (typeof a === typeof b) {
                        return a < b ? -1 : 1;
                    }
                    
                    return typeof a < typeof b ? -1 : 1;
                } else {
                    throw {
                        name: 'Error',
                        message: 'This array does not contains objects'
                    };
                }
            };
        };
        
        var sortObjArray = function (array, propertyName) {
            array.sort( by(propertyName) );
        };
        
        return {
            'restoreToDefaults': restoreToDefaults,
            'showGenericMsg': showGenericMsg,
            'clickOnEnter': clickOnEnter,
            'clearClickOnEnter': clearClickOnEnter,
            'iterateLi': iterateLi,
            'sortObjArray': sortObjArray
        };
    })();
    
    SERVER = (function () {
        var dataType, timeout;
        
        var sendAjax = function (requestObj) {
            var request = $.ajax({
                'type': requestObj.method,
                'url': requestObj.url,
                'data': requestObj.params || {},
                'dataType': dataType || 'json',
                'timeout': timeout || 40000
            });
            request.done( function (data) {
                var error;
                
                if (!data) {
                    return;
                }
                if (data.notAuthenticated) {
                    window.location.replace(data.loginPage);
                    return;
                }
                
                if (!data.success) {
                    if (!requestObj.callbackOnError) {
                        COMMON.restoreToDefaults();
                        COMMON.showGenericMsg(data.message);
                        return;
                    }
                    
                    error = new Error(data.message);
                }
                
                requestObj.callback && requestObj.callback(error, data);
            });
            request.fail( function (jqXHR, textStatus) {
                COMMON.restoreToDefaults();
                COMMON.showGenericMsg('<strong>Oops!</strong> Something went wrong on the system, try again later.');
            });
        };
        
        $(document).ajaxSend(function(event, request, settings) {
            $('.imgLoader').show();
        });
        
        $(document).ajaxComplete(function(event, request, settings) {
            $('.imgLoader').hide();
        });
        
        return {
            'dataType': dataType,
            'timeout': timeout,
            'send': sendAjax
        };
    })();
    
    SESSION = (function () {
        var initCheck = function () {
            var checkSession = function () {
                SERVER.send({
                    method: 'GET',
                    url: '/session/check',
                    callback: function () {
                        setTimeout(checkSession, 145000);
                    }
                });
            };
            
            setTimeout(checkSession, 145000);
        };
        
        return {
            'initCheck': initCheck
        };
    })();
    
    WEBSOCKET = (function () {
        var executeCallback = function (callbacks, eventID, success) {
            if (callbacks[eventID]) {
                callbacks[eventID]( success );
                callbacks[eventID] = undefined;
            }
        };
        
        var resetInactivity = function (timer, socket) {
            var disconnect = function () {
                if (socket.socket) {
                    socket.socket.disconnect();
                    socket.socket = undefined;
                }
            };
            
            window.clearTimeout(timer);
            return window.setTimeout(disconnect, 300000);
        };
        
        var WebSocket = function (url) {
            this.url = url;
            this.socket = {};
            
            this.eventID = 0;
            this.callbacks = {};
        };
        
        WebSocket.prototype.generateEventID = function () {
            if (this.eventID < 100) {
                this.eventID += 1;
            } else {
                this.eventID = 1;
            }
            
            return this.eventID;
        };
        
        WebSocket.prototype.emit = function (event, data, callback) {
            var callbacksRef = this.callbacks;
            
            if (!this.socket.socket) {
                this.socket = io.connect( this.url, {'force new connection': true} );
                this.socket.on('connect', function () {
                    
                    this.on('error', function (data) {
                        COMMON.showGenericMsg(data.msg);
                        executeCallback(callbacksRef, data.eventID, false);
                    });
                    
                    this.on('success', function (eventID) {
                        executeCallback(callbacksRef, eventID, true);
                    });
                });
            }
            
            if (callback) {
                data['eventID'] = '' + this.generateEventID();
                this.callbacks[data.eventID] = callback;
            }
            
            this.socket.emit(event, data);
            this.timerInactivity = resetInactivity( this.timerInactivity, this.socket );
        };
        
        return {
            'notesSocket': new WebSocket('/notesSocket')
        }
    })();
    
    USER = (function () {
        var login = function (login, pass, callback) {
            SERVER.send({
                method: 'POST',
                url: '/user/login',
                params: {'login': login, 'password': pass},
                callbackOnError: true,
                callback: function(error, data) {
                    callback(error, data.object.nextPage);
                }
            });
        };
        
        var getName = function (callback) {
            SERVER.send({
                method: 'GET',
                url: '/user/name',
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        var get = function (callback) {
            SERVER.send({
                method: 'GET',
                url: '/user/data',
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        var update = function (name, email, pwd, confPwd, callback) {
            SERVER.send({
                method: 'POST',
                url: '/user/update',
                params: {
                    'name': name,
                    'email': email,
                    'pwd': pwd,
                    'confPwd': confPwd
                },
                callback: function() {
                    callback();
                }
            });
        };
        
        return {
            'login': login,
            'getName': getName,
            'get': get,
            'update': update
        }
    })();
    
    NOTES = (function () {
        var get = function (link, callback) {
            SERVER.send({
                method: 'GET',
                url: link,
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        var getPublic = function (login, code, callback) {
            SERVER.send({
                method: 'GET',
                url: '/note/p/' + login + '/' + code,
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        var list = function (callback) {
            SERVER.send({
                method: 'GET',
                url: '/notes',
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        var add = function (name, callback) {
            SERVER.send({
                method: 'POST',
                url: '/notes/add',
                params: {'name': name},
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        var rename = function (noteLink, newName, callback) {
            SERVER.send({
                method: 'POST',
                url: noteLink,
                params: {'newName': newName},
                callback: function() {
                    callback();
                }
            });
        };
        
        var remove = function (noteLink, callback) {
            SERVER.send({
                method: 'DELETE',
                url: noteLink,
                callback: function() {
                    callback();
                }
            });
        };
        
        var updateContent = function (noteLink, newContent, callback) {
            var data = {
                'link': noteLink,
                'content': newContent
            };
            
            WEBSOCKET['notesSocket'].emit('updateNoteContent', data, callback);
        };
        
        return {
            'get': get,
            'getPublic': getPublic,
            'list': list,
            'add': add,
            'rename': rename,
            'remove': remove,
            'updateContent': updateContent
        }
    })();
    
    return {
        'USER': USER,
        'NOTES': NOTES,
        'COMMON': COMMON,
        'SESSION': SESSION
    };
}());