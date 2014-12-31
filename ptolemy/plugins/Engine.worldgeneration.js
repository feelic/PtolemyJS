
	// **************************************************************************** RANDOM WORLD GENERATION ********************************************************//

	/*
	 * Generates the corresponding voronoi diagram for a new random set of points, then applies noise to the borders and fools around with heights
	 */
	Engine.prototype.newRandomWorld = function(cellCount, edgeNoise, callback) {
	
		this.grid = new random2DPointSet(this.width, this.height, 100, cellCount);
			
		var voronoi = new Voronoi()
		voronoi.recycle(this.diagram);
		this.diagram = voronoi.compute(this.grid.points, this.bbox);
	
		this.applyNoisetoAllTheEdges(edgeNoise);
		
		for (var i = 0; i < this.grid.points.length; i++) {
			if(this.diagram.cells[i]) this.mapcells.push(new MapCell(this, this.diagram.cells[i]));
		}

		this.randomizeHeights (Math.ceil(cellCount/500),Math.ceil(cellCount/100));

		if(callback) callback.call(this);
	}
	
	/*
	 * Gets a random noised path for each border between cells
	 */
	Engine.prototype.applyNoisetoAllTheEdges = function(strength) {
		for(var i = 0; i < this.diagram.edges.length;i++){
			var e = this.diagram.edges[i];
			e.path = getNoisedPath(e.va, e.vb, strength);
		}
	}

	/*
	 * Uses a drunkard walk to set random heights on the map, then defines the height of all remaining cells
	 */
	Engine.prototype.randomizeHeights = function (chains, chainLength) {
		//Screen border are always water
		for (var i = 0; i < this.mapcells.length; i++) {
			if (this.mapcells[i].isScreenBorders()) {
				this.mapcells[i].height = -1;
			}
		}
		
		//create a number of mountain ranges
		for(var i = 0; i < chains; i++)	{
			var h = 4;
			var cell = this.mapcells[Math.floor(Math.random()*this.mapcells.length)];
			for(var j = 0; j < chainLength; j++) {

				if (!cell.height && cell.height != 0) {

					cell.height = h;
					var n = cell.getNeighbours();
					cell = this.mapcells[n[Math.floor(Math.random()*n.length)]];
					//console.log(cell);
				}
				else {
					if (i>=0 && j<=0) i--;
					break;
				}
			}
		}
		//a little bit more randomness, shall we?
		for (var i = 0; i < this.mapcells.length/100; i++) {
			var a = Math.floor(Math.random()*this.mapcells.length);
			this.mapcells[a].height = getRandomInArray([-1,0,1,2,3]);
		}

		//sets heights according to neighbours to some random cells
		for (var i = 0; i < this.mapcells.length/4; i++) {
			var a = Math.floor(Math.random()*this.mapcells.length);
			if (!this.mapcells[a].height && this.mapcells[a].height != 0) {
				var h = this.getAvgHeightFromCellList(this.mapcells[a].getNeighbours()) + getRandomInArray([-1,0,0,0,0,1]);
				if (h < -2) h = -2;
				if (h > 5) h = 5;
				this.mapcells[a].height = h;
			}
		}

		//sets the remaining cells heights
		for (var i = 0; i < this.mapcells.length; i++) {
			if (!this.mapcells[i].height && this.mapcells[i].height != 0) {
				var h = this.getAvgHeightFromCellList(this.mapcells[i].getNeighbours()) + getRandomInArray([-1,0,0,0,0,1]);
				if (h < -2) h = -2;
				if (h > 5) h = 5;
				this.mapcells[i].height = h;
			}
			//getRandomIntegerInRange(-1,1);
		}
		//Screen border are ALWAYS water
		for (var i = 0; i < this.mapcells.length; i++) {
			if (this.mapcells[i].isScreenBorders()) {
				this.mapcells[i].height = -1;
			}
		}
	}
	
	/*
	 * Gets the average height from an array of cell ids
	 */
	Engine.prototype.getAvgHeightFromCellList = function (idList){
		a = 0;
		t = 0;
		for (var i = 0; i < idList.length; i++) {
			if(this.mapcells[idList[i]].height || this.mapcells[idList[i]].height == 0){
				a += this.mapcells[idList[i]].height;
				t++;
			}
		}
		return Math.round(a/t);
	}
