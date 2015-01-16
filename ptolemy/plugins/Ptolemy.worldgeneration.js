
	// **************************************************************************** RANDOM WORLD GENERATION ********************************************************//

	/*
	 * Generates the corresponding voronoi diagram for a new random set of points, then applies noise to the borders and fools around with heights
	 */
	Ptolemy.prototype.newRandomWorld = function(cellCount, edgeNoise, callback) {
		this.cells = [];

		this.logTime('reset');
		this.bbox = { xl : 0, xr : this.width, yt : 0, yb : this.height };
		this.diagram = null;
		this.margin = 0.1;

		this.grid = new random2DPointSet(this.width, this.height, 50, cellCount);
		this.logTime('grid done');

		var voronoi = new Voronoi();
		voronoi.recycle(this.diagram);
		this.diagram = voronoi.compute(this.grid.points, this.bbox);
		this.logTime('diagram done');

		this.randomizeHeights (Math.ceil(cellCount/200),Math.ceil(cellCount/50));
		this.logTime('randomize heights done');

		this.buildNoisyEdges();
		this.logTime('noise done');

		for (var i = 0; i < this.diagram.cells.length; i++) {
			var c = this.diagram.cells[i];

			// PATH DEFINITION
			var path = this.definePath(i);
		
			this.cells.push(new Cell(this, c.site.voronoiId, c.path, c.getNeighborIds(), c.height));

		}
		this.logTime('cell loop end, '+this.cells.length+' cells created');

		for (var i = 0; i < this.diagram.cells.length; i++) {
			for (var j = 0; j < this.diagram.cells[i].path.length; j++) {
				var x = Math.round(this.diagram.cells[i].path[j].x);
				var y = Math.round(this.diagram.cells[i].path[j].y);		

				this.diagram.cells[i].path[j].x = x;
				this.diagram.cells[i].path[j].y = y;
			}	
		}
		this.logTime('rounding path points done');

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

	// Build noisy line paths for each of the Voronoi edges. There are two noisy line paths for each edge, each covering half the
	// distance: path0 is from v0 to the midpoint and path1 is from v1 to the midpoint. When drawing the polygons, one or the other
	// must be drawn in reverse order.
	Ptolemy.prototype.buildNoisyEdges = function () {

		for (var i = 0; i < this.diagram.edges.length; i++) {
			var edge = this.diagram.edges[i];
			if (edge.rSite && edge.lSite && edge.va && edge.vb) {
				var f = 0.5;
				var t = interpolate(edge.va, edge.rSite, f);
				var q = interpolate(edge.va, edge.lSite, f);
				var r = interpolate(edge.vb, edge.rSite, f);
				var s = interpolate(edge.vb, edge.lSite, f);
				var midpoint = interpolate(edge.vb, edge.va, f);
				var minLength = 10;

				if (this.diagram.cells[edge.rSite.voronoiId].height != this.diagram.cells[edge.lSite.voronoiId].height) minLength = 3;
				if (this.diagram.cells[edge.rSite.voronoiId].height <= 0 && this.diagram.cells[edge.lSite.voronoiId].height <= 0 ) minLength = 100;
				if (this.diagram.cells[edge.rSite.voronoiId].height <= 0 && this.diagram.cells[edge.lSite.voronoiId].height > 0 ) minLength = 1;
				if (this.diagram.cells[edge.rSite.voronoiId].height > 0 && this.diagram.cells[edge.lSite.voronoiId].height <= 0 ) minLength = 1;

				edge.path = this.buildNoisyLineSegments( edge.va, t, midpoint, q, minLength);
				edge.path.concat(this.buildNoisyLineSegments( edge.vb, s, midpoint, r, minLength));
				edge.path.push(edge.vb);
			}
			else {
				edge.path = [edge.va, edge.vb];
			}
		}
	};

	// Helper function: build a single noisy line in a quadrilateral A-B-C-D, and store the output points in an array.
	Ptolemy.prototype.buildNoisyLineSegments = function (A, B, C, D, minLength) {
		var points = [];

		function subdivide(A, B, C, D) {
			if (segmentLength(A, C) < minLength || segmentLength(B, D) < minLength) {
				return;
			}
			// Subdivide the quadrilateral
			var p = getRandomInRange(0.2, 0.8); // vertical (along A-D and B-C)
			var q = getRandomInRange(0.2, 0.8); // horizontal (along A-B and D-C)
			// Midpoints
			var E = interpolate(A, D, p);
			var F = interpolate(B, C, p);
			var G = interpolate(A, B, q);
			var I = interpolate(D, C, q);
			// Central point
			var H = interpolate(E, F, q);
			// Divide the quad into subquads, but meet at H
			var s = 1.0 - getRandomInRange(-0.4, +0.4);
			var t = 1.0 - getRandomInRange(-0.4, +0.4);
			subdivide(A, interpolate(G, B, s), H, interpolate(E, D, t));
			points.push(H);
			subdivide(H, interpolate(F, C, s), C, interpolate(I, D, t));
		}

		points.push(A);
		subdivide(A, B, C, D);
		points.push(C);

		return points;
	};

	Ptolemy.prototype.definePath = function (cellid) {
		var cell =  this.diagram.cells[cellid];

		var path = [];
		var edges = [];
		for (var i = 0; i < cell.halfedges.length; i++) {
			//console.log(cell.halfedges[i].edge.va.x+' : '+cell.halfedges[i].edge.va.y+' -> '+cell.halfedges[i].edge.vb.x+' : '+cell.halfedges[i].edge.vb.y)
			edges.push(cell.halfedges[i].edge);
		}

		path.push(edges[0].va);
		var i = 0;
		while ( edges.length > 0) {

			//Last inserted point
			var a = path[path.length-1];
			//Vertex to process
			var v = edges[i%edges.length];
			var va = edges[i%edges.length].va;
			var vb = edges[i%edges.length].vb;

			var msg = '';
			//The paths can be A - B or B - A, there is no way of knowing beforehand, we need to check for that, and not put twice the same point
			if ( a.x == va.x && a.y == va.y ) {
				edges.splice(edges.indexOf(v), 1);
				for(var j = 0; j < v.path.length;j++) {
					if(!(v.path[j].x == path[path.length-1].x && v.path[j].y ==path[path.length-1].y)) path.push(v.path[j]);
				}
				i = 0;

			}
			if ( a.x == vb.x && a.y == vb.y ) {
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
		cell.path = path;
	};

	/*
	 * Gets the average height from an array of cell ids
	 */
	Ptolemy.prototype.getAvgHeightFromCellList = function (idList){
		var a = 0;
		var t = 0;
		for (var i = 0; i < idList.length; i++) {
			if(this.diagram.cells[idList[i]].height || this.diagram.cells[idList[i]].height === 0){
				a += this.diagram.cells[idList[i]].height;
				t++;
			}
		}
		return a/t;
	};

	/*
	 *	Returns the number of coast edges for a given cell
	 */
	Ptolemy.prototype.countCoasts = function (cell) {
		var n = cell.getNeighborIds();
		var a = 0;
		for (var i = 0; i < n.length; i++) {
			if(cell.height > 0 && this.diagram.cells[n[i]].height === 0){
				a++;
			}
			else if (cell.height <= 0 && this.diagram.cells[n[i]].height > 0) {
				a++;
			}
		}
		return a;
	};

	Ptolemy.prototype.randomizeHeights = function () {


		var total = this.diagram.cells.length;
		//set screenborder to deepest water
		var borderneighbours = [];
		for (var i = 0; i < this.diagram.cells.length; i++) {
			for (var j = 0; j < this.diagram.cells[i].halfedges.length; j++) {
				var e = this.diagram.cells[i].halfedges[j].edge;
				if ( e.va.x <= 0 || e.va.y <= 0 || e.va.x >= this.width || e.va.y >= this.width || e.vb.x <= 0 || e.vb.y <= 0 || e.vb.x >= this.width || e.vb.y >= this.width ) {
					this.diagram.cells[i].height = -1;
					borderneighbours = borderneighbours.concat(this.diagram.cells[i].getNeighborIds());
				}
			}
		}

		//set screenborder borders to water
		for (var i = 0; i < borderneighbours.length; i++) {
			if (!this.diagram.cells[borderneighbours[i]].height || this.diagram.cells[borderneighbours[i]].height != -1) this.diagram.cells[borderneighbours[i]].height = 0;
		}

		//only the cells in the center should be used to make the land
		var center = [];
		for (var i = 0; i < this.diagram.cells.length; i++) {
			if (!this.diagram.cells[i].height && this.diagram.cells[i].height !== 0) {
				center.push(this.diagram.cells[i]);
			}
		}

		var centertotal = center.length;
		for(var i = 0; i < centertotal; i++) {
			var a = 0.4 + noise.perlin2(center[i].site.x / 200, center[i].site.y / 200);
			center[i].height =  Math.round(a * 5);
		}
		/*
		var i = 0;
		while (i < Math.ceil(centertotal/20) ) {
			var cell = getRandomInArray(center);
			if (this.countCoasts(cell) >= 1) {
				cell.height = 0;
				var n = cell.getNeighborIds();
				for(var j = 0; j < n.length;j++) {
					this.diagram.cells[n[j]].height = 0;
				}
			}
		}
		*/
		shuffle(center);

		//smoothen the land
		for (var i = 0; i < center.length; i++) {
			var cell = center[i];
			var avgh = this.getAvgHeightFromCellList(cell.getNeighborIds());
			if (avgh < 1 ) cell.height = getRandomInArray([0,1,1]);

			else if (cell.height === 1) cell.height = Math.round(avgh) + getRandomInArray([-1,0,0,0,0,1]);
		}

		//coasts should be lowest land height
		for (var i = 0; i < center.length; i++) {
			if (center[i].height > 0 && this.countCoasts(center[i]) > 0) center[i].height = 1;
		}

		shuffle(center);

		//smoothen the land
		for (var i = 0; i < center.length; i++) {
			cell = center[i];
			var avgh = this.getAvgHeightFromCellList(cell.getNeighborIds());
			if (avgh < 1 ) cell.height = 1;
			else if (cell.height === 1) cell.height = Math.round(avgh) + getRandomInArray([-1,0,0,0,0,1]);
		}
		//coasts should be lowest land height
		for (var i = 0; i < center.length; i++) {
			if (this.countCoasts(center[i]) > 0) center[i].height = 1;
		}
	};

