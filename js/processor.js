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
    var maxPoint =  Math.max.apply(Math, dataArray);
    var translateY = svg.innerHeight() / 2;
    var scaleX = svg.innerWidth() / dataArray.length;
    var scaleY = svg.innerHeight() / (2 * maxPoint);
    plot.setAttributeNS(null, 'transform',
                        'translate(0 ' + translateY + ') ' +
                        'scale(' + scaleX + ' ' + scaleY + ')');
    svg.append(plot);
}