function Engine (canvasId) {

	var that = this;

	this.mapcells = [];
	this.width = 800;
	this.height = 800;
	this.bbox = {xl:0, xr:this.width, yt:0, yb:this.height};
	this.diagram = null;
	this.margin = 0.1;

	this.canvas = document.getElementById(canvasId);
	this.scaleFactor = 1;
	this.zoomLevel = 1;
	this.pan = {x : 0, y : 0};
	this.origin = { x : 0, y : 0 };

	/*
	 * Renders the map cells to an html element (with id = canvasId)
	 */
	this.render = function() {

		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0,0,this.width,this.height);

		ctx.rect(0,0,this.width,this.height);
		ctx.fillStyle = '#428A9E';
		ctx.fill();

		if(this.pan.x != 0 || this.pan.y != 0) {
			ctx.translate(this.pan.x,this.pan.y);

		}
		else {
			ctx.translate(this.origin.x, this.origin.y)
			ctx.scale(this.scaleFactor,this.scaleFactor);
			ctx.translate(-this.origin.x, -this.origin.y)
		}

		for (var i = 0; i < this.mapcells.length; i++) {
			this.mapcells[i].render();
		}
		this.displayStatus();
	}

	/*
	 * Displays a box with all the current engine info
	 */
	this.displayStatus = function () {
		var elt = document.getElementById("enginestatus");
		if (elt) {
		document.getElementById('enginestatus').innerHTML = '<div id="enginestatus"><table><tr><td>origin</td><td>'+Math.floor(this.origin.x)+'</td><td>'+Math.floor(this.origin.y)+'</td></tr><tr><td>Zoom</td><td>'+this.zoomLevel+'</td><td></td></tr><tr id="enginestatus_click"></tr></table></div>';
		}
	}

	// **************************************************************************** CELL SELECTION ********************************************************//

	/*
	 * Cell selector
	 */
	this.selectCellAtPoint = function (point) {
		//receives absolute coordinates 
		var c = this.getCellFromPoint(point);
		//console.log(c)
		if (c != -1) {
			this.renderCellSelection(c);
		}
	}

	/*
	 * returns the id of the cell containing the point parameter
	 */
	this.getCellFromPoint = function (point) {
		for (var i = 0; i < this.mapcells.length; i++) {
			if (isPointInPoly(this.mapcells[i].path, point)) return this.mapcells[i].id;
		}
		console.log('Not a cell');
		return -1;
	}

	/*
	 * re-renders currently selected cell
	 */
	this.renderCellSelection = function (cellId) {
		//cancel previous selection
		if(this.selectedCell) {
			this.selectedCell.strokeColor = false;
			var n = this.selectedCell.getNeighbours();
			for(var i = 0; i < n.length;i++) this.mapcells[n[i]].render();
			this.selectedCell.render();
		}
		//adds border
		this.selectedCell = this.mapcells[cellId];
		this.selectedCell.strokeColor = 'red';
		this.selectedCell.render();
	}

	/*
	 * gets canvas offset on the page for coordinate ajustment
	 */
	this.getCanvasOffset = function() {
		var element = this.canvas
		var top = 0, left = 0;
		do {
			top += element.offsetTop  || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
		} while(element);

		return { y: top, x: left };
	}

	/*
	 * converts coordinates from current zoom to model coordinates
	 */
    this.scalePoint = function (p) {
        var t = (this.zoomLevel - 1) * 10;
        for (var i = 1; i < t; i++) {
            p.x = p.x / 1.1;
            p.y = p.y / 1.1;
        }
        return p;
    }

	// **************************************************************************** MOVEMENT FUNCTIONS ********************************************************//

	/*
	 * Zooms In
	 */
	this.zoomIn = function () {
		if (this.zoomLevel < 2) { 

			// set scale and zoom
			this.scaleFactor = 1.1; 
			this.zoomLevel += 0.1;

			// set pan to 0
			this.pan = { x:0, y:0 }

			this.render();
		}
	}

	/*
	 * Zooms Out
	 */
	this.zoomOut = function () {
		if (this.zoomLevel > 1) {

			// set scale and zoom
			this.scaleFactor = 1 / 1.1; 
			this.zoomLevel -= 0.1;

			// set pan to 0
			this.pan = { x:0, y:0 }

			this.render();
		}
	}

	/*
	 * Pan to coordinates
	 */
	this.panToCoordinates = function (x, y) {

		this.scaleFactor = 1;

		this.pan.x = x;
		this.pan.y = y;

		this.render();
	}

	/*
	 * Pan canvas according to vertex a b
	 */
	this.panWithVertex = function (a,b) {

		// AJUST VERTEX EITHER HERE
		var x = ((b.x - a.x) / this.zoomLevel);
		var y = ((b.y - a.y) / this.zoomLevel);

		// OR THERE
		this.origin.x += x;
		this.origin.y += y;

		this.panToCoordinates(x, y);
	}

    this.toAbsolutePoint = function (p) {
		//the received Point is calculated from the document origin, we have to ajust it
		//to start with the canvas origin
		point = substractPoints(point, this.getCanvasOffset());
		//with the current zoom level
		point = this.scalePoint(point);
		//with the current origin, if the user has moved the map around
		point = substractPoints(point, this.origin);

        return point;
    }

    this.scalePoint = function (p) {
        var t = (this.zoomLevel - 1) * 10;
        for (var i = 1; i < t; i++) {
            p.x = p.x / 1.1;
            p.y = p.y / 1.1;
        }
        return p;
    }

	// **************************************************************************** CANVAS EVENT HANDLER ********************************************************//
	var mousePosition;

	this.canvas.addEventListener("mousedown", function(e){

		mousePosition = getMouse(e || event);

	}, false);

	this.canvas.addEventListener("mouseup", function(e){
		var point = getMouse(e || event);
		if(segmentLength(point,mousePosition)>10){
			that.panWithVertex(mousePosition, point);
		}
		else {
			var a = that.selectCellAtPoint(point);
		}
	}, false);



    this.scrollController = function (e) {
		var delta = 0;
	 
		if (!e) e = window.event;
	 
		// normalize the delta
		if (e.wheelDelta) {
		    // IE and Opera
		    delta = e.wheelDelta / 60;
		} else if (e.detail) {
		    // W3C
		    delta = -e.detail / 2;
		}
	 	if(delta>0) {
			that.zoomIn();
		}
		else {
			that.zoomOut();
		}
    }

    // Internet Explorer, Opera, Google Chrome and Safari
    this.canvas.addEventListener ("mousewheel", this.scrollController, false);
    // Firefox
    this.canvas.addEventListener ("DOMMouseScroll", this.scrollController, false);

}
