(function () {
    var noteLink,
        oldNoteContent,
        timerSavingContent;
    
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
            
            MYTN.NOTES.get(this.id, function(note) {
                noteLink = that.id;
                updateNoteMarkers($(that), note.name, note.content);
                checkLinkOperations();
            });
        } else {
            noteLink = noteSelected.link;
            updateNoteMarkers($('li[id="' + noteSelected.link + '"]'), noteSelected.name, '');
            checkLinkOperations();
        }
    };
    
    var getNotes = function (noteSelected) {
        MYTN.NOTES.list( function(notes) {
            var items = [];
            MYTN.COMMON.sortObjArray(notes, 'name');
            
            $.each(notes, function(i, item) {
                items.push('<li id="' + item.link + '"><a href="#">' + item.name + '</a></li>');
            });
            
            $('#notesList').children("div").empty();
            $('#notesList').children("div").append( items.join('') );
            
            MYTN.COMMON.iterateLi('notesList', function (i, item) {
                $(item).on('click', selectNote);
            });
            
            if (noteSelected) {
                selectNote('', noteSelected);
            }
        });
    };
    
    var checkUpdateContent = function () {
        if (!noteLink) {
            stopUpdateContent();
            return;
        }
        
        var contentToSend = $('#noteContent').val();
        
        if (oldNoteContent !== contentToSend) {
            MYTN.NOTES.updateContent(noteLink, contentToSend);
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
    
    var adjustElementsHeightOfContainer = function () {
        var panelContent = $('#panelNoteContent'),
            panelNoContent = $('#panelNoNoteContent'),
            noteListDiv = $('#notesListDiv'),
            paddingsAndElementsSizeOfPanel = 32 + 20 + 18; // labelName + padding panel + help-block
        
        panelContent.height($(window).height() - 100);
        panelNoContent.height($(window).height() - 120);
        
        if (panelContent.height() < 300 || panelNoContent.height() < 300) {
            panelContent.height(300);
            panelNoContent.height(300);
        }
        
        noteListDiv.height(panelContent.height() - 50);
        $('#noteContent').height(panelContent.height() - paddingsAndElementsSizeOfPanel);
    };
    
    jQuery( function($) {
        $(document).ready( function () {
            adjustElementsHeightOfContainer();
            getNotes();
            MYTN.SESSION.initCheck();
            MYTN.USER.getName( function (name) {
                $('#userName').html( name );
            });
        });
        
        $(window).on('resize', function () {
            adjustElementsHeightOfContainer();
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
            
            MYTN.NOTES.add($('#noteName').val(), function(newNote) {
                btnSave.button('reset');
                $('#modalCreateNote').modal('hide');
                getNotes(newNote);
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
            
            MYTN.NOTES.rename(noteLink, $('#newNoteName').val(), function() {
                btnSave.button('reset');
                $('#labelFileName').html($('#newNoteName').val());
                $('li[id="' + noteLink + '"]').children('a').html($('#newNoteName').val());
                $('#modalRenameNote').modal('hide');
            });
        });
        
        $('#btnDeleteNote').click( function() {
            var btnDeleteNote = $(this);
            btnDeleteNote.button('loading');
            
            MYTN.NOTES.remove(noteLink, function() {
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
            MYTN.COMMON.clearClickOnEnter();
        });
        
        $('#modalRenameNote').on('hidden', function () {
            $('#newNoteName').val('');
            $('#msgNewNoteName').addClass('hide');
            $('#inputNewNameGroup').removeClass('error');
            MYTN.COMMON.clearClickOnEnter();
        });
        
        $('#modalCreateNote').on('shown', function () {
            $('#noteName').focus();
            MYTN.COMMON.clickOnEnter('btnCreateNote');
        });
        
        $('#modalRenameNote').on('shown', function () {
            $('#newNoteName').val($('#labelFileName').html());
            $('#newNoteName').focus();
            MYTN.COMMON.clickOnEnter('btnRenameNote');
        });
        
        $('#modalDeleteNote').on('shown', function () {
            $('#noteNameDelete').html('<b>' + $('#labelFileName').html() + '</b>');
        });
    });
}());