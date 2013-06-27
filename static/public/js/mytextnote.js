window.MYTN = (function () {
    var COMMON, SERVER, SESSION, WEBSOCKET, USER, NOTES;
    
    COMMON = (function () {
        var restoreToDefaults, showGenericMsg, clickOnEnter, clearClickOnEnter, iterateLi, by, sortObjArray;
        
        restoreToDefaults = function () {
            $('.btn').button('reset');
            $('.modal').modal('hide');
        };
        
        showGenericMsg = function() {};
        
        clickOnEnter = function (idBtn) {
            $(document).on('keypress', function (event) {
                if (event.which === 13) {
                    event.preventDefault();
                    $('#' + idBtn).click();
                }
            });
        };
        
        clearClickOnEnter = function () {
            $(document).off('keypress');
        };
        
        iterateLi = function (idUl, fn) {
            $('#' + idUl).find('li').each(fn);
        };
        
        by = function (name) {
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
        
        sortObjArray = function (array, propertyName) {
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
        var sendAjax, dataType, timeout;
        
        sendAjax = function (requestObj) {
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
                COMMON.showGenericMsg('<strong>Oops!</strong> Something goes wrong on your request, try again later.');
            });
        };
        
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
        var resetInactivity, WebSocket;
        
        resetInactivity = function (timer, socket) {
            var disconnect = function () {
                if (socket) {
                    socket.socket.disconnect();
                    socket.socket = undefined;
                }
            };
            
            window.clearTimeout(timer);
            return window.setTimeout(disconnect, 300000);
        };
        
        WebSocket = function (url) {
            this.url = url;
            this.socket = {};
        }
        
        WebSocket.prototype.emit = function (event, data) {
            if (!this.socket.socket) {
                this.socket = io.connect( this.url, {'force new connection': true} );
                this.socket.on('connect', function () {
                    this.on('message', function (msg) {
                        COMMON.showGenericMsg(msg);
                    });
                });
            }
            
            this.socket.emit(event, data);
            this.timerInactivity = resetInactivity( this.timerInactivity, this.socket );
        };
        
        return {
            'notesSocket': new WebSocket('/notesSocket')
        }
    })();
    
    USER = (function () {
        var getName = function (callback) {
            SERVER.send({
                method: 'GET',
                url: '/user/name',
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        }
        
        return {
            'getName': getName
        }
    })();
    
    NOTES = (function () {
        var get, list;
        
        get = function (link, callback) {
            SERVER.send({
                method: 'GET',
                url: link,
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        list = function (callback) {
            SERVER.send({
                method: 'GET',
                url: '/notes',
                callback: function(err, data) {
                    callback( data.object );
                }
            });
        };
        
        return {
            'get': get,
            'list': list
        }
    })();
    
    return {
        'USER': USER,
        'NOTES': NOTES,
        'SERVER': SERVER,
        'COMMON': COMMON,
        'SESSION': SESSION,
        'WEBSOCKET': WEBSOCKET
    };
}());