(function () {
    
    MYTN.COMMON.showGenericMsg = function (msg) {
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
    
    var adjustElementsHeightOfContainer = function () {
        var panelContent = $('#panelNoteContent'),
            paddingsAndElementsSizeOfPanel = 32 + 20 + 18; // labelName + padding panel + help-block
        
        panelContent.height($(window).height() - 100);
        
        if (panelContent.height() < 300) {
            panelContent.height(300);
        }
        
        $('#noteContent').height(panelContent.height() - paddingsAndElementsSizeOfPanel);
    };
    
    jQuery( function($) {
        $(document).ready( function () {
            adjustElementsHeightOfContainer();
        });
        
        $(window).on('resize', function () {
            adjustElementsHeightOfContainer();
        });
        
        $('#noteContent').keydown( function(e) {
            e.preventDefault();
        });
    });
}());