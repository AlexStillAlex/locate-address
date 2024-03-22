// only exists cos Iw as moving it over from html file
var app;
require([
  "dojo/query",

  // Calcite-maps
  "calcite-maps/calcitemaps-v0.10",
  "calcite-maps/calcitemaps-arcgis-support-v0.10",

  // Bootstrap
  "bootstrap/Collapse", 
  "bootstrap/Dropdown",
  "bootstrap/Tab",      

  "dojo/domReady!"
], function(
  query, CalciteMaps, CalciteMapsArcGIS) {

  // Menu UI - change Basemaps
  query("#selectBasemapPanel").on("change", function(e){
    // app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
    // app.sceneView.map.basemap = e.target.value;
    console.log(e.target.value);
    updateMapStyle(e.target.value);
  });  

  });