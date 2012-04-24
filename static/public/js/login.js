jQuery( function($) {
    
    $(document).keypress(MYTEXTNOTE.clickOnEnter('btnSignin'));
    
    $('#btnSignin').click( function() {
        if (!$('#login').val() || !$('#password').val()) {
            $('#msgLoginFailed').html('The username and password are required');
            $('#msgLoginFailed').removeClass('hide');
            return;
        }
        
        var btn = $(this);
        btn.button('loading');
        
        MYTEXTNOTE.sendPOST('/user/login', {login: $('#login').val(), password: $('#password').val()}, function(data) {
            btn.button('reset');
            if (data.success) {
                window.location.replace(data.object.nextPage);
            } else {
                $('#msgLoginFailed').html(data.message);
                $('#msgLoginFailed').removeClass('hide');
            }
        });
    });
});