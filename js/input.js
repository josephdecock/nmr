'use strict';

$(document).ready(function() {
    function cancelEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    var dragTimeout;
    var dropBox = $('.drop');
    function setDrag() {
        dropBox.addClass('dragover');
        clearTimeout(dragTimeout);
        dragTimeout = setTimeout("$('.drop').removeClass('dragover')", 1000);
    }
    function unsetDrag() {
        dropBox.removeClass('dragover');
    }   
    $('#input_container').show();
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
    // In real use we should test names with file.name
    // At this point we're assuming Varian 1-D data (our test file)
    var reader = new FileReader();
    reader.onload = (function() {
        var rawData = new DataView(reader.result);
        var data = parseFID(rawData);
        // Switch to processor view
        $('#input_container').hide();
        showProcessor(); // in processor.js
    });
    reader.onerror = (function() {
        alert('You need to access this using Chrome either through a webserver or with the --allow-file-access-from-files flag.');
    });
    reader.readAsArrayBuffer(file);
}

function parseFID (rawData) {
    // Returns a data object (from data.js)
    var data = new Data(rawData);
    // Varian is always Big Endian
    // Bruker Endianness probably can be determined from acqus
    data.littleEndian = false; // Assume Varian for now

    // Get header info
    // I'm sure we don't actually need all of these
    data.nblocks = rawData.getInt32(0, data.littleEndian);
    $('#plot').append('nblocks:' + data.nblocks + '<br />');
    data.ntraces = rawData.getInt32(4, data.littleEndian);
    $('#plot').append('ntraces:' + data.ntraces + '<br />');
    data.np = rawData.getInt32(8, data.littleEndian); // # of data points
    $('#plot').append('np:' + data.np + '<br />');
    data.ebytes = rawData.getInt32(12, data.littleEndian); // 16/32-bit
    $('#plot').append('ebytes:' + data.ebytes + '<br />');
    data.tbytes = rawData.getInt32(16, data.littleEndian); // total data bytes
    $('#plot').append('tbytes:' + data.tbytes + '<br />');
    data.bbytes = rawData.getInt32(20, data.littleEndian); // bytes per block
    $('#plot').append('bbytes:' + data.bbytes + '<br />');
    data.version = rawData.getInt16(24, data.littleEndian);
    $('#plot').append('version:' + data.version + '<br />');
    data.status = rawData.getInt16(26, data.littleEndian);
    data.nbheaders = rawData.getInt16(28, data.littleEndian);
    // Status bits:
    $('#plot').append('nbheaders:' + data.nbheaders + '<br />');
    data.dataExists = data.status & 0x1;
    $('#plot').append('dataExists:' + data.dataExists + '<br />');
    data.dataType = (data.status & 0x2) ? 'spectrum': 'FID';
    $('#plot').append('dataType:' + data.dataType + '<br />');
    data.numType = (data.status & 0x8) ?
        'Float32' :
        (data.status & 0x4) ?
        'Int32' : 'Int16';
    $('#plot').append('numType:' + data.numType + '<br />');
    data.complex = data.status & 0x10;
    $('#plot').append('complex:' + data.complex + '<br />');
    data.hypercomplex = data.status & 0x20;
    $('#plot').append('hypercomplex:' + data.hypercomplex + '<br />');
    // I don't know what the rest of the status bits are for
    // and I don't really care at this point.
    
    // The next 28(?) bytes are the block header, which basically
    // just repeats the file status.
    // We might need the correction values though...

    data.realData = new Array();
    // Actual data starts after 60 bytes
    for (var i = 60; i < rawData.byteLength; i += 8) {
        // Separate real component from imaginary component
        // This is every other data point (i + 8)
        var point = rawData.getInt32(i, data.littleEndian);
        data.realData.push(point);
    }
    data.imaginaryData = new Array();
    // First imaginary data point is at 64 bytes
    for (i = 64; i < rawData.byteLength; i += 8) {
        // Get imaginary component
        point = rawData.getInt32(i, data.littleEndian);
        data.imaginaryData.push(point);
    } 
}