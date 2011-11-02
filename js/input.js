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
    // In real us we should test names with file.name
    // At this point we're assuming Varian 1-D data (our test file)
    var reader = new FileReader();
    reader.onload = (function() {
        // These would normally be determined by reading the header
        var littleEndian = false;
//        var type = 'Int32'; // Options are Int16, Int32, Float32
        var point;
        var plot = new Array();
        var j = 0;
        for (var i = 17; i < reader.result.byteLength; i += 16) {
            // Separate data from header (start at byte 17)
            // Use the real data, not the imaginary
            // This is every other data point (i + 16)
            point = new DataView(reader.result).getInt32(i, littleEndian);
            plot[j] = point;
            j++;
            $('#plot').append(point + '<br />'); // For testing
        }
        $('#input_container').hide();
        showProcessor();
    });
    reader.readAsArrayBuffer(file);
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