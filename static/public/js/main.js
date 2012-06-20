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
            window.noteLink = that.id;
            $(that).addClass('active');
            checkLinkOperations();
            initSaveNote();
        });
    } else {
        $('li[id="' + noteSelected.link + '"]').addClass('active');
        window.noteLink = noteSelected.link;
        $('#labelFileName').html(noteSelected.name);
        $('#noteContent').val('');
        checkLinkOperations();
        initSaveNote();
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

var initSaveNote = function () {
    if (window.timerSaveNote) {
        clearTimeout(window.timerSaveNote);
    }
    
    window.oldNoteContent = $('#noteContent').val();
    
    var saveNote = function () {
        var contentToSend = $('#noteContent').val();
        if (window.noteLink && window.oldNoteContent !== contentToSend) {
            MYTEXTNOTE.sendPOST(window.noteLink, {content: contentToSend}, function() {
                window.oldNoteContent = contentToSend;
            });
        }
        window.timerSaveNote = setTimeout(saveNote, 2000);
    };
    
    saveNote();
}

var stopSaveNote = function () {
    if (window.timerSaveNote) {
        clearTimeout(window.timerSaveNote);
    }
    delete window.timerSaveNote;
}

jQuery( function($) {
    $(document).ready( function () {
        getNotes();
        getUserName();
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
        $('#noteNameDelete').html('"' + $('#labelFileName').html() + '"');
    });
});