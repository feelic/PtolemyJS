function Ptolemy (canvasId) {

	var that = this;

	this.cells = [];
	this.width = 800;
	this.height = 800;

	this.paper = Raphael(canvasId, this.width, this.height);
	this.panZoom = this.paper.panzoom({ initialZoom: 0, initialPosition: { x: 0, y: 0} });
	this.panZoom.enable();

	/*
	 * Renders the map cells to an html element (with id = canvasId)
	 */
	this.render = function() {

		this.paper.clear();
		this.logTime('rendering start');
		var rect = this.paper.rect(0,0,this.width,this.height);
		rect.attr('fill','#428A9E');

		for (var i = 0; i < this.cells.length; i++) {
			this.cells[i].render();
		}
		this.logTime('rendering done');
		this.displayStatus();
	};

	/*
	 * Displays a box with all the current engine info
	 */
	this.displayStatus = function () {
		var elt = document.getElementById("enginestatus");
		if (elt) {
		document.getElementById('enginestatus').innerHTML = '<div id="enginestatus"></div>';
		}
	};

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
			e.cells.push({id : this.cells[i].id, path : this.cells[i].path, neighbours : this.cells[i].neighbours, height: this.cells[i].height});
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
		for (var i = 0; i < e.cells.length; i++) this.cells.push(new Cell(this, e.cells[i].id, e.cells[i].path, e.cells[i].neighbours, e.cells[i].height));

		if (callback) callback();
	};

	/*
	 * Logs time from script start + relative time since last log
	 */
	this.logTime = function (msg) {
		if (msg == 'reset') this.startTime = 0;
		if (this.startTime) {
			var t = Date.now();
			console.log ('time : '+(t - this.startTime)+' ('+(t - this.lastTimeLog)+' ms) '+msg);
			this.lastTimeLog = t;
		}
		else {
			this.startTime = Date.now();
			this.lastTimeLog = this.startTime;
			console.log ('start : 0');
		}
	};
}
