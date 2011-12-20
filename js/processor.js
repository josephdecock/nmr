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
    data.plot();
    $(window).resize(function() {
        // Resize plot when window is resized
        data.plot();
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
