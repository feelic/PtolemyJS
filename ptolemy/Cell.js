function Cell(engine, id, path, neighbours, height) {

	var that = this;

	this.engine = engine;

	this.id = id;
	this.path = path;
	this.neighbours = neighbours;
	this.height = height;

	this.element = null;

	/*
	 * Draws the cell
	 */
	this.render = function () {

		this.getDefaultRenderingParameters();
		if (this.ownerObject && this.ownerObject.getRenderingParameters) this.ownerObject.getRenderingParameters();


		var style={
			fill: this.color,
			stroke: "#666",
			"stroke-width": 1,
			"stroke-linejoin": "round"
		};
		
		if (this.strokeColor) {
			style.stroke = this.strokeColor;
		}	
		else {
			style.stroke = '#666';
		}

		var pathString = 'M '+this.path[0].x+' '+this.path[0].y+' ';
		for (var i = 1; i < this.path.length; i++) {
			pathString += 'L '+this.path[i].x+' '+this.path[i].y+' ';
		}
		this.element = this.engine.paper.path(pathString).attr(style);

		this.setupEventListeners();
	};

	/*
	 * Logs the path
	 *
	 */
	this.logPath = function () {
		for (var i = 0; i < this.path.length; i++) {
			var plog = "";

			plog += Math.floor(this.path[i].x)+':';
			plog += Math.floor(this.path[i].y);
			console.log(plog);
		}
	};

	/*
	 * Checks if the cell is on the borders of the screen
	 *
	 */
	this.isScreenBorders = function () {
		for (var i = 0; i < this.path.length; i++) {
			var e = this.path[i];

			if (e.x <= 0 || e.x >= this.engine.width || e.y <= 0 || e.y >= this.engine.height) {
				return true;
			}
		}
		return false;
	};
	
	/*
	 * Default colors according to height
	 */
	this.getDefaultRenderingParameters = function () {
		this.height = Math.floor( this.height * 100 ) / 100;

		if (this.height <= 0 && this.height > -1 ) this.color = '#428A9E';
		else if (this.height <= -1) this.color = '#327A8E';
		else if (this.height== 1) this.color = '#6bc46d';
		else if(this.height == 2) this.color = '#6BC66E';
		else if(this.height == 3) this.color = '#98A641';
		else if(this.height == 4) this.color = '#80762A';
		else if(this.height > 4) this.color = '#70661A';

	};

	/*
	 * Gets an object of parameters, applies it to the cell
	 */
	this.updateRenderingParameters = function (parameters) {
		for (var key in parameters) {
			this[key] = parameters[key];
		}
	};

	/*
	 * Calculates the Area of the cell
	 *
	 */
	this.getArea = function () {
		if (this.path) {
			var area = 0;
			var j = this.path.length-1;

			for (var i=0; i<this.path.length; i++) { 
				area = area +  (this.path[j].x+this.path[i].x) * (this.path[j].y-this.path[i].y); 
				j = i;  //j is previous vertex to i
			}
			return area/2;
		}
		else return false;
	};

	this.select = function () {
		this.element.toFront();
		this.element.animate({ stroke: "#222"}, 300);
		this.selected = true;
		this.events.select.call(this);
	};

	this.deselect = function () {
		this.render();
		this.selected = false;
		this.events.deselect.call(this);
	};

	this.events = { 
		'select' : function () {
			console.log('Default selection event handler ! selected cell #'+this.id+', height: '+this.height);
		},
		'deselect' : function () {
			console.log('Default deselection event handler !');
		}
	};

	this.on = function (event, fn) {
		this.events[event] = fn;
	};

	this.setupEventListeners = function () {
		this.element.click(function() {
			if (!that.engine.panZoom.isDragging()) {
				if (that.engine.selectedCell) that.engine.selectedCell.deselect();
				that.select();
				that.engine.selectedCell = that;
			}
		});
		this.element.mouseover(function() {
			if (!that.selected) {
				this.toFront();
				this.animate({ stroke: "#444"}, 100);
			}
		});
		this.element.mouseout(function() {
			if (!that.selected) {
				that.render();
				if (that.engine.selectedCell) that.engine.selectedCell.element.toFront();
			}
		});

	};
}
