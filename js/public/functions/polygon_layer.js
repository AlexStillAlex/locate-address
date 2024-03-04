// //This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand
map.on('load', function() {

    let selectedColor = '#FF0000'; // Default color
    
    const blaby_leasehold_polygons = [
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.163908171797857,52.575831712757434], [-1.1638277055276376,52.57583823278733], [-1.1638682013073094,52.57603631448853], [-1.1639510871427774,52.576030573234306], [-1.163908171797857,52.575831712757434]]]
            },
            properties: {
                id: '17000891',
                address: 'unit 2',
                'color': selectedColor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.1636723708311365,52.57585024916335], [-1.1635999511877344,52.57585432418023], [-1.1636254321734896,52.57593337943709], [-1.1636388432186777,52.575936639444876], [-1.1636455487407602,52.575956199484835], [-1.163695169607763,52.57595782948789], [-1.1636723708311365,52.57585024916335]]]
            },
            properties: {
                id: '17000894',
                address: 'unit 5',
                'color': selectedColor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.1635999511877344,52.57585432418023], [-1.1634841917738186,52.575927864813195], [-1.1634855328784397,52.57602892494674], [-1.1637711881385258,52.576030554947124], [-1.1637658237200412,52.575967799893505], [-1.163615620015662,52.57596616989139], [-1.163615620015662,52.575935199830695],[-1.1636254321734896,52.57593337943709], [-1.1635999511877344,52.57585432418023]]]
            },
            properties: {
                id: '17000895',
                address: 'unit 6',
                'color': selectedColor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates:  [[[-1.1634862041582892,52.576029832545515], [-1.1634862041582892,52.57607791752608], [-1.1637866115681845,52.57607954752464], [-1.1637866115681845,52.57603064754568], [-1.1634862041582892,52.576029832545515]]]
            },
            properties: {
                id: '17000896',
                address: 'unit 6-7; actually 7',
                'color': selectedColor
            }
        }
    ]

    //add tenant_name attribute to each feature's properties. To do so, look up the tenant name in the databricks tenant table by dmse_reference that is already attached to the feature.
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const tenant = tenant_table.find(item => item.dmse_ref === reference);
        if (tenant == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in tenant_table`)
            feature.properties.tenant_name = undefined;
        }
        else {
                feature.properties.tenant_name = tenant.tenant_name;
        }
    });

    console.log(blaby_leasehold_polygons);

    // Function to calculate rotation angle based on the longest side of the polygon
    function getRotation(coordinates) {
        var maxDistance = 0;
        var rotation = 0;
        for (var i = 0; i < coordinates.length - 1; i++) {
            var distance = Math.sqrt(Math.pow(coordinates[i][0] - coordinates[i+1][0], 2) + Math.pow(coordinates[i][1] - coordinates[i+1][1], 2));
            if (distance > maxDistance) {
                maxDistance = distance;
                rotation = Math.atan2(coordinates[i+1][1] - coordinates[i][1], coordinates[i+1][0] - coordinates[i][0]) * 180 / Math.PI;
                if (rotation < 0) {
                    rotation += 360;
                }
            }
        }
        
        console.log(rotation)
        return rotation;
    }

    //creating map layer source
    map.addSource('blaby_leaseholds', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: blaby_leasehold_polygons
        }
    });
    //creating map layer
    map.addLayer({
        id: 'blaby_leaseholds',
        type: 'fill',
        source: 'blaby_leaseholds',
        'paint': {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.7
          }
    });

    map.addSource('blaby_freeholds', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [
                {
                type: 'Feature',
                geometry:{
                    type: 'Polygon',    
                    coordinates:  [[[-1.1640362904134918,52.574531156713334], [-1.164405094155427,52.574781369588976], [-1.1633939013568124,52.57486857699885], [-1.1633912191477975,52.57482293575953], [-1.1640349493118265,52.5747838146589], [-1.1640161738487222,52.574696607080995], [-1.1637757051985318,52.574714165161055],  [-1.163518624076005,52.57472839304066], [-1.1635172829714975,52.574727578016365],[-1.1634931430903634,52.57461102938265],[-1.1640362904134918,52.574531156713334]]]
                },
                properties: {
                    id: '15000050'
                }
                }
            ]
        }
    });
    //creating map layer
    map.addLayer({
        id: 'blaby_freeholds',
        type: 'line',
        source: 'blaby_freeholds',
        'paint': {
            "line-color": "black",
            "line-opacity": 0.9,
            "line-width": 3
        }
    });

    map.addLayer({
        'id': 'tenant-names',
        'type': 'symbol',
        'source': 'blaby_leaseholds',
        'layout': {
        // 'text-font' must be one that is from OS data fonts. More info about which fonts we can use: https://github.com/openmaptiles/fonts
          "text-font": [ "Source Sans Pro Regular" ], //Testing here!
          'text-field': ['get', 'tenant_name'],
          'text-size': 12,
          'text-rotate': getRotation(['get', 'coordinates']),
        //   'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
        //   'text-radial-offset': 0.5,
          'text-justify': 'center'
        },
        'paint': {
          'text-color': '#000'
        }
      });
//       var coordinates = [[[-1.163908171797857,52.575831712757434], [-1.1638277055276376,52.57583823278733], [-1.1638682013073094,52.57603631448853], [-1.1639510871427774,52.576030573234306], [-1.163908171797857,52.575831712757434]]];

// // Create a turf polygon from the coordinates
//     var polygon = turf.polygon(coordinates);

// // Calculate the centroid of the polygon
//     var centroid = turf.centroid(polygon);

// // The centroid's coordinates are in the .geometry.coordinates property
//     var centroidCoordinates = centroid.geometry.coordinates;

//     map.addLayer({
//         id: 'text-layer',
//         type: 'symbol',
//         source: {
//             type: 'geojson',
//             data: {
//                 type: 'Feature',
//                 geometry: {
//                     type: 'Point',
//                     coordinates: centroidCoordinates
//                 },
//                 properties: {
//                     message: 'TEST!'
//                 }
//             }
//         },
//         layout: {
//             'text-field': ['get', 'message'],
//             "text-font": [ "Source Sans Pro Regular" ],
//             'text-size': 24,
//             'text-justify': 'center',
//             'text-rotate': getRotation(coordinates),

//         }
//     });
    //     // Adding the invisible rectangles!
    testcoord  = [[-1.1641723912687918, 52.57460904292981], [-1.1641686371240196, 52.574698897528776], [-1.1635196965080394, 52.574688832165926], [-1.1635234519780315, 52.574598977599464], [-1.1641723912687918, 52.57460904292981]]
    map.addSource('rectesting', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Polygon',
            // Define the coordinates of your rectangle here
            'coordinates': [
                testcoord]
          }
        }
      });
    
      // Add the rectangle layer
      map.addLayer({
        'id': 'rectesting',
        'type': 'line',
        'source': 'rectesting',
        'layout': {},
        'paint': {
          'line-color': '#088', // Color of the rectangle
          'line-opacity': 1.0, //Invisible rectangle
          'line-width': 3
        }
      });
      map.addLayer({
        'id': 'text',
        'type': 'symbol',
        'source': 'rectesting',
        'layout': {
            // 'text-font' must be one that is from OS data fonts. More info about which fonts we can use: https://github.com/openmaptiles/fonts
              "text-font": [ "Source Sans Pro Regular" ], //Testing here!
              'text-field': 'TESTING',
              'text-size': 12,
               'text-rotate': getRotation(testcoord),
            //   'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
            //   'text-radial-offset': 0.5,
              'text-justify': 'center'
            },
        'paint': {
          'text-color': '#000'
        }
      });


    });

  

