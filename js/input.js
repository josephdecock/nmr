'use strict';

$(document).ready(function() {
    $('#input_container').show();
    var dropBox = document.querySelector('#drop');
    dropBox.addEventListener('dragover', cancelEvent, false);
    dropBox.addEventListener('drop', cancelEvent, false);
});

function cancelEvent(event) {
    event.preventDefault();
    event.stopPropagation();
}

function handleFiles(event) {
    // For real data we will need to process fileList
    // For testing right now, we know it is one file (fid)
    if (event.target.files) {
        var file = event.target.files[0];
    }
    else if (event.dataTransfer.files) {
        var file = event.dataTransfer.files[0];
    }
    // Test names with file.name
    var reader = new FileReader();
    reader.onload = (function() {
        var fid = Int32Array(reader.result);
        for (var i = 0; i < fid.length; i++) {
            $('#plot').append(fid[i] + '<br />');
        }
        $('#input_container').hide();
        showProcessor();
    });
    // Slice size needs to be a multiple of 4 (32 bytes)
    // This prevents error at Int32Array()
    if (file.slice) { // Supposed standard, not implemented yet
        var blob = file.slice(33, 113);
    }
    else if (file.mozSlice) {
        var blob = file.mozSlice(33, 113);
    }
    else if (file.webkitSlice) {
        var blob = file.webkitSlice(33, 113);
    }
    // We might have to experiment with slice sizes.
    // Printing the entire data file causing an extreme lag in the browser
    // prompting a slow script error. I don't know if this will be an issue
    // for our real use case.

    reader.readAsArrayBuffer(blob);
    // This raises a security error (error code: 2, SECURITY_ERR) in Chrome.
    // The documentation for this is pretty vague: (from the W3C draft)
    //
    // If: 
    // - it is determined that certain files are unsafe for access within
    //     a Web application.
    // - it is determined that too many read calls are being made on File
    //     or Blob resources.
    // - it is determined that the file has changed on disk since the user
    //     selected it.
    // then for asynchronous read methods the error attribute MAY return a
    //   "SecurityError" DOMError and synchronous read methods MAY throw a
    //   SecurityError exception.
    // This is a security error code to be used in situations not covered
    //   by any other exception type.
}

function showProcessor() {
    $('.processor').show();
    $(document).click(function () {
        $('.list').hide();
        $('.button').unbind('mouseenter');
        $('.button').unbind('mouseleave');
    });
    $('li').click(function(event) {
        event.stopPropagation();
        $('.list').hide();
        $('.button').unbind('mouseenter');
        $('.button').unbind('mouseleave');
    });
}

function showMenu(event, button) {
    event.stopPropagation();
    $(button).find('.list').show();
    $('.button').hover(function() {
        $('.list').hide();
        $(this).find('.list').show();
    }, null);
}