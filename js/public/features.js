// Fills an image of something on my Milbank. This can be generalised to any polygon on a GET request. I.e. ONCLICK, GET request, fill image.
map.on('load', () => {
    // Add the GeoJSON data.
    map.addSource('source', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'Polygon',
                "coordinates" : [ [ [ -0.1142669, 51.4649831 ], [ -0.1144469, 51.4650166 ], [ -0.1145177, 51.4650294 ], [ -0.114554, 51.4649342 ], [ -0.1144362, 51.4648752 ], [ -0.1143849, 51.4648631 ], [ -0.1143316, 51.4648807 ], [ -0.1143272, 51.4648829 ], [ -0.1143235, 51.464886 ], [ -0.1143198, 51.4648886 ], [ -0.1143167, 51.4648922 ], [ -0.1143137, 51.4648962 ], [ -0.1143107, 51.4648993 ], [ -0.1143084, 51.4649028 ], [ -0.1143076, 51.4649055 ], [ -0.1142669, 51.4649831 ] ] ]
            }
        }
    });
// 21-24 Millbank, London SW1P 4DU
    // Load an image to use as the pattern from an external URL.
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/colorado_flag.png',
        (err, image) => {
            // Throw an error if something goes wrong.
            if (err) throw err;

            // Add the image to the map style.
            map.addImage('pattern', image);

            // Create a new layer and style it using `fill-pattern`.
            map.addLayer({
                'id': 'pattern-layer',
                'type': 'fill',
                'source': 'source',
                'paint': {
                    'fill-pattern': 'pattern'
                }
            });
        }
    );
});

