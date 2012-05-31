var getNoteContent = function(event, noteSelected) {
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
            $('#fileLink').val(that.id);
            $(that).addClass('active');
            $('#liLnkDelete').removeClass('disabled active');
            $('#liLnkDelete').addClass('active');
        });
    } else {
        $('li[id="' + noteSelected.link + '"]').addClass('active');
        $('#fileLink').val(noteSelected.link);
        $('#labelFileName').html(noteSelected.name);
        $('#noteContent').val('');
        $('#liLnkDelete').removeClass('disabled active');
        $('#liLnkDelete').addClass('active');
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
        $('#fileLink').val('');
    });
    
    $('#btnUpdate').click( function() {
        var btnUpdate = $(this);
        btnUpdate.button('loading');
        
        MYTEXTNOTE.sendPOST($('#fileLink').val(), {content: $('#noteContent').val()}, function(data) {
            btnUpdate.button('reset');
        });
    });
    
    $('#lnkDelete').click( function() {
        if (!$('#fileLink').val()) {
            return false;
        }
        return true;
    });
    
    $('#btnDelete').click( function() {
        var btnDelete = $(this);
        btnDelete.button('loading');
        
        MYTEXTNOTE.sendDELETE($('#fileLink').val(), function(data) {
            btnDelete.button('reset');
            getNotes();
            
            $('#panelNoteContent').addClass('hide');
            $('#panelNoNoteContent').removeClass('hide');
            $('#fileLink').val('');
            $('#modalDeleteNote').modal('hide');
            $('#liLnkDelete').removeClass('disabled active');
            $('#liLnkDelete').addClass('disabled');
        });
    });
    
    $('#btnSaveNewFile').click( function() {
        if (!$('#noteName').val() || $.trim($('#noteName').val()) === '') {
            $('#inputNameGroup').addClass('error');
            $('#msgFileName').removeClass('hide');
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
    
    $('#modalCreateNote').on('hidden', function () {
        $('#noteName').val('');
        $('#noteDesc').val('');
        $('#msgFileName').addClass('hide');
        $('#inputNameGroup').removeClass('error');
    });
    
    $('#modalDeleteNote').on('show', function () {
        $('#noteNameDelete').html('"' + $('#labelFileName').html() + '"');
    });
});