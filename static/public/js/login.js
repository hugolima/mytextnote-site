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
        
        MYTN.USER.login($('#login').val(), $('#password').val(), function(err, nextPage) {
            if (err) {
                btn.button('reset');
                $('#msgLoginFailed').html(err.message);
                $('#msgLoginFailed').removeClass('hide');
                return;
            }
            
            window.location.replace(nextPage);
        });
    });
});