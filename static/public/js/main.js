window.MAIN = (function (COMMON) {
    
    if (!COMMON) {
        throw new Error('It\'s necessary a MYTEXTNOTE object!')
    }
    
    var noteLink,
        oldNoteContent,
        timerSavingContent;
    
    var checkLinkOperations = function () {
        $('#liLnkDelete').removeClass('disabled active');
        $('#liLnkRename').removeClass('disabled active');
        
        if (noteLink) {
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
        oldNoteContent = $('#noteContent').val();
    };
    
    var selectNote = function(event, noteSelected) {
        if (event) {
            event.preventDefault();
        }
        if ($(this).hasClass('active')) {
            return;
        }
        
        checkUpdateContent();
        stopUpdateContent();
        
        if (!noteSelected) {
            var that = this;
            COMMON.sendGET(this.id, function(data) {
                noteLink = that.id;
                updateNoteMarkers($(that), data.object.name, data.object.content);
                checkLinkOperations();
            });
        } else {
            noteLink = noteSelected.link;
            updateNoteMarkers($('li[id="' + noteSelected.link + '"]'), noteSelected.name, '');
            checkLinkOperations();
        }
    };
    
    var getNotes = function (noteSelected) {
        COMMON.sendGET('/notes', function(data) {
            var items = [];
            
            $.each(data.object, function(i, item) {
                items.push('<li id="' + item.link + '"><a href="#">' + item.name + '</a></li>');
            });
            
            $('#notesList').empty();
            $('#notesList').append( items.join('') );
            
            COMMON.iterateLi('notesList', function (i, item) {
                $(item).on('click', selectNote);
            });
            
            if (noteSelected) {
                selectNote('', noteSelected);
            }
        });
    };
    
    var getUserName = function () {
        COMMON.sendGET('/user/name', function(data) {
            $('#userName').html( data.object );
        });
    };
    
    var checkUpdateContent = function () {
        if (!noteLink) {
            stopUpdateContent();
            return;
        }
        
        var contentToSend = $('#noteContent').val();
        
        if (oldNoteContent !== contentToSend) {
            COMMON.updateNoteContent(noteLink, contentToSend);
            oldNoteContent = contentToSend;
        }
    };
    
    var startUpdateContent = function () {
        if (timerSavingContent) {
            return;
        }
        
        checkUpdateContent();
        timerSavingContent = setInterval(checkUpdateContent, 2000);
    };
    
    var stopUpdateContent = function () {
        if (timerSavingContent) {
            clearInterval(timerSavingContent);
            timerSavingContent = undefined;
        }
    };
    
    jQuery( function($) {
        $(document).ready( function () {
            getNotes();
            getUserName();
            COMMON.initCheckSession();
        });
        
        $('.requireNote').click( function() {
            if (!noteLink) {
                return false;
            }
            return true;
        });
        
        $('#noteContent').keypress( function() {
            startUpdateContent();
        });
        
        $('#btnCreateNote').click( function() {
            if (!$('#noteName').val() || $.trim($('#noteName').val()) === '') {
                $('#inputNameGroup').addClass('error');
                $('#msgNoteName').removeClass('hide');
                return;
            }
            
            var btnSave = $(this);
            btnSave.button('loading');
            
            COMMON.sendPOST('/notes/add', {name: $('#noteName').val()}, function(data) {
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
            
            COMMON.sendPOST(noteLink, {newName: $('#newNoteName').val()}, function(data) {
                btnSave.button('reset');
                $('#labelFileName').html($('#newNoteName').val());
                $('li[id="' + noteLink + '"]').children('a').html($('#newNoteName').val());
                $('#modalRenameNote').modal('hide');
            });
        });
        
        $('#btnDeleteNote').click( function() {
            var btnDeleteNote = $(this);
            btnDeleteNote.button('loading');
            
            COMMON.sendDELETE(noteLink, function() {
                btnDeleteNote.button('reset');
                noteLink = undefined;
                checkLinkOperations();
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
}(window.MYTEXTNOTE));