
	// **************************************************************************** RANDOM WORLD GENERATION ********************************************************//

	/*
	 * Generates the corresponding voronoi diagram for a new random set of points, then applies noise to the borders and fools around with heights
	 */
	Ptolemy.prototype.newRandomWorld = function(cellCount, edgeNoise, callback) {
		this.cells = [];

		this.logTime();
		this.bbox = { xl : 0, xr : this.width, yt : 0, yb : this.height };
		this.diagram = null;
		this.margin = 0.1;

		this.grid = new random2DPointSet(this.width, this.height, 100, cellCount);
		this.logTime('grid done');

		var voronoi = new Voronoi();
		voronoi.recycle(this.diagram);
		this.diagram = voronoi.compute(this.grid.points, this.bbox);
		this.logTime('diagram done');

		this.applyNoisetoAllTheEdges(edgeNoise);
		this.logTime('noise done');

		for (var i = 0; i < this.diagram.cells.length; i++) {
			var c = this.diagram.cells[i];

			// CELL ID
			var id = c.site.voronoiId;

			// NEIGHBOUR ARRAY
			var neighbours = [];

			for (var j = 0; j < c.halfedges.length; j++) {
				if(c.halfedges[j].edge.lSite && c.halfedges[j].edge.lSite.voronoiId != id) 
					neighbours.push(c.halfedges[j].edge.lSite.voronoiId);
				else if (c.halfedges[j].edge.rSite)
					neighbours.push(c.halfedges[j].edge.rSite.voronoiId);
			}

			// PATH DEFINITION
			this.overZero.apply(c);
			var path = this.definePath.apply(c);
			this.cells.push(new Cell(this, id, path, neighbours));

		}
		this.logTime('cell loop end');

		this.randomizeHeights (Math.ceil(cellCount/500),Math.ceil(cellCount/100));

		this.logTime('randomize heights done');
		if(callback) callback.call(this);
	};

	/*
	 * Checks if all points are > 0, if not, set to 0
	 *
	 */
	Ptolemy.prototype.overZero = function () {
		for (var i = 0; i < this.halfedges.length; i++) {
			if(this.halfedges[i].edge.va.x<0) this.halfedges[i].edge.va.x = 0;
			if(this.halfedges[i].edge.va.y<0) this.halfedges[i].edge.va.y = 0;
			if(this.halfedges[i].edge.vb.x<0) this.halfedges[i].edge.vb.x = 0;
			if(this.halfedges[i].edge.vb.y<0) this.halfedges[i].edge.vb.y = 0;
		}
	};

	/*
	 * Gets the path from a voronoi cell 
	 */
	Ptolemy.prototype.definePath = function () {
		var path = [];
		var edges = [];
		for (var i = 0; i < this.halfedges.length; i++) {
			edges.push(this.halfedges[i].edge);
		}
		for (var k = 0; k <edges.length; k++) {
			edges[k].va.x = Math.round(edges[k].va.x);
			edges[k].va.y = Math.round(edges[k].va.y);
			edges[k].vb.x = Math.round(edges[k].vb.x);
			edges[k].vb.y = Math.round(edges[k].vb.y);
		}
		path.push(edges[0].va);
		i = 0;
		while ( edges.length > 0) {

			//Last inserted point
			var a = path[path.length-1];
			//Vertex to process
			var v = edges[i%edges.length];
			var va = edges[i%edges.length].va;
			var vb = edges[i%edges.length].vb;

			var msg = '';
			//The paths can be A - B or B - A, there is no way of knowing beforehand, we need to check for that, and not put twice the same point
			if ( Math.floor(100*a.x)/100 == Math.floor(100*va.x)/100 && Math.floor(100*a.y)/100 == Math.floor(100*va.y)/100 ) {
				edges.splice(edges.indexOf(v), 1);
				for(var j = 0; j < v.path.length;j++) {
					if(!(v.path[j].x == path[path.length-1].x && v.path[j].y ==path[path.length-1].y)) path.push(v.path[j]);
				}
				i = 0;

			}
			else if ( Math.floor(100*a.x )/100== Math.floor(100*vb.x)/100 && Math.floor(100*a.y)/100 == Math.floor(100*vb.y)/100  ) {
				edges.splice(edges.indexOf(v), 1);
				for(var j = (v.path.length-1);j>=0;j--) {
					if(!(v.path[j].x == path[path.length-1].x && v.path[j].y ==path[path.length-1].y)) path.push(v.path[j]);
				}
				i = 0;
			}
			else {
				i++;
			}

			if( i >= 50 ) break;
		}
		return path;
	};
	
	/*
	 * Gets a random noised path for each border between cells
	 */
	Ptolemy.prototype.applyNoisetoAllTheEdges = function(strength) {
		for(var i = 0; i < this.diagram.edges.length;i++){
			var e = this.diagram.edges[i];
			e.path = getNoisedPath(e.va, e.vb, strength);
		}
	};

	/*
	 * Uses a drunkard walk to set random heights on the map, then defines the height of all remaining cells
	 */
	Ptolemy.prototype.randomizeHeights = function (chains, chainLength) {
		//Screen border are always water
		for (var i = 0; i < this.cells.length; i++) {
			if (this.cells[i].isScreenBorders()) {
				this.cells[i].height = -1;
			}
		}
		
		//create a number of mountain ranges
		for(i = 0; i < chains; i++)	{
			var h = 4;
			var d = Math.floor(Math.random()*this.cells.length);
			var cell = this.cells[d];
			for(var j = 0; j < chainLength; j++) {
				if (!cell.height && cell.height !== 0) {
					cell.height = h;
					cell = this.cells[cell.neighbours[Math.floor(Math.random()*cell.neighbours.length)]];
				}
				else {
					if (i>=0 && j<=0) i--;
					break;
				}
			}
		}
		//a little bit more randomness, shall we?
		for (i = 0; i < this.cells.length/100; i++) {
			var a = Math.floor(Math.random()*this.cells.length);
			this.cells[a].height = getRandomInArray([-1,0,1,2,3]);
		}

		//sets heights according to neighbours to some random cells
		for (i = 0; i < this.cells.length/4; i++) {
			var a = Math.floor(Math.random()*this.cells.length);
			if (!this.cells[a].height && this.cells[a].height !== 0) {
				var h = this.getAvgHeightFromCellList(this.cells[a].neighbours) + getRandomInArray([-1,0,0,0,0,1]);
				if (h < -2) h = -2;
				if (h > 5) h = 5;
				this.cells[a].height = h;
			}
		}

		//sets the remaining cells heights
		for (i = 0; i < this.cells.length; i++) {
			if (!this.cells[i].height && this.cells[i].height !== 0) {
				var h = this.getAvgHeightFromCellList(this.cells[i].neighbours) + getRandomInArray([-1,0,0,0,0,1]);
				if (h < -2) h = -2;
				if (h > 5) h = 5;
				this.cells[i].height = h;
			}
			//getRandomIntegerInRange(-1,1);
		}
		//Screen border are ALWAYS water
		for (i = 0; i < this.cells.length; i++) {
			if (this.cells[i].isScreenBorders()) {
				this.cells[i].height = -1;
			}
		}
	};
	
	/*
	 * Gets the average height from an array of cell ids
	 */
	Ptolemy.prototype.getAvgHeightFromCellList = function (idList){
		a = 0;
		t = 0;
		for (var i = 0; i < idList.length; i++) {
			if(this.cells[idList[i]].height || this.cells[idList[i]].height === 0){
				a += this.cells[idList[i]].height;
				t++;
			}
		}
		return Math.round(a/t);
	};
