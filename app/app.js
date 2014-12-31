// CONFIGURATION
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: './',
});

// DEPENDENCIES
require(['bower_components/raphael/raphael-min.js','bower_components/Javascript-Voronoi/rhill-voronoi-core.min.js']);

// CORE
require(['app/Engine.js','app/MapCell.js','app/util/util.js'], function(){
	// PLUGINS
	require(['app/plugins/Engine.worldgeneration.js']);
});

