var sendAjax = function (info, fnSuccess) {
    var request = $.ajax({
        type: info.type,
        url: info.url,
        data: info.params || {},
        dataType: 'json'
    });
    
    request.done(function (data) {
        if (!data.notAuthenticated) {
            fnSuccess(data);
        } else {
            window.location.replace(data.loginPage);
        }
    });
    
    request.fail(function (jqXHR, textStatus) {
        $('.btn').button('reset');
        if ($('#generalErrorMsg').length) {
            $('#generalErrorMsg').find('span').html('<strong>Oops!</strong> Something goes wrong on your request, try again later');
            $('#generalErrorMsg').removeClass('hide');
            setTimeout(function () {
                $('#generalErrorMsg').addClass('hide');
            }, 9000);
        } else {
            alert('Oops! Something goes wrong on your request, try again later.');
        }
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


var MYTEXTNOTE = {
    sendGET: sendGET,
    sendPOST: sendPOST,
    clickOnEnter: clickOnEnter,
    iterateLi: iterateLi
};