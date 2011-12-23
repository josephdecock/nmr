function Data() {
    this.files = new Object;
    this.params = new Object;
    this.rData = new Array; // Real FID data
    this.iData = new Array; // Imaginary FID data
    this.pData = new Array; // Processed data (after FT)
}

Data.prototype.plot = function() {
    var plotPoints = new Array;
    // Convert data into string of coordinates ('x,y x,y x,y')
    // x is the array index, y is the data point
    for (var i = 1; i <= this.rData.length; i++) {
        plotPoints.push(i + ',' + this.rData[i - 1]);
    }
    // Get maximum data point to determine plot height
    this.maxPoint = Math.max.apply(Math, this.rData);
    // Maximum absolute value point is needed to plot FID
    this.maxAbsPoint = Math.max(
        this.maxPoint, Math.abs(Math.min.apply(Math, this.rData)));
    if (!this.spectrum) {
        this.spectrum = document.createElementNS('http://www.w3.org/2000/svg',
                                                 'polyline');
        this.spectrum.setAttributeNS(null, 'fill', 'none');
        this.spectrum.setAttributeNS(null, 'stroke', 'blue');
        this.spectrum.setAttributeNS(null, 'stroke-width', '5');
        $('#svg').svg.append(this.spectrum);
    }
    this.spectrum.setAttributeNS(null, 'points', plotPoints.join(' '));
    this.transformPlot();
}

Data.prototype.transformPlot = function() {
    var svg = $('#svg');
    // Set svg canvas size to that of the available space in the window
    // It is not clear at this point where the extra 5 pixels come from
    svg.height($(window).height() - $('.menu').outerHeight() - 5);
    svg.width($(window).width());
    $('#plot').height($(window).height() - $('.menu').outerHeight - 5);
    // Puts the X-axis in the middle of the plot. Should only be used for FIDs
    var translateY = svg.innerHeight() / 2;
    // Scale the plot down to fit onto the SVG canvas
    var scaleX = svg.innerWidth() / data.rData.length;
    var scaleY = svg.innerHeight() / (2 * data.maxAbsPoint);
    this.spectrum.setAttributeNS(null, 'transform',
                        'translate(0 ' + translateY + ') ' +
                        'scale(' + scaleX + ' ' + scaleY + ')');
}

Data.prototype.ft = function() {
// Do DFT
}

Data.prototype.phase = function() {
// With no arguments do autophase
// Otherwise handle manual phasing
}

Data.prototype.baseline = function() {
// Do baseline correction
// This might involve calling Data.ft
}

Data.prototype.windowFunction = function() {
// Do window functions
// Will need to call Data.ft here again
}