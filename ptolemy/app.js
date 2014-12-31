console.log('loading PtolemyJS and dependencies, please wait');

// DEPENDENCIES
require(['bower_components/raphael/raphael-min.js','bower_components/Javascript-Voronoi/rhill-voronoi-core.min.js']);

// CORE
require(['ptolemy/Engine.js','ptolemy/MapCell.js','ptolemy/util/util.js'], function(){
	// PLUGINS
	require(['ptolemy/plugins/Engine.worldgeneration.js']);
});

