//This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand
map.on('load', function() {

     //used for seeing the coordinates of where the mouse goes
     map.on('click', (e) => {
        document.getElementById('info').innerHTML =
            // e.point is the x, y coordinates of the mousemove event relative
            // to the top-left corner of the map
            `${
                // e.lngLat is the longitude, latitude geographical position of the event
                JSON.stringify(e.lngLat.wrap())}`;
        });

    var selectedColor = '#088'; // Default color


    map.addSource('polygons', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [
                    {
                    type: 'Feature',
                    geometry:{
                        type: 'Polygon',
                        coordinates: [[[-2.1532152046974034, 52.50633250508869], [-2.151864423728739, 52.506298625952155], [-2.151901862702516, 52.50563595605098], [-2.153253558042593, 52.50566508719194]]]
                        },
                    properties: {
                        id: 'polygon1',
                        'color': '#FF0000'
                    }
                    },
                    {
                    type: 'Feature',
                    geometry:{
                        type: 'Polygon',
                        coordinates: [[[-2.1510565181931725, 52.50620701261818], [-2.1490346751018023, 52.50615862397359], [-2.1490652092176106, 52.50562188198029], [-2.151084392519465,52.505666874589195]]]
                    },
                    properties: {
                        id: 'polygon2',
                        'color': '#FF0000'
                    }
                    },
                    {
                    type: 'Feature',
                    geometry:{
                        type: 'Polygon',
                        coordinates: [[[-2.1526988806593863, 52.50534309835808], [-2.151823074245158, 52.50532642797512], [-2.151819050939139,52.50535255000247], [-2.1517895466395203,52.50535255000247], [-2.15178418222456,52.50532561164934], [-2.151739925775246,52.50532561164934], [-2.1517727657882233,52.50474758108922], [-2.1527174499589137,52.50476878477593]]]
                    },
                    properties: {
                        id: 'polygon3',
                        'color': '#FF0000'
                    }
                    },
                    {
                    type: 'Feature',
                    geometry:{
                        type: 'Polygon',
                        coordinates: [[[-2.151329713147561,52.505362024248996], [-2.1511070898015987,52.50535631005715], [-2.151093725891883, 52.50549292097685], [-2.150875125858306,52.505488023110615], [-2.150912194192415,52.504857820701346], [-2.1513695922064926,52.504864376039166]]]
                    },
                    properties: {
                        id: 'polygon4',
                        'color': '#FF0000'
                    }
                    },
                    {
                    type: 'Feature',
                    geometry:{
                        type: 'Polygon',
                        coordinates: [[[-2.1513106969457567,52.5045788205006], [-2.1511538356297706,52.50457550291088], [-2.1511457890011343,52.50461305397019], [-2.1509607165845637,52.504608972329294], [-2.1509851383834757,52.50417849930432], [-2.1513311433564013,52.50418584631217]]]
                    },
                    properties: {
                        id: 'polygon5',
                        'color': '#FF0000'
                    }
                }
            ]
        }
    })

    map.addLayer({
        id: 'polygons',
        type: 'fill',
        source: 'polygons',
        'paint': {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.7
          }
    });

//     // When a polygon is clicked, change its color.
//   map.on('click', 'polygons', function (e) {
//     var clickedPolygonId = e.features[0].properties.id;
//     var newColor = '00FF00'
//     map.setPaintProperty('polygons', 'fill-color', ['case', ['==', ['get', 'id'], clickedPolygonId], newColor, '#088']);
//   });



    // When a polygon is clicked, change its color
  map.on('click', 'polygons', function(e) {
    var features = e.features;
    if (!features.length) return;

    var clickedFeature = features[0];
    var currentColor = clickedFeature.properties.color;
    console.log(clickedFeature.geometry)

    // Toggle color
    var newColor = currentColor === '#FF0000' ? '#00FF00' : '#FF0000';

    // Update polygon color in the source data
    map.getSource('polygons').setData({
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': clickedFeature.geometry,
          'properties': {
            'color': newColor
          }
        }
      ]
    });
  });

  // Change the cursor to a pointer when hovering over a polygon
  map.on('mouseenter', 'polygons', function() {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to the default when it leaves
  map.on('mouseleave', 'polygons', function() {
    map.getCanvas().style.cursor = '';
  });
});







// //selecting polygons and changing their colour
// // Array to keep track of selected polygons
// var selectedPolygons = [];

// // Function to toggle selection and color of polygons
// function toggleSelection(layer) {
//     var layerId = layer.feature.id;
//     if (selectedPolygons.includes(layerId)) {
//         // Deselect
//         selectedPolygons = selectedPolygons.filter(id => id !== layerId);
//         map.setFeatureState({ source: 'selectedPolygons', id: layerId }, { selected: false });
//     } else {
//         // Select
//         selectedPolygons.push(layerId);
//         var color = document.querySelector('.color-option.selected').dataset.color;
//         map.setFeatureState({ source: 'selectedPolygons', id: layerId }, { selected: true, color: color });
//     }
// }

