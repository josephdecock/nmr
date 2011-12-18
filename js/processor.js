function initProcessor() {
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
    // Get maximum data point to determine plot height
    data.maxPoint = Math.max.apply(Math, data.rData);
    // Maximum absolute value point is needed to plot FID
    data.maxAbsPoint = Math.max(
        data.maxPoint, Math.abs(Math.min.apply(Math, data.rData)));
    data.plotPoints = new Array;
    // Convert dataArray into string of coordinates ('x,y x,y x,y')
    // x is the array index, y is the data point
    for (var i = 1; i <= data.rData.length; i++) {
        data.plotPoints.push(i + ',' + data.rData[i - 1]);
    }
    plotData();
    $(window).resize(function() {
        // Resize plot when window is resized
        $('#svg').empty();
        plotData();
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

function plotData() {
    var svg = $('#svg');
    // Set svg canvas size to that of the available space in the window
    // It is not clear at this point where the extra 5 pixels come from
    svg.height($(window).height() - $('.menu').outerHeight() - 5);
    svg.width($(window).width());
    $('#plot').height($(window).height() - $('.menu').outerHeight - 5);
    var plot = document.createElementNS('http://www.w3.org/2000/svg',
                                        'polyline');
    plot.setAttributeNS(null, 'points', data.plotPoints.join(' '));
    plot.setAttributeNS(null, 'fill', 'none');
    plot.setAttributeNS(null, 'stroke', 'blue');
    plot.setAttributeNS(null, 'stroke-width', '5');
    // Puts the X-axis in the middle of the plot. Should only be used for FIDs
    var translateY = svg.innerHeight() / 2;
    // Scale the plot down to fit onto the SVG canvas
    var scaleX = svg.innerWidth() / data.rData.length;
    var scaleY = svg.innerHeight() / (2 * data.maxAbsPoint);
    plot.setAttributeNS(null, 'transform',
                        'translate(0 ' + translateY + ') ' +
                        'scale(' + scaleX + ' ' + scaleY + ')');
    svg.append(plot);
}