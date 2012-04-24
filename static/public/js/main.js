var getFileContent = function(event, fileSelected) {
    if ($(this).hasClass('nav-header')) {
        return;
    }
    
    $('#panelFileContent').removeClass('hide');
    $('#panelNoFileContent').addClass('hide');
    $('#fileList').find('.active').removeClass('active');
    
    if (!fileSelected) {
        var that = this;
        
        MYTEXTNOTE.sendGET(this.id, function(data) {
          $('#labelFileName').html(data.object.name);
          $('#fileContent').val(data.object.content);
          $('#fileLink').val(that.id);
          $(that).addClass('active');
        });
    } else {
        $('li[id="' + fileSelected.link + '"]').addClass('active');
        $('#fileLink').val(fileSelected.link);
        $('#labelFileName').html(fileSelected.name);
        $('#fileContent').val('');
    }
};

var getFiles = function (fileSelected) {
    MYTEXTNOTE.sendGET('/files', function(data) {
        var items = [];
        items.push('<li class="nav-header">List of Files</li>');
        
        $.each(data.object, function(i, item) {
            items.push('<li id="' + item.link + '"><a href="#">' + item.name + '</a></li>');
        });
        
        $('#fileList').empty();
        $('#fileList').append( items.join('') );
        
        MYTEXTNOTE.iterateLi('fileList', function (i, item) {
            $(item).on('click', getFileContent);
        });
        
        if (fileSelected) {
            getFileContent('', fileSelected);
        }
    });
};

jQuery( function($) {
    $(document).ready( function () {
        getFiles();
    });
    
    $('#btnSave').click( function() {
        var btnSave = $(this);
        btnSave.button('loading');
        
        MYTEXTNOTE.sendPOST($('#fileLink').val(), {content: $('#fileContent').val()}, function(data) {
          btnSave.button('reset');
        });
    });
    
    $('#btnSaveNewFile').click( function() {
        if (!$('#fileName').val()) {
            $('#inputNameGroup').addClass('error');
            $('#msgFileName').removeClass('hide');
            return;
        }
        
        var btnSave = $(this);
        btnSave.button('loading');
        
        MYTEXTNOTE.sendPOST('/files/add', {name: $('#fileName').val(), desc: $('#fileDesc').val()}, function(data) {
            btnSave.button('reset');
            $('#modalCreateUser').modal('hide');
            getFiles(data.object);
        });
    });
    
    $('#modalCreateUser').on('hidden', function () {
        $('#fileName').val('');
        $('#fileDesc').val('');
        $('#msgFileName').addClass('hide');
        $('#inputNameGroup').removeClass('error');
    });
});