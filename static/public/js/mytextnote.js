var MYTEXTNOTE = (function () {
    var timeoutMsgErro,
        ncSocket;
    
    var showMsg = function (msg) {
        if ($('#generalErrorMsg').length) {
            $('#generalErrorMsg').find('span').html(msg);
            $('#generalErrorMsg').removeClass('hide');
            
            clearTimeout(timeoutMsgErro);
            timeoutMsgErro = setTimeout(function () {
                $('#generalErrorMsg').addClass('hide');
            }, 20000);
            
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
            showMsg('<strong>Oops!</strong> Something goes wrong on your request, try again later');
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
    
    var updateNoteContent = function (link, content) {
        if (!ncSocket) {
            ncSocket = io.connect('/noteContentSocket');
            ncSocket.on('connect', function () {
                ncSocket.on('message', function (msg) {
                    showMsg(msg);
                });
            });
        }
        
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