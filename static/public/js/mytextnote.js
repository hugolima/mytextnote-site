var MYTEXTNOTE = (function() {
    var timeoutMsgErro;
    
    var showMsg = function (msg) {
        if ($('#generalErrorMsg').length) {
            $('#generalErrorMsg').find('span').html(msg);
            $('#generalErrorMsg').removeClass('hide');
            
            clearTimeout(timeoutMsgErro);
            timeoutMsgErro = setTimeout(function () {
                $('#generalErrorMsg').addClass('hide');
            }, 10000);
        } else {
            alert(msg);
        }
    };
    
    var sendAjax = function (info, fnSuccess) {
        var request = $.ajax({
            type: info.type,
            url: info.url,
            data: info.params || {},
            dataType: 'json'
        });
        request.done(function (data) {
            if (!data.notAuthenticated) {
                if (data.success) {
                    fnSuccess(data);
                } else {
                    showMsg(data.message);
                }
            } else {
                window.location.replace(data.loginPage);
            }
        });
        request.fail(function (jqXHR, textStatus) {
            $('.btn').button('reset');
            showMsg('<strong>Oops!</strong> Something goes wrong on your request, try again later');
        });
    };
    
    var sendGET = function (url, fnSuccess) {
        sendAjax({type: 'GET', url: url}, fnSuccess);
    };
    
    var sendPOST = function (url, params, fnSuccess) {
        sendAjax({type: 'POST', url: url, params: params}, fnSuccess);
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
    
    return {
        sendGET: sendGET,
        sendPOST: sendPOST,
        clickOnEnter: clickOnEnter,
        iterateLi: iterateLi
    }
}());