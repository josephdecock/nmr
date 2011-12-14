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
    plotData(data.realData);
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
    svg.height($(window).height() - $('.button').outerHeight() - 5);
    $('#plot').height($(window).height() - $('.button').outerHeight - 5);
    // It is not clear at this point where the extra 5 pixels come from
    var points = '';
    for (var i = 1; i <= dataArray.length; i++) {
        points += i + ',' + dataArray[i - 1] + ' ';
    }
    var plot = document.createElementNS('http://www.w3.org/2000/svg',
                                        'polyline');
    plot.setAttributeNS(null, 'points', points);
    plot.setAttributeNS(null, 'fill', 'none');
    plot.setAttributeNS(null, 'stroke', 'blue');
    plot.setAttributeNS(null, 'stroke-width', '5');
    var maxAbsPoint =  Math.max(
        Math.max.apply(Math, dataArray),
        Math.abs(Math.min.apply(Math, dataArray)));
    var translateY = svg.innerHeight() / 2;
    var scaleX = svg.innerWidth() / dataArray.length;
    var scaleY = svg.innerHeight() / (2 * maxAbsPoint);
    plot.setAttributeNS(null, 'transform',
                        'translate(0 ' + translateY + ') ' +
                        'scale(' + scaleX + ' ' + scaleY + ')');
    svg.append(plot);
}