'use strict';

var vendor;
var data;

$(document).ready(function() {
    function cancelEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    var dragTimeout;
    var dropBox = $('.drop');
    data = new Data();
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
    $(document).bind('dragenter', function(event) {cancelEvent(event)});
    $(document).bind('dragover', function (event) {cancelEvent(event)});
    $(document).bind('drop', function(event) {cancelEvent(event)});
    // Set styles for drag and drop input
    dropBox.bind('dragenter', function() {setDrag()});
    dropBox.bind('dragover', function () {setDrag()});
    dropBox.bind('dragleave', function() {unsetDrag()});
    dropBox.bind('drop', function() {unsetDrag()});
});

function handleFiles(event) {
    if (event.target.files) {
        var fileList = event.target.files;
    }
    else if (event.dataTransfer.files) {
        var fileList = event.dataTransfer.files;
    }
    for (var i = 0; i < fileList.length; i++) {
        switch (fileList[i].name) {
        case 'fid':
            $('#vfid').show();
            $('#bfid').show();
            data.fid = fileList[i];
            break;
        case 'procpar':
            if (vendor === 'bruker') {
                alert('Vendor mismatch');
                break;
            }
            $('#procpar').show();
            data.paramFile = fileList[i];
            vendor = 'varian';
            break;
        case 'text':
            if (vendor === 'bruker') {
                alert('Vendor mismatch');
                break;
            }
            $('#text').show();
            data.text = fileList[i];
            vendor = 'varian';
            break;
        case 'acqus':
            if (vendor === 'varian') {
                alert('Vendor mismatch');
                break;
            }
            $('#acqus').show();
            data.paramFile = fileList[i];
            vendor = 'bruker';
            break;
        default:
            alert('Unrecognized file type: ' + fileList[i].name);
        }
    }
    if (data.fid && data.paramFile) {
        // This only works with Varian right now
        readFID(data.fid);
    }
}

function readFID(file) {
    // At this point we're assuming Varian 1-D data (our test file)
    var reader = new FileReader();
    reader.onload = (function() {
        data.rawData = new DataView(reader.result);
        parseFID();
        // Switch to processor view
        $('#input_container').hide();
        showProcessor(); // in processor.js
    });
    reader.onerror = (function() {
        alert('You need to access this using Chrome either through a webserver or with the --allow-file-access-from-files flag.');
    });
    reader.readAsArrayBuffer(file);
}

function parseFID() {
    // Varian is always Big Endian
    // Bruker Endianness probably can be determined from acqus
    data.littleEndian = false; // Assume Varian for now

    // Get header info
    // I'm sure we don't actually need all of these
    data.nblocks = data.rawData.getInt32(0, data.littleEndian);
    $('#plot').append('nblocks:' + data.nblocks + '<br />');
    data.ntraces = data.rawData.getInt32(4, data.littleEndian);
    $('#plot').append('ntraces:' + data.ntraces + '<br />');
    data.np = data.rawData.getInt32(8, data.littleEndian); // # of data points
    $('#plot').append('np:' + data.np + '<br />');
    data.ebytes = data.rawData.getInt32(12, data.littleEndian); // 16/32-bit
    $('#plot').append('ebytes:' + data.ebytes + '<br />');
    data.tbytes = data.rawData.getInt32(16, data.littleEndian); // total data bytes
    $('#plot').append('tbytes:' + data.tbytes + '<br />');
    data.bbytes = data.rawData.getInt32(20, data.littleEndian); // bytes per block
    $('#plot').append('bbytes:' + data.bbytes + '<br />');
    data.version = data.rawData.getInt16(24, data.littleEndian);
    $('#plot').append('version:' + data.version + '<br />');
    data.status = data.rawData.getInt16(26, data.littleEndian);
    data.nbheaders = data.rawData.getInt16(28, data.littleEndian);
    $('#plot').append('nbheaders:' + data.nbheaders + '<br />');
    // Status bits:
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
    for (var i = 60; i < data.rawData.byteLength; i += 8) {
        // Separate real component from imaginary component
        // This is every other data point (i + 8)
        var point = data.rawData.getInt32(i, data.littleEndian);
        data.realData.push(point);
    }
    data.imaginaryData = new Array();
    // First imaginary data point is at 64 bytes
    for (i = 64; i < data.rawData.byteLength; i += 8) {
        // Get imaginary component
        point = data.rawData.getInt32(i, data.littleEndian);
        data.imaginaryData.push(point);
    } 
}