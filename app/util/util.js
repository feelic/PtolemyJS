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

//UTIL FUNCTIONS
function getNoisedPath (A, B, i) {
	var p = [A];
	var ps = getNoisedSegment (A, B,i/4);
	p = p.concat(ps);
	p.push(B);
	return p;
}

function getNoisedSegment (A, B, i) {
	var mid = getRandomPointBetween (A, B);
	if (i > 0) return getNoisedSegment(A, mid, Math.floor(i/2) ).concat(mid, getNoisedSegment(mid,B,Math.floor(i/2)) );
	else return [mid];
}

function getRandomPointBetween (A, B) {
	var point = {};
	
	n = Math.abs(A.x - B.x)/2;
	m = Math.abs(A.y - B.y)/2;
	point.x = Math.round(( A.x + B.x ) / 2 + getRandomIntegerInRange(-n, n));
	point.y = Math.round(( A.y + B.y ) / 2 + getRandomIntegerInRange(-m, m));

	return point;
}

function getRandomInRange (min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomIntegerInRange (min, max) {
    max+=1;
	return Math.floor(Math.random() * (max - min) + min);
}

function getRandomInArray(a) {
	return a[Math.floor(Math.random()*a.length)];
}

function addPoints( a, b ) {
	return { x: a.x + b.x, y : a.y + b.y }
}

function substractPoints( a, b ) {
	return { x: a.x - b.x, y : a.y - b.y }
}

function segmentLength(a, b) {
  var xs = 0;
  var ys = 0;

  xs = b.x - a.x;
  xs = xs * xs;

  ys = b.y - a.y;
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}

function getMouse(e){
    var w = window, b = document.body;
	if (!e) var e = window.event;
    return {x: e.clientX + (w.scrollX || b.scrollLeft || b.parentNode.scrollLeft || 0),
    y: e.clientY + (w.scrollY || b.scrollTop || b.parentNode.scrollTop || 0)};
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}
