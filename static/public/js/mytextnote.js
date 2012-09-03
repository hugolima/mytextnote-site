window.MYTEXTNOTE = (function () {
    
    var timerSocketInactivity,
        ncSocket;
    
    var showMsg = function (msg) {
        if ($('#generalErrorMsg').length) {
            var htmlCloseButton = '<span id="closeErrorMsg" style="padding-left: 20px;"><b><u><a href="#" style="color:#B94A48;">Dismiss</a></u></b></span>';
            
            $('#generalErrorMsg').find('span').html(msg + htmlCloseButton);
            $('#generalErrorMsg').removeClass('hide');
            
            $('#closeErrorMsg').on('click', function (event) {
                event.preventDefault();
                $('#generalErrorMsg').addClass('hide');
            });
            
            return;
        } 
        alert(msg);
    };
    
    var restoreToDefaults = function () {
        $('.btn').button('reset');
        $('.modal').modal('hide');
    };
    
    var sendAjax = function (info, fnSuccess, fnNoSuccess) {
        var request = $.ajax({
            type: info.type,
            url: info.url,
            data: info.params || {},
            dataType: 'json',
            timeout: 40000
        });
        request.done(function (data) {
            if (!data) {
                return;
            }
            if (!data.notAuthenticated) {
                if (data.success) {
                    fnSuccess && fnSuccess(data);
                    return;
                }
                if (fnNoSuccess) {
                    fnNoSuccess(data.message);
                    return;
                }
                restoreToDefaults();
                showMsg(data.message);
                return;
            }
            window.location.replace(data.loginPage);
        });
        request.fail(function (jqXHR, textStatus) {
            restoreToDefaults();
            showMsg('<strong>Oops!</strong> Something goes wrong on your request, try again later.');
        });
    };
    
    var sendGET = function (url, fnSuccess) {
        sendAjax({type: 'GET', url: url}, fnSuccess);
    };
    
    var sendPOST = function (url, params, fnSuccess, fnNoSuccess) {
        sendAjax({type: 'POST', url: url, params: params}, fnSuccess, fnNoSuccess);
    };
    
    var sendDELETE = function (url, fnSuccess) {
        sendAjax({type: 'DELETE', url: url}, fnSuccess);
    };
    
    var initCheckSession = function () {
        var checkSession = function () {
            sendGET('/session/check', function () {
                setTimeout(checkSession, 145000);
            });
        };
        
        setTimeout(checkSession, 145000);
    };
    
    var clickOnEnter = function (idBtn) {
        return function (e) {
            if (e.which === 13) {
                $('#' + idBtn).click();
            }
        };
    };
    
    var iterateLi = function (idUl, fn) {
        $('#' + idUl).find('li').each(fn);
    };
    
    var stopNcSocket = function () {
        if (ncSocket) {
            ncSocket.socket.disconnect();
            ncSocket = undefined;
        }
    };
    
    var resetSocketInactivity = function () {
        window.clearTimeout(timerSocketInactivity);
        timerSocketInactivity = window.setTimeout(stopNcSocket, 300000);
    };
    
    var updateNoteContent = function (link, content) {
        if (!ncSocket) {
            ncSocket = io.connect('/noteContentSocket', {'force new connection': true});
            ncSocket.on('connect', function () {
                this.on('message', function (msg) {
                    showMsg(msg);
                });
            });
        }
        
        resetSocketInactivity();
        ncSocket.emit('updateNoteContent', {'link': link, 'content': content});
    };
    
    return {
        'sendGET': sendGET,
        'sendPOST': sendPOST,
        'sendDELETE': sendDELETE,
        'initCheckSession': initCheckSession,
        'clickOnEnter': clickOnEnter,
        'iterateLi': iterateLi,
        'updateNoteContent': updateNoteContent
    };
}());