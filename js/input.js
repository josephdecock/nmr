'use strict';

$(document).ready(function() {
    function cancelEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    function setDrag() {
        dropBox.addClass('dragover');
    }
    function unsetDrag() {
        dropBox.removeClass('dragover');
    }   
    $('#input_container').show();
    var dropBox = $('#drop');
    // Prevent default action for drag and drop across entire document
    $(document).bind('dragenter', function() {cancelEvent(event)});
    $(document).bind('dragover', function () {cancelEvent(event)});
    $(document).bind('drop', function() {cancelEvent(event)});
    // Set styles for drag and drop input
    dropBox.bind('dragenter', function() {setDrag()});
    dropBox.bind('dragover', function () {setDrag()});
    dropBox.bind('dragleave', function() {unsetDrag()});
    dropBox.bind('drop', function() {unsetDrag()});
});

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
        var data = new DataView(reader.result);
        var littleEndian = false; // Varian is always Big Endian
        // Get header info
        $('#plot').append('HEADER:<br />');
        // I'm sure we don't actually need all of these
        var nblocks = data.getInt32(0, littleEndian);
        $('#plot').append('nblocks:' + nblocks + '<br />');
        var ntraces = data.getInt32(4, littleEndian);
        $('#plot').append('ntraces:' + ntraces + '<br />');
        var np = data.getInt32(8, littleEndian); // # of data points
        $('#plot').append('np:' + np + '<br />');
        var ebytes = data.getInt32(12, littleEndian); // 16/32-bit
        $('#plot').append('ebytes:' + ebytes + '<br />');
        var tbytes = data.getInt32(16, littleEndian); // total data bytes
        $('#plot').append('tbytes:' + tbytes + '<br />');
        var bbytes = data.getInt32(20, littleEndian); // bytes per block
        $('#plot').append('bbytes:' + bbytes + '<br />');
        var version = data.getInt16(24, littleEndian);
        $('#plot').append('version:' + version + '<br />');
        var status = data.getInt16(26, littleEndian);
        var nbheaders = data.getInt16(28, littleEndian);
        // Status bits:
        $('#plot').append('nbheaders:' + nbheaders + '<br />');
        var dataExists = status & 0x1;
        $('#plot').append('dataExists:' + dataExists + '<br />');
        var dataType = (status & 0x2) ? 'spectrum': 'FID';
        $('#plot').append('dataType:' + dataType + '<br />');
        var numType = (status & 0x8) ?
            'Float32' :
            (status & 0x4) ?
            'Int32' : 'Int16';
        $('#plot').append('numType:' + numType + '<br />');
        var complex = status & 0x10;
        $('#plot').append('complex:' + complex + '<br />');
        var hypercomplex = status & 0x20;
        $('#plot').append('hypercomplex:' + hypercomplex + '<br />');
        // I don't know what the rest of the status bits are for
        // and I don't really care at this point.

        // The next 28(?) bytes are the block header, which basically
        // just repeats the file status.
        // We might need the correction values though...

        var fidData = new Array();
        // Actual data starts after 60 bytes
        for (var i = 60; i < reader.result.byteLength; i += 8) {
            // Use the real data, not the imaginary
            // This is every other data point (i + 8)
            var point = new DataView(reader.result).getInt32(i, littleEndian);
            fidData.push(point);
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