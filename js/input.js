'use strict';

var vendor;
var data;

$(document).ready(function() {
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
    $(document).bind('dragenter dragover drop', false);
    // Set styles for drag and drop input
    dropBox.bind('dragenter', function() {setDrag()});
    dropBox.bind('dragover', function () {setDrag()});
    dropBox.bind('dragleave', function() {unsetDrag()});
    dropBox.bind('drop', function() {unsetDrag()});
});

function handleFiles(event) {
    if (event.target.files) {
        var inputFiles = event.target.files;
    }
    else if (event.dataTransfer.files) {
        var inputFiles = event.dataTransfer.files;
    }
    for (var i = 0; i < inputFiles.length; i++) {
        switch (inputFiles[i].name) {
        case 'fid':
            $('.fid').show();
            data.files.fid = inputFiles[i];
            break;
        case 'procpar':
            if (vendor === 'bruker') {
                alert('Vendor mismatch');
                break;
            }
            $('.procpar').show();
            data.files.procpar = inputFiles[i];
            vendor = 'varian';
            break;
        case 'text':
            if (vendor === 'bruker') {
                alert('Vendor mismatch');
                break;
            }
            $('.text').show();
            data.files.text = inputFiles[i];
            vendor = 'varian';
            break;
        case 'acqus':
            if (vendor === 'varian') {
                alert('Vendor mismatch');
                break;
            }
            $('.acqus').show();
            data.files.acqus = inputFiles[i];
            vendor = 'bruker';
            break;
        default:
            alert('Unrecognized file type: ' + inputFiles[i].name);
        }
    }
    var fileList = '';
    for (var file in data.files) {
        fileList += '<li>' + file + '</li>';
    }
    $('#file_list').html(fileList);
    if (data.files.fid && (data.files.procpar || data.files.acqus)) {
        $('#submit').attr('disabled', false);
        $('#submit').bind('click', function() {readFiles(vendor);});
    }
}

function readFiles(vendor) {
    var parseFID;
    switch (vendor) {
    case 'varian':
        parseProcpar(data.files.procpar);
        parseFID = parseFIDVarian;
        break;
    case 'bruker':
        parseAcqus(data.files.acqus);
        parseFID = parseFIDBruker;
        break;
    default:
        throw new Error('readFiles(): invalid value for vendor');
    }
    var reader = new FileReader();
    reader.onload = (function() {
        data.rawData = new DataView(reader.result);
        parseFID();
        // Switch to processor view
        $('#input_container').hide();
        initProcessor(); // in processor.js
    });
    reader.onerror = (function() {
        alert('You need to access this using Chrome either through a webserver or with the --allow-file-access-from-files flag.');
    });
    reader.readAsArrayBuffer(data.files.fid);
}

function parseProcpar() {
}

function parseAcqus() {
    var reader = new FileReader();
    reader.onload = (function() {
        var lines = reader.result.split('\n');
        for (var i in lines) {
            if (data.littleEndian === undefined) {
                var match = /##\$BYTORDA= (\d)/.exec(lines[i]);
                if (match) {
                    // (\d) = 1 indicates big endian
                    data.littleEndian = (match[1] == 1) ? false : true;
                }
            }
        }
    });
    reader.onerror = (function() {
        console.log(reader.error.code);
    });
    reader.readAsText(data.files.acqus);
}

function parseFIDVarian() {
    // Varian data is always big endian
    // Get header info
    //data.params.nblocks = data.rawData.getInt32(0, false);
    //data.params.ntraces = data.rawData.getInt32(4, false);
    //data.params.np = data.rawData.getInt32(8, false); // # of data points
    data.params.ebytes = data.rawData.getInt32(12, false); // 16/32-bit
    //data.params.tbytes = data.rawData.getInt32(16, false); // total data bytes
    //data.params.bbytes = data.rawData.getInt32(20, false); // bytes per block
    //data.params.version = data.rawData.getInt16(24, false);
    data.params.status = data.rawData.getInt16(26, false);
    //data.params.nbheaders = data.rawData.getInt16(28, false);
    // Status bits:
    //data.params.dataExists = data.params.status & 0x1;
    //data.params.dataType = (data.params.status & 0x2) ? 'spectrum': 'FID';
    data.params.numType = (data.params.status & 0x8) ?
        'Float32' :
        (data.params.status & 0x4) ?
        'Int32' : 'Int16';
    switch (data.params.numType) {
    case 'Int16':
        data.rawData.getValues = data.rawData.getInt32;
        break;
    case 'Int32':
        data.rawData.getValues = data.rawData.getInt32;
        break;
    case 'Float32':
        data.rawData.getValues = data.rawData.getFloat32;
        break;
    }
    //data.params.complex = data.params.status & 0x10;
    //data.params.hypercomplex = data.params.status & 0x20;
    // I don't know what the rest of the status bits are for
    // and I don't really care at this point.
    
    // The next 28(?) bytes are the block header, which basically
    // just repeats the file status.
    // We might need the correction values though...

    data.rData = new Array();
    data.iData = new Array();
    // Actual data starts after 60 bytes
    for (var i = 60; i < data.rawData.byteLength; i += 2 * data.params.ebytes) {
        // Separate real component from imaginary component
        // This is every other data point
        var rPoint = data.rawData.getValues(i, false);
        data.rData.push(rPoint);
        var iPoint = data.rawData.getValues(i + data.params.ebytes, false);
        data.iData.push(iPoint);
    }
}

function parseFIDBruker() {
    // Bruker data is (probably) always 32-bit integers
    data.rData = new Array();
    data.iData = new Array();
    for (var i = 0; i < data.rawData.byteLength; i += 8) {
        // Separate real component from imaginary component
        // This is every other data point
        var rPoint = data.rawData.getInt32(i, data.littleEndian);
        data.rData.push(rPoint);
        var iPoint = data.rawData.getInt32(i + 4, data.littleEndian);
        data.iData.push(iPoint);
    }
}