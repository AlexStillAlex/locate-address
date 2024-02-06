// Fills an image of something on my Milbank. This can be generalised to any polygon on a GET request. I.e. ONCLICK, GET request, fill image.
map.on('load', () => {
    // Add the GeoJSON data.
    map.addSource('source', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'MultiPolygon',
                "coordinates": [
                    [
                        [
                            [
                                -0.12585574,
                                51.49180439
                            ],
                            [
                                -0.12574005,
                                51.49207862
                            ],
                            [
                                -0.12566794,
                                51.49208061
                            ],
                            [
                                -0.1255633,
                                51.49233119
                            ],
                            [
                                -0.12573565,
                                51.49239644
                            ],
                            [
                                -0.12574916,
                                51.4924007
                            ],
                            [
                                -0.12576129,
                                51.4924036
                            ],
                            [
                                -0.12577553,
                                51.49240742
                            ],
                            [
                                -0.12578552,
                                51.49240983
                            ],
                            [
                                -0.12581269,
                                51.49241476
                            ],
                            [
                                -0.12582415,
                                51.49241629
                            ],
                            [
                                -0.12583493,
                                51.49241691
                            ],
                            [
                                -0.12583851,
                                51.49241742
                            ],
                            [
                                -0.12585431,
                                51.49241857
                            ],
                            [
                                -0.12587158,
                                51.49241885
                            ],
                            [
                                -0.12606313,
                                51.49242011
                            ],
                            [
                                -0.1260634,
                                51.49229062
                            ],
                            [
                                -0.12606589,
                                51.49228257
                            ],
                            [
                                -0.1260677,
                                51.4922736
                            ],
                            [
                                -0.12606923,
                                51.49227138
                            ],
                            [
                                -0.1260732,
                                51.49226245
                            ],
                            [
                                -0.12607549,
                                51.49225934
                            ],
                            [
                                -0.1260823,
                                51.49225135
                            ],
                            [
                                -0.12608674,
                                51.49224828
                            ],
                            [
                                -0.12617038,
                                51.49215834
                            ],
                            [
                                -0.12607825,
                                51.49212179
                            ],
                            [
                                -0.1261226,
                                51.49207664
                            ],
                            [
                                -0.12612494,
                                51.49207218
                            ],
                            [
                                -0.12612725,
                                51.49206862
                            ],
                            [
                                -0.12612959,
                                51.49206416
                            ],
                            [
                                -0.12613121,
                                51.49205969
                            ],
                            [
                                -0.12613278,
                                51.49205657
                            ],
                            [
                                -0.12613302,
                                51.49205073
                            ],
                            [
                                -0.12613171,
                                51.49204756
                            ],
                            [
                                -0.12611183,
                                51.49200542
                            ],
                            [
                                -0.1260952,
                                51.49200696
                            ],
                            [
                                -0.12599684,
                                51.4918062
                            ],
                            [
                                -0.12585574,
                                51.49180439
                            ]
                        ]
                    ]
                ]
            }
        }
    });
// 21-24 Millbank, London SW1P 4DU
    // Load an image to use as the pattern from an external URL.
    map.loadImage(
        'https://static.standard.co.uk/s3fs-public/thumbnails/image/2015/07/27/12/ecsImgmillbanktower3-178295.jpg?width=1200&height=900&fit=crop',
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
