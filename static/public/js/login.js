jQuery( function($) {
    $('#login').focus();
    MYTN.COMMON.clickOnEnter('btnSignin');
    
    $('#btnSignin').click( function() {
        if (!$('#login').val() || !$('#password').val()) {
            $('#msgLoginFailed').html('The username and password are required');
            $('#msgLoginFailed').removeClass('hide');
            return;
        }
        
        var btn = $(this);
        btn.button('loading');
        
        MYTN.SERVER.send({
            method: 'POST',
            url: '/user/login',
            params: {login: $('#login').val(), password: $('#password').val()},
            callbackOnError: true,
            callback: function(error, data) {
                if (error) {
                    btn.button('reset');
                    $('#msgLoginFailed').html(error.message);
                    $('#msgLoginFailed').removeClass('hide');
                    return;
                }
                
                window.location.replace(data.object.nextPage);
            }
        });
    });
});