function Cell(engine, id, site, path, neighbours, borders, height) {

	var that = this;

	this.engine = engine;

	this.id = id;
	this.site = site;

	this.path = path;
	this.neighbours = neighbours;
	this.borders = borders;
	this.height = height;


	this.element = null;

	this.style = {
		'fill': '#FFFFFF',
		'stroke': '#666666',
		'stroke-width': 1,
		'stroke-linejoin': 'round',
		'stroke-dasharray': '', //[“”, “-”, “.”, “-.”, “-..”, “. ”, “- ”, “--”, “- .”, “--.”, “--..”]
		'text': {
			'text-anchor': 'middle',
			'font-size': 16,
			'font-family': 'arial',
			'fill': '#000000',
			'stroke': '#000000',
			'stroke-width': '',
			'letter-spacing': 1,
			'word-spacing': 1
		},
		'borders' : {

		}
	};

	this.data = {
		text : ''
	};

	/*
	 * Draws the cell
	 */
	this.render = function () {

		this.getDefaultRenderingParameters();
		if (this.ownerObject && this.ownerObject.getRenderingParameters) this.updateRenderingParameters(this.ownerObject.getRenderingParameters());

		var pathString = pathToString(this.path);
		this.element = this.engine.paper.path(pathString).attr(this.style);

		for (var key in this.style.borders) {
			if (this.borders[key]) {
				this.engine.paper.path(pathToString(this.borders[key])).attr(this.style.borders[key]);
			}
		}

		if (this.data.text) {
			this.textStrokeElement = this.engine.paper.text(this.site.x, this.site.y, this.data.text).attr(this.style.text);
			this.style.text['stroke-width'] = 0;
			this.textFillElement = this.engine.paper.text(this.site.x, this.site.y, this.data.text).attr(this.style.text);
			this.engine.texts.push(this.textStrokeElement);
			this.engine.texts.push(this.textFillElement);
		}

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

		switch(this.height) {
			case 4:
				this.style.fill = '#70661A';
				break;
			case 3:
				this.style.fill = '#80762A';
				break;
			case 2:
				this.style.fill = '#98A641';
				break;
			case 1:
				this.style.fill = '#6BC66E';
				break;
			case 0:
				this.style.fill = '#428A9E';
				break;
			case -1:
				this.style.fill = '#327A8E';
				break;
			default:
				throw new Error('Cell height not supported (height ' + this.height + ' at cell ' + this.id + ')');
		}

		this.style.stroke = '#666666';

	};

	/*
	 * Gets an object of parameters, applies it to the cell
	 */
	this.updateRenderingParameters = function (parameters) {
		for (var key in parameters.style) {
			this.style[key] = parameters.style[key];
		}
		for (var key in parameters.data) {
			this.data[key] = parameters.data[key];
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
		this.engine.resetTextLayer();
	};

	this.deselect = function () {
		this.render();
		this.selected = false;
		this.events.deselect.call(this);
		this.engine.resetTextLayer();
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
				that.engine.resetTextLayer();
			}
		});
		this.element.mouseout(function() {
			if (!that.selected) {
				that.render();
				if (that.engine.selectedCell) that.engine.selectedCell.element.toFront();
				that.engine.resetTextLayer();
			}
		});

	};

}
