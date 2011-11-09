function Data(rawData) {
    this.rawData = rawData;
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