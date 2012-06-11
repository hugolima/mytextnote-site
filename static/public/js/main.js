var checkLinkOperations = function () {
    $('#liLnkDelete').removeClass('disabled active');
    $('#liLnkRename').removeClass('disabled active');
    
    if ($('#noteLink').val() !== '') {
        $('#liLnkDelete').addClass('active');
        $('#liLnkRename').addClass('active');
        return;
    }
    
    $('#liLnkDelete').addClass('disabled');
    $('#liLnkRename').addClass('disabled');
};

var getNoteContent = function(event, noteSelected) {
    if (event) {
        event.preventDefault();
    }
    if ($(this).hasClass('active')) {
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
            $('#noteLink').val(that.id);
            $(that).addClass('active');
            checkLinkOperations();
        });
    } else {
        $('li[id="' + noteSelected.link + '"]').addClass('active');
        $('#noteLink').val(noteSelected.link);
        $('#labelFileName').html(noteSelected.name);
        $('#noteContent').val('');
        checkLinkOperations();
    }
};

var getNotes = function (noteSelected) {
    MYTEXTNOTE.sendGET('/notes', function(data) {
        var items = [];
        
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

var getUserName = function () {
    MYTEXTNOTE.sendGET('/user/name', function(data) {
        $('#userName').html( data.object );
    });
};

jQuery( function($) {
    $(document).ready( function () {
        getNotes();
        getUserName();
        MYTEXTNOTE.initCheckSession();
        $('#noteLink').val('');
    });
    
    $('#btnUpdate').click( function() {
        var btnUpdate = $(this);
        btnUpdate.button('loading');
        
        MYTEXTNOTE.sendPOST($('#noteLink').val(), {content: $('#noteContent').val()}, function(data) {
            btnUpdate.button('reset');
        });
    });
    
    $('.requireNote').click( function() {
        if (!$('#noteLink').val()) {
            return false;
        }
        return true;
    });
    
    $('#btnCreateNote').click( function() {
        if (!$('#noteName').val() || $.trim($('#noteName').val()) === '') {
            $('#inputNameGroup').addClass('error');
            $('#msgNoteName').removeClass('hide');
            return;
        }
        
        var btnSave = $(this);
        btnSave.button('loading');
        
        MYTEXTNOTE.sendPOST('/notes/add', {name: $('#noteName').val()}, function(data) {
            btnSave.button('reset');
            $('#modalCreateNote').modal('hide');
            getNotes(data.object);
        });
    });
    
    $('#btnRenameNote').click( function() {
        if (!$('#newNoteName').val() || $.trim($('#newNoteName').val()) === '') {
            $('#inputNewNameGroup').addClass('error');
            $('#msgNewNoteName').removeClass('hide');
            return;
        }
        
        var btnSave = $(this);
        btnSave.button('loading');
        
        MYTEXTNOTE.sendPOST($('#noteLink').val(), {newName: $('#newNoteName').val()}, function(data) {
            btnSave.button('reset');
            $('#labelFileName').html($('#newNoteName').val());
            $('li[id="' + $('#noteLink').val() + '"]').children('a').html($('#newNoteName').val());
            $('#modalRenameNote').modal('hide');
        });
    });
    
    $('#btnDeleteNote').click( function() {
        var btnDeleteNote = $(this);
        btnDeleteNote.button('loading');
        
        MYTEXTNOTE.sendDELETE($('#noteLink').val(), function() {
            btnDeleteNote.button('reset');
            getNotes();
            
            $('#panelNoteContent').addClass('hide');
            $('#panelNoNoteContent').removeClass('hide');
            $('#noteLink').val('');
            $('#modalDeleteNote').modal('hide');
            checkLinkOperations();
        });
    });
    
    $('#modalCreateNote').on('hidden', function () {
        $('#noteName').val('');
        $('#msgNoteName').addClass('hide');
        $('#inputNameGroup').removeClass('error');
    });
    
    $('#modalRenameNote').on('hidden', function () {
        $('#newNoteName').val('');
        $('#msgNewNoteName').addClass('hide');
        $('#inputNewNameGroup').removeClass('error');
    });

    $('#modalRenameNote').on('show', function () {
        $('#newNoteName').val($('#labelFileName').html());
    });
    
    $('#modalDeleteNote').on('show', function () {
        $('#noteNameDelete').html('"' + $('#labelFileName').html() + '"');
    });
});