// // Event listeners for color selection
// var colorOptions = document.querySelectorAll('.color-option');
// colorOptions.forEach(option => {
//     option.addEventListener('click', function() {
//         colorOptions.forEach(opt => opt.classList.remove('selected'));
//         this.classList.add('selected');
//         // Update selected polygons color
//         var color = this.dataset.color;
//         selectedPolygons.forEach(layerId => {
//             map.setFeatureState({ source: 'selectedPolygons', id: layerId }, { color: color });
//         });
//     });
// });





























// // Add event listener for clicks on the map
// map.on('click', function (e) {
//     var features = map.queryRenderedFeatures(e.point);
//     if (!features) return;

//     features.forEach(function (feature) {
//         if (feature.layer.type === 'fill') {
//             // Update the polygon color
//             map.setFeatureState({ source: feature.source, sourceLayer: feature.sourceLayer, id: feature.id }, { color: selectedColor });
//         }
//     });
// });

// // Event listener for color picker change
// document.getElementById('colorPicker').addEventListener('input', function (e) {
//     selectedColor = e.target.value;
// });

// map.on('click', function (e) {
//     var features = map.queryRenderedFeatures(e.point);
//     if (!features) return;

//     features.forEach(function (feature) {
//         if (feature.layer.type === 'fill') {
//             // Update the polygon color
//             map.setFeatureState({ source: feature.source, sourceLayer: feature.sourceLayer, id: feature.id }, { color: '#ff0000' }); // Change to your desired color
//         }
//     });
// });

    // random map layers to check things we can do
    // map.addLayer({
    //     id: "random_polygon1",
    //     type: "fill",
    //     source: {
    //         type: "geojson",
    //         data: {
    //             "type": "Feature",
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [[[-2.1532152046974034, 52.50633250508869], [-2.151864423728739, 52.506298625952155], [-2.151901862702516, 52.50563595605098], [-2.153253558042593, 52.50566508719194]]]
    //                 }
    //             }
    //     },
    //     paint: {
    //         "fill-color": selectedColor,
    //         "fill-opacity": 0.8
    //     }
    // });

    // map.addLayer({
    //     id: "random_polygon2",
    //     type: "fill",
    //     source: {
    //         type: "geojson",
    //         data: {
    //             "type": "Feature",
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [[[-2.1510565181931725, 52.50620701261818], [-2.1490346751018023, 52.50615862397359], [-2.1490652092176106, 52.50562188198029], [-2.151084392519465,52.505666874589195]]]
    //                 }
    //             }
    //     },
    //     paint: {
    //         "fill-color": selectedColor,
    //         "fill-opacity": 0.8
    //     }
    // });

    // map.addLayer({
    //     id: "random_polygon3",
    //     type: "fill",
    //     source: {
    //         type: "geojson",
    //         data: {
    //             "type": "Feature",
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [[[-2.1526988806593863, 52.50534309835808], [-2.151823074245158, 52.50532642797512], [-2.151819050939139,52.50535255000247], [-2.1517895466395203,52.50535255000247], [-2.15178418222456,52.50532561164934], [-2.151739925775246,52.50532561164934], [-2.1517727657882233,52.50474758108922], [-2.1527174499589137,52.50476878477593]]]
    //                 }
    //             }
    //     },
    //     paint: {
    //         "fill-color": selectedColor,
    //         "fill-opacity": 0.8
    //     }
    // });
    
    // map.addLayer({
    //     id: "random_polygon4",
    //     type: "fill",
    //     source: {
    //         type: "geojson",
    //         data: {
    //             "type": "Feature",
    //             "geometry": {
    //                 "type": "Polygon",
    //                 "coordinates": [[[-2.151329713147561,52.505362024248996], [-2.1511070898015987,52.50535631005715], [-2.151093725891883, 52.50549292097685], [-2.150875125858306,52.505488023110615], [-2.150912194192415,52.504857820701346], [-2.1513695922064926,52.504864376039166]]]
    //                 }
    //             }
    //     },
    //     paint: {
    //         "fill-color": selectedColor,
    //         "fill-opacity": 0.8
    //     }
    // });

    // map.addLayer({
    //     id: "random_polygon5",
    //     type: fill,
    //     source: {
    //         type: geojson,
    //         data: {
    //             type: Feature,
    //             geometry: {
    //                 type: Polygon,
    //                 coordinates: [[[-2.1513106969457567,52.5045788205006], [-2.1511538356297706,52.50457550291088], [-2.1511457890011343,52.50461305397019], [-2.1509607165845637,52.504608972329294], [-2.1509851383834757,52.50417849930432], [-2.1513311433564013,52.50418584631217]]]
    //                 }
    //             }
    //     },
    //     paint: {
    //         "fill-color": selectedColor,
    //         "fill-opacity": 0.8
    //     }
    // });