//Only works for one feature. Need multiple map layers for each. 
   // Add event which waits for the map to be loaded.
    map.on('load', function() {
        // Add an empty GeoJSON layer for the Airport features.
        map.addLayer({
            "id": "airports",
            "type": "fill",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            },
            "layout": {},
            "paint": {
                "fill-color": "#088",
                "fill-opacity": 0.8
            }
        });

    // Get the visible map bounds (BBOX).
    let bounds = map.getBounds();

    // Add event which will be triggered when the map has finshed moving (pan + zoom).
    // Implements a simple strategy to only request data when the map viewport invalidates
    // certain bounds.
    map.on('moveend', function() {
        let bounds1 = new maplibregl.LngLatBounds(bounds.getSouthWest(), bounds.getNorthEast()),
            bounds2 = map.getBounds();

        if( JSON.stringify(bounds) !== JSON.stringify(bounds1.extend(bounds2)) ) {
            bounds = bounds2;
            getFeaturesBounds(bounds);
        }
    });

    // When a click event occurs on a feature in the 'airports' layer, open a popup at
    // the location of the click, with description HTML from its properties.
    map.on('click', 'airports', function(e) {
        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.DistinctiveName1)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the 'airports' layer.
    map.on('mouseenter', 'airports', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change the cursor back to a pointer when it leaves the 'airports' layer.
    map.on('mouseleave', 'airports', function() {
        map.getCanvas().style.cursor = '';
    });

    getFeaturesBounds(bounds);
});

/**
 * Get features from the WFS.
 */
function getFeaturesBounds(bounds) {
    // Convert the bounds to a formatted string.
    let sw = bounds.getSouthWest().lat + ',' + bounds.getSouthWest().lng,
        ne = bounds.getNorthEast().lat + ',' + bounds.getNorthEast().lng;

    let coords = sw + ' ' + ne;

    // Create an OGC XML filter parameter value which will select the Airport
    // features (site function) intersecting the BBOX coordinates.
    let xml = '<ogc:Filter>';
    xml += '<ogc:And>';
    xml += '<ogc:BBOX>';
    xml += '<ogc:PropertyName>SHAPE</ogc:PropertyName>';
    xml += '<gml:Box srsName="EPSG:4326">';
    xml += '<gml:coordinates>' + coords + '</gml:coordinates>';
    xml += '</gml:Box>';
    xml += '</ogc:BBOX>';
    xml += '<ogc:PropertyIsEqualTo>';
    xml += '<ogc:PropertyName>SiteFunction</ogc:PropertyName>';
    xml += '<ogc:Literal>Airport</ogc:Literal>';
    xml += '</ogc:PropertyIsEqualTo>';
    xml += '</ogc:And>';
    xml += '</ogc:Filter>';

    // Define (WFS) parameters object.
    const wfsParamsBounds = {
        key: apikey,
        service: 'WFS',
        request: 'GetFeature',
        version: '2.0.0',
        typeNames: 'Sites_FunctionalSite',
        outputFormat: 'GEOJSON',
        filter: xml
    };

    // Use fetch() method to request GeoJSON data from the OS Features API.
    // If successful - set the GeoJSON data for the 'airports' layer and re-render
    // the map.
    fetch(getUrlBounds(wfsParamsBounds))
        .then(response => response.json())
        .then(data => {
            map.getSource('airports').setData(data);
        });
}
/**
 * Return URL with encoded parameters.
 * @param {object} params - The parameters object to be encoded.
 */
function getUrlBounds(params) {
    const encodedParameters = Object.keys(params)
        .map(paramName => paramName + '=' + encodeURI(params[paramName]))
        .join('&');
    console.log('https://api.os.uk/features/v1/wfs?' + encodedParameters)
    return 'https://api.os.uk/features/v1/wfs?' + encodedParameters;
}
