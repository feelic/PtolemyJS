function Engine (canvasId) {

	var that = this;

	this.mapcells = [];
	this.width = 800;
	this.height = 800;
	this.bbox = {xl:0, xr:this.width, yt:0, yb:this.height};
	this.diagram = null;
	this.margin = 0.1;

	this.paper = Raphael(canvasId, this.width, this.height);
	this.panZoom = this.paper.panzoom({ initialZoom: 3, initialPosition: { x: 100, y: 100} });
	this.panZoom.enable();

	/*
	 * Renders the map cells to an html element (with id = canvasId)
	 */
	this.render = function() {

		this.paper.clear();

		var rect = this.paper.rect(0,0,this.width,this.height);
		rect.attr('fill','#428A9E');

		for (var i = 0; i < this.mapcells.length; i++) {
			this.mapcells[i].render();
		}
		this.displayStatus();
	};

	/*
	 * Displays a box with all the current engine info
	 */
	this.displayStatus = function () {
		var elt = document.getElementById("enginestatus");
		if (elt) {
		document.getElementById('enginestatus').innerHTML = '<div id="enginestatus"><table><tr><td>origin</td><td>'+Math.floor(this.origin.x)+'</td><td>'+Math.floor(this.origin.y)+'</td></tr><tr><td>Zoom</td><td>'+this.zoomLevel+'</td><td></td></tr><tr id="enginestatus_click"></tr></table></div>';
		}
	};

	/*
	 * exports the map as a JSON for saving/ importing purposes
	 */
	this.exportMap = function () {
		
	}
}
