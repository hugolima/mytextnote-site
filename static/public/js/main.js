(function () {
    var noteID, oldNoteContent, timerSavingContent, processingUpdates = 0;
    
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
        
        if (noteID) {
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
        $('#noteContent').val(noteContent).focus();
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
                noteID = that.id;
                updateNoteMarkers($(that), note.name, note.content);
                checkLinkOperations();
            });
        } else {
            noteID = noteSelected.id;
            updateNoteMarkers($('li[id="' + noteSelected.id + '"]'), noteSelected.name, '');
            checkLinkOperations();
        }
    };
    
    var getNotes = function (noteSelected) {
        MYTN.NOTES.list( function(notes) {
            var items = [];
            MYTN.COMMON.sortObjArray(notes, 'name');
            
            $.each(notes, function(i, item) {
                items.push('<li id="' + item.id + '"><a href="#">' + item.name + '</a></li>');
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
    
    var showSavedSign = function () {
        $('#noteNotSaved').hide();
        $('#noteSaved').show();
    };
    
    var showNotSavedSign = function () {
        $('#noteNotSaved').show();
        $('#noteSaved').hide();
    };
    
    var updateSavedSign = function (ok) {
        processingUpdates -= 1;
        
        if (ok && processingUpdates <= 0) {
            showSavedSign();
        }
    };
    
    var checkUpdateContent = function () {
        if (!noteID) {
            stopUpdateContent();
            return;
        }
        
        var contentToSend = $('#noteContent').val();
        
        if (oldNoteContent !== contentToSend) {
            MYTN.NOTES.updateContent(noteID, contentToSend, updateSavedSign);
            oldNoteContent = contentToSend;
            processingUpdates += 1;
        }
        else if (processingUpdates == 0) {
            showSavedSign();
        }
    };
    
    var alreadyCheckingUpdates = function () {
        if (timerSavingContent) {
            return true;
        }
        
        return false;
    };
    
    var startUpdateContent = function () {
        showNotSavedSign();
        
        if (alreadyCheckingUpdates()) {
            return;
        }
        
        processingUpdates = 0;
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
    
    var clearErrorsMsgOfUserDataForm = function () {
        $('#inputUsrNameGroup').removeClass('error');
        $('#msgUsrName').addClass('hide');
        
        $('#inputEmailGroup').removeClass('error');
        $('#msgRequiredUsrEmail').addClass('hide');
        $('#msgInvalidUsrEmail').addClass('hide');
        
        $('#inputPwdGroup').removeClass('error');
        $('#msgUsrPwd').addClass('hide');
        
        $('#inputConfPwdGroup').removeClass('error');
        $('#msgUsrConfPwd').addClass('hide');
    };
    
    var validateEmail = function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
            if (!noteID) {
                return false;
            }
            return true;
        });
        
        $('#noteContent').keydown( function() {
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
            
            MYTN.NOTES.rename(noteID, $('#newNoteName').val(), function() {
                btnSave.button('reset');
                $('#labelFileName').html($('#newNoteName').val());
                $('li[id="' + noteID + '"]').children('a').html($('#newNoteName').val());
                $('#modalRenameNote').modal('hide');
            });
        });
        
        $('#btnDeleteNote').click( function() {
            var btnDeleteNote = $(this);
            btnDeleteNote.button('loading');
            
            MYTN.NOTES.remove(noteID, function() {
                btnDeleteNote.button('reset');
                noteID = undefined;
                checkLinkOperations();
                getNotes();
                
                $('#panelNoteContent').addClass('hide');
                $('#panelNoNoteContent').removeClass('hide');
                $('#modalDeleteNote').modal('hide');
            });
        });
        
        $('#usrPwd').on('keyup keydown', function () {
            this.value = $(this).val().replace(/\s+/g,'');
        });
        
        $('#btnUpdateUserData').click( function() {
            var error = 0;
            clearErrorsMsgOfUserDataForm();
            
            if (!$('#usrName').val() || $.trim($('#usrName').val()) === '') {
                $('#inputUsrNameGroup').addClass('error');
                $('#msgUsrName').removeClass('hide');
                error++;
            }
            
            if (!$('#usrEmail').val() || $.trim($('#usrEmail').val()) === '') {
                $('#inputEmailGroup').addClass('error');
                $('#msgRequiredUsrEmail').removeClass('hide');
                error++;
            } else if (!validateEmail($('#usrEmail').val())) {
                $('#inputEmailGroup').addClass('error');
                $('#msgInvalidUsrEmail').removeClass('hide');
                error++;
            }
            
            if ($('#usrPwd').val()) {
                if ($('#usrPwd').val().replace(/\s+/g,'').length < 4) {
                    $('#inputPwdGroup').addClass('error');
                    $('#msgUsrPwd').removeClass('hide');
                    error++;
                }
                else if ($.trim($('#usrPwd').val()) !== $.trim($('#usrConfPwd').val())) {
                    $('#inputConfPwdGroup').addClass('error');
                    $('#msgUsrConfPwd').removeClass('hide');
                    error++;
                }
            }
            
            if (error) {
                return;
            }
            
            var btnSave = $(this);
            btnSave.button('loading');
            
            MYTN.USER.update($('#usrName').val(), $('#usrEmail').val(), $('#usrPwd').val(), $('#usrConfPwd').val(), function() {
                btnSave.button('reset');
                $('#modalUserData').modal('hide');
                $('#userName').html( $('#usrName').val() );
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
        
        $('#modalUserData').on('hidden', function () {
            clearErrorsMsgOfUserDataForm();
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
        
        $('#modalUserData').on('shown', function () {
            MYTN.USER.get( function (user) {
                $('#usrName').focus();
                $('#usrLogin').html(user.login);
                $('#usrName').val(user.name);
                $('#usrEmail').val(user.email);
            });
            
            $('#usrPwd').val('');
            $('#usrConfPwd').val('');
            MYTN.COMMON.clickOnEnter('btnUpdateUserData');
        });
    });
}());