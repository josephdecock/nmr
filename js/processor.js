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
    plotData(data.rData);
    $(window).resize(function() {
        // Resize plot when window is resized
        $('#svg').empty();
        plotData(data.rData);
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

function plotData(dataArray) {
    var svg = $('#svg');
    // Set svg canvas height to that of the available space in the window
    // It is not clear at this point where the extra 5 pixels come from
    svg.height($(window).height() - $('.menu').outerHeight() - 5);
    $('#plot').height($(window).height() - $('.menu').outerHeight - 5);
    var points = new Array;
    // Convert dataArray into string of coordinates ('x,y x,y x,y')
    // x is the array index, y is the data point
    for (var i = 1; i <= dataArray.length; i++) {
        points.push(i + ',' + dataArray[i - 1]);
    }
    var plot = document.createElementNS('http://www.w3.org/2000/svg',
                                        'polyline');
    plot.setAttributeNS(null, 'points', points.join(' '));
    plot.setAttributeNS(null, 'fill', 'none');
    plot.setAttributeNS(null, 'stroke', 'blue');
    plot.setAttributeNS(null, 'stroke-width', '5');
    // Get maximum (absolute value) data point to determine plot height
    var maxAbsPoint =  Math.max(
        Math.max.apply(Math, dataArray),
        Math.abs(Math.min.apply(Math, dataArray)));
    // Puts the X-axis in the middle of the plot. Should only be used for FIDs
    var translateY = svg.innerHeight() / 2;
    // Scale the plot down to fit onto the SVG canvas
    var scaleX = svg.innerWidth() / dataArray.length;
    var scaleY = svg.innerHeight() / (2 * maxAbsPoint);
    plot.setAttributeNS(null, 'transform',
                        'translate(0 ' + translateY + ') ' +
                        'scale(' + scaleX + ' ' + scaleY + ')');
    svg.append(plot);
}