function Data() {
    this.files = new Object;
    this.params = new Object;
}

Data.prototype.plot = function() {
    var svg = $('#svg');
    // Set svg canvas size to that of the available space in the window
    // It is not clear at this point where the extra 5 pixels come from
    svg.height($(window).height() - $('.menu').outerHeight() - 5);
    svg.width($(window).width());
    $('#plot').height($(window).height() - $('.menu').outerHeight - 5);
    if (!this.spectrum) {
        this.spectrum = document.createElementNS('http://www.w3.org/2000/svg',
                                                 'polyline');
        this.spectrum.setAttributeNS(null, 'fill', 'none');
        this.spectrum.setAttributeNS(null, 'stroke', 'blue');
        this.spectrum.setAttributeNS(null, 'stroke-width', '5');
        this.spectrum.setAttributeNS(null, 'points', data.plotPoints.join(' '));
        svg.append(this.spectrum);
    }
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