function MapCell(engine, cell) {

	this.engine = engine;
	this.ownerObject;

	this.cell = cell;
	this.id = this.cell.site.voronoiId;

	this.path = [];

	/*
	 * Draws the cell
	 */
	this.render = function () {

		this.getDefaultRenderingParameters();
		if (this.ownerObject && this.ownerObject.getRenderingParameters) this.ownerObject.getRenderingParameters();

		var ctx = this.engine.canvas.getContext('2d');

		ctx.fillStyle = '#2e6689';
		ctx.fillStyle = this.color;
		//ctx.fillStyle = '#aaa';
		ctx.beginPath();

		ctx.moveTo(this.path[0].x,this.path[0].y);
		for (var i = 1; i < this.path.length; i++) {
			ctx.lineTo(this.path[i].x,this.path[i].y);
		}

		ctx.closePath();
		ctx.fill();
		
		if (this.strokeColor) {
			ctx.strokeStyle = this.strokeColor;
		}	
		else {
			ctx.strokeStyle = '#666';
			//ctx.strokeStyle = this.color;
		}
		ctx.stroke();
		ctx.textAlign = "center";

		//ctx.fillRect(this.cell.site.x,this.cell.site.y,1,1);
		
		/*
		ctx.fillStyle = 'red';
		ctx.font = "bold 8px Arial";
		ctx.fillText(this.id,this.cell.site.x,this.cell.site.y)
		*/
	}

	/*
	 * Gets the path from the voronoi cell 
	 */
	this.definePath = function () {
		this.overZero();
		//this.logHEdges();
		var edges = [];
		if (this.cell) {
			for (var i = 0; i < this.cell.halfedges.length; i++) {
				edges.push(this.cell.halfedges[i].edge);
			}

			this.path.push(edges[0].va);
			var i = 0;
			while ( edges.length > 0) {
				//Last inserted point
				var a = this.path[this.path.length-1];
				//Vertex to process
				var v = edges[i%edges.length];
				var va = edges[i%edges.length].va;
				var vb = edges[i%edges.length].vb;

				var msg = '';
				//The paths can be A - B or B - A, there is no way of knowing beforehand, we need to check for that, and not put twice the same point
				if ( Math.floor(100*a.x)/100 == Math.floor(100*va.x)/100 && Math.floor(100*a.y)/100 == Math.floor(100*va.y)/100 ) {
					edges.splice(edges.indexOf(v), 1);
					this.path = this.path.concat(v.path);
					i = 0;
				}
				else if ( Math.floor(100*a.x )/100== Math.floor(100*vb.x)/100 && Math.floor(100*a.y)/100 == Math.floor(100*vb.y)/100  ) {
					edges.splice(edges.indexOf(v), 1);
					for(var j = (v.path.length-1);j>=0;j--) {
						this.path.push(v.path[j]);
					}
					i = 0;
				}
				else {

					i++;
				}

				if( i >= 50 ) break;

			}
		}
		else {
			console.log("define path error on cell "+this.id)
		}

		//this.logPath();
	}

	/*
	 * Logs the path from the voronoi cell
	 */
	this.logHEdges = function () {
		for (var i = 0; i < this.cell.halfedges.length; i++) {
			var plog = "";

			plog += Math.floor(this.cell.halfedges[i].edge.va.x)+':'
			plog += Math.floor(this.cell.halfedges[i].edge.va.y)+' - '
			plog += Math.floor(this.cell.halfedges[i].edge.vb.x)+':'
			plog += Math.floor(this.cell.halfedges[i].edge.vb.y)+''
			console.log(plog);
		}
	}
	/*
	 * Logs the path
	 *
	 */
	this.logPath = function () {
		for (var i = 0; i < this.path.length; i++) {
			var plog = "";

			plog += Math.floor(this.path[i].x)+':'
			plog += Math.floor(this.path[i].y);
			console.log(plog);
		}
	}

	/*
	 * Checks if the cell is on the borders of the screen
	 *
	 */
	this.isScreenBorders = function () {
		for (var i = 0; i < this.cell.halfedges.length; i++) {
			var e = this.cell.halfedges[i].edge;

			if (e.va.x <= 0 || e.va.x >= this.engine.width || e.va.y <= 0 || e.va.y >= this.engine.height || e.vb.x <= 0 || e.vb.x >= this.engine.width || e.vb.y <= 0 || e.vb.y >= this.engine.height) {

			return true;

			}
		}

		return false;
	}
	
	/*
	 * Default colors according to height
	 */
	this.getDefaultRenderingParameters = function () {
		if(this.height == -2) this.color = '#2e6689';
		if(this.height <= -1) this.color = '#327A8E';
		if(this.height == 0) this.color = '#428A9E';
		if(this.height == 1) this.color = '#6BC66E';
		if(this.height == 2) this.color = '#6BC66E';
		if(this.height == 3) this.color = '#98A641';
		if(this.height == 4) this.color = '#80762A';
		if(this.height > 4) this.color = '#70661A';
	}

	/*
	 * Gets an object of parameters, applies it to the cell
	 */
	this.updateRenderingParameters = function (parameters) {
		for(key in parameters) {
			this[key] = parameters[key];
		}
	}


	/*
	 * Checks if all points are > 0, if not, set to 0
	 *
	 */
	this.overZero = function () {
		if (this.cell) {
			for (var i = 0; i < this.cell.halfedges.length; i++) {
				if(this.cell.halfedges[i].edge.va.x<0) this.cell.halfedges[i].edge.va.x = 0;
				if(this.cell.halfedges[i].edge.va.y<0) this.cell.halfedges[i].edge.va.y = 0;
				if(this.cell.halfedges[i].edge.vb.x<0) this.cell.halfedges[i].edge.vb.x = 0;
				if(this.cell.halfedges[i].edge.vb.y<0) this.cell.halfedges[i].edge.vb.y = 0;
			}
		}
		else {
			console.log('error overZero def on cell '+this.id);
		}
	}

	/*
	 * Gets an array of the cell's neighbours ids
	 *
	 */
	this.getNeighbours = function () {
		n = [];
		for (var i = 0; i < this.cell.halfedges.length; i++) {
			if(this.cell.halfedges[i].edge.lSite && this.cell.halfedges[i].edge.lSite.voronoiId != this.id) 
				n.push(this.cell.halfedges[i].edge.lSite.voronoiId);
			else if (this.cell.halfedges[i].edge.rSite)
				n.push(this.cell.halfedges[i].edge.rSite.voronoiId);
		}
		return n;
	}

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
	}
	this.definePath();
}
