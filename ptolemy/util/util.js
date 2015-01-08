//RANDOM 2D POINT SET
function random2DPointSet( width, height, min_dist, count ) {
	this.width = width;
	this.height = height;
	
	this.cellSize = min_dist/Math.sqrt(2);
	this.iw = Math.ceil(width/this.cellSize);
	this.ih = Math.ceil(height/this.cellSize);
	
	this.points = [];

	for (var i = 0;i < count;i++) {
		var x = getRandomIntegerInRange(0, width);
		var y = getRandomIntegerInRange(0, height);
		this.points.push({ x : x, y : y });
	}
}


function getRandomInArray(a) {
	return a[Math.floor(Math.random()*a.length)];
}

function getMouse(e){
    var w = window, b = document.body;
	if (!e) e = window.event;
    return {x: e.clientX + (w.scrollX || b.scrollLeft || b.parentNode.scrollLeft || 0),
    y: e.clientY + (w.scrollY || b.scrollTop || b.parentNode.scrollTop || 0)};
}

function interpolate (A, B, f) {
	var x = ( f * A.x ) + ( (1 - f) * B.x );
	var y = ( f * A.y ) + ( (1 - f) * B.y );
	return ({x : x, y : y});
}

function getRandomInRange (min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomIntegerInRange (min, max) {
    max += 1;
	return Math.floor(Math.random() * (max - min) + min);
}

function addPoints( a, b ) {
	return { x: a.x + b.x, y : a.y + b.y };
}

function substractPoints( a, b ) {
	return { x: a.x - b.x, y : a.y - b.y };
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && 
		(pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && 
		(c = !c);
    return c;
}

function segmentLength(A, B) {
	var xs = 0;
	var ys = 0;

	xs = B.x - A.x;
	xs = xs * xs;

	ys = B.y - A.y;
	ys = ys * ys;

	return Math.sqrt( xs + ys );
}

