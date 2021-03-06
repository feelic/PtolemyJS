console.log('loading PtolemyJS and dependencies, please wait');

require.config({
	urlArgs: "bust=" +  (new Date()).getTime()
	});
// DEPENDENCIES
require(['node_modules/raphael/raphael-min.js','node_modules/voronoi/rhill-voronoi-core.min.js'], function(){
	require(['node_modules/raphael-pan-zoom/src/raphael.pan-zoom.min.js'],function(){
		// CORE
		require(['ptolemy/Ptolemy.js','ptolemy/Cell.js','ptolemy/util/util.js'], function(){
			// PLUGINS
			require(['node_modules/noisejs/index.js','ptolemy/plugins/Ptolemy.worldgeneration.js'], function(){

				main();
			});
		});

	});
});


function main () {

	window.engine = new Ptolemy('canvas');



	document.getElementById("randomMap").addEventListener("click", function( event ) {
		var n = document.getElementById("cellsCount").value;
		engine.newRandomWorld(n,16, function(){
			engine.render();
		});
	}, false);

	document.getElementById("exportMap").addEventListener("click", function( event ) {
		document.getElementById("mapInput").value = engine.exportMap();
	}, false);

	document.getElementById("importMap").addEventListener("click", function( event ) {
		engine.importMap(JSON.parse(document.getElementById("mapInput").value), function(){
			engine.render();
		});
	}, false);



}
