var getNoteContent = function(event, noteSelected) {
    if ($(this).hasClass('nav-header')) {
        return;
    }
    
    $('#panelNoteContent').removeClass('hide');
    $('#panelNoNoteContent').addClass('hide');
    $('#notesList').find('.active').removeClass('active');
    
    if (!noteSelected) {
        var that = this;
        
        MYTEXTNOTE.sendGET(this.id, function(data) {
          $('#labelFileName').html(data.object.name);
          $('#noteContent').val(data.object.content);
          $('#fileLink').val(that.id);
          $(that).addClass('active');
        });
    } else {
        $('li[id="' + noteSelected.link + '"]').addClass('active');
        $('#fileLink').val(noteSelected.link);
        $('#labelFileName').html(noteSelected.name);
        $('#noteContent').val('');
    }
};

var getFiles = function (noteSelected) {
    MYTEXTNOTE.sendGET('/notes', function(data) {
        var items = [];
        items.push('<li class="nav-header">List of Notes</li>');
        
        $.each(data.object, function(i, item) {
            items.push('<li id="' + item.link + '"><a href="#">' + item.name + '</a></li>');
        });
        
        $('#notesList').empty();
        $('#notesList').append( items.join('') );
        
        MYTEXTNOTE.iterateLi('notesList', function (i, item) {
            $(item).on('click', getNoteContent);
        });
        
        if (noteSelected) {
            getNoteContent('', noteSelected);
        }
    });
};

jQuery( function($) {
    $(document).ready( function () {
        getFiles();
    });
    
    $('#btnUpdate').click( function() {
        var btnUpdate = $(this);
        btnUpdate.button('loading');
        
        MYTEXTNOTE.sendPOST($('#fileLink').val(), {content: $('#noteContent').val()}, function(data) {
          btnUpdate.button('reset');
        });
    });
    
    $('#btnSaveNewFile').click( function() {
        if (!$('#noteName').val()) {
            $('#inputNameGroup').addClass('error');
            $('#msgFileName').removeClass('hide');
            return;
        }
        
        var btnSave = $(this);
        btnSave.button('loading');
        
        MYTEXTNOTE.sendPOST('/notes/add', {name: $('#noteName').val(), desc: $('#noteDesc').val()}, function(data) {
            btnSave.button('reset');
            $('#modalCreateNote').modal('hide');
            getFiles(data.object);
        });
    });
    
    $('#modalCreateNote').on('hidden', function () {
        $('#noteName').val('');
        $('#noteDesc').val('');
        $('#msgFileName').addClass('hide');
        $('#inputNameGroup').removeClass('error');
    });
});