function Ptolemy (canvasId) {

	var that = this;

	this.cells = [];
	this.width = 800;
	this.height = 800;

	this.paper = Raphael(canvasId, this.width, this.height);
	this.panZoom = this.paper.panzoom({ 'initialZoom': 0, 'initialPosition': { 'x': 100, 'y': 100} });
	this.panZoom.enable();

	/*
	 * Renders the map cells to an html element (with id = canvasId)
	 */
	this.render = function() {

		this.paper.clear();
		console.time('Rendering map');
		var rect = this.paper.rect(0,0,this.width,this.height);
		rect.attr('fill','#428A9E');

		this.texts = [];
		for (var i = 0; i < this.cells.length; i++) {
			this.cells[i].render();
		}

		this.resetTextLayer();

		console.timeEnd('Rendering map');
	};

	/*
	 * Moves all the texts the front
	 */
	this.resetTextLayer = function () {
		for (var i = 0; i < this.texts.length; i++) {
			this.texts[i].toFront();
		}
	}

	/*
	 * exports the map as a JSON for saving/ importing purposes
	 */
	this.exportMap = function () {
		var e = {
				width: this.width,
				height: this.height,
				cells : []
			};
		for (var i = 0; i < this.cells.length; i++) {
			e.cells.push({id : this.cells[i].id, site : this.cells[i].site, path : this.cells[i].path, neighbours : this.cells[i].neighbours, borders : this.cells[i].borders, height: this.cells[i].height});
		}
		return JSON.stringify(e);
	};

	/*
	 * imports a map/engine object
	 */
	this.importMap = function (e, callback) {

		this.width = e.width;
		this.height = e.height;

		this.cells = [];
		for (var i = 0; i < e.cells.length; i++) this.cells.push(new Cell(this, e.cells[i].id, e.cells[i].site, e.cells[i].path, e.cells[i].neighbours, e.cells[i].borders, e.cells[i].height));

		if (callback) callback();
	};

}
Ptolemy.version = '1.0';
Ptolemy.toString = function () {
	return 'PtolemyJS '+this.version+' - 2D map engine for JS games';
};
