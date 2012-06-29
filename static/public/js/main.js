var checkLinkOperations = function () {
    $('#liLnkDelete').removeClass('disabled active');
    $('#liLnkRename').removeClass('disabled active');
    
    if (window.noteLink) {
        $('#liLnkDelete').addClass('active');
        $('#liLnkRename').addClass('active');
        return;
    }
    
    $('#liLnkDelete').addClass('disabled');
    $('#liLnkRename').addClass('disabled');
};

var updateNoteMarkers = function (liElementNote, noteName, noteContent) {
    $('#panelNoteContent').removeClass('hide');
    $('#panelNoNoteContent').addClass('hide');
    $('#notesList').find('.active').removeClass('active');
    liElementNote.addClass('active');
    
    $('#labelFileName').html(noteName);
    $('#noteContent').val(noteContent);
    window.justSelected = true;
};

var getNoteContent = function(event, noteSelected) {
    if (event) {
        event.preventDefault();
    }
    if ($(this).hasClass('active')) {
        return;
    }
    
    if (!noteSelected) {
        var that = this;
        updateNoteNotSavedYet();
        MYTEXTNOTE.sendGET(this.id, function(data) {
            window.noteLink = that.id;
            updateNoteMarkers($(that), data.object.name, data.object.content);
            checkLinkOperations();
        });
    } else {
        window.noteLink = noteSelected.link;
        updateNoteMarkers($('li[id="' + noteSelected.link + '"]'), noteSelected.name, '');
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

var updateNoteNotSavedYet = function () {
    var contentToSend = $('#noteContent').val();
    if (window.noteLink && window.oldNoteContent !== contentToSend) {
        MYTEXTNOTE.updateNoteContent(window.noteLink, contentToSend);
    }
};

var checkUpdateNote = function () {
    var contentToSend = $('#noteContent').val();
    
    if (window.justSelected) {
        window.justSelected = false;
        window.oldNoteContent = contentToSend;
    }
    
    if (window.noteLink && window.oldNoteContent !== contentToSend) {
        MYTEXTNOTE.updateNoteContent(window.noteLink, contentToSend);
        window.oldNoteContent = contentToSend;
    }
    
    setTimeout(checkUpdateNote, 2000);
};

var stopSaveNote = function () {
}

jQuery( function($) {
    $(document).ready( function () {
        getNotes();
        getUserName();
        checkUpdateNote();
        MYTEXTNOTE.initCheckSession();
        delete window.noteLink;
    });
    
    $('.requireNote').click( function() {
        if (!window.noteLink) {
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
        
        MYTEXTNOTE.sendPOST(window.noteLink, {newName: $('#newNoteName').val()}, function(data) {
            btnSave.button('reset');
            $('#labelFileName').html($('#newNoteName').val());
            $('li[id="' + window.noteLink + '"]').children('a').html($('#newNoteName').val());
            $('#modalRenameNote').modal('hide');
        });
    });
    
    $('#btnDeleteNote').click( function() {
        var btnDeleteNote = $(this);
        btnDeleteNote.button('loading');
        
        MYTEXTNOTE.sendDELETE(window.noteLink, function() {
            btnDeleteNote.button('reset');
            delete window.noteLink;
            checkLinkOperations();
            stopSaveNote();
            getNotes();
            
            $('#panelNoteContent').addClass('hide');
            $('#panelNoNoteContent').removeClass('hide');
            $('#modalDeleteNote').modal('hide');
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
        $('#noteNameDelete').html('<b>' + $('#labelFileName').html() + '</b>');
    });
});