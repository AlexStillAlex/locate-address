// //This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand
map.on('load', function() {

    defaultcolor = '#FF0000'; // Default color
    
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
                'color': defaultcolor
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
                'color': defaultcolor
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
                'color': defaultcolor
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
                'color': defaultcolor
            }
        }
    ]

    //add tenant_name from lease_tenant_table. 
    //add tenant_name attribute to each feature's properties. To do so, look up the tenant name in the databricks tenant table by dmse_reference that is already attached to the feature.
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const tenant = lease_tenant_table.find(item => item.dmse_ref === reference);
        if (tenant == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in lease_tenant_table`)
            feature.properties.tenant_name = undefined;
        }
        else {
                feature.properties.tenant_name = tenant.tenant_name;
        }
    });
    //to see if the attribute has been added to the polygon feature run this in the console:
    // console.log(map.getLayer('blaby_leaseholds'));
    // console.log(map.getSource('blaby_leaseholds'));

    //add dmse_type from tenant dmse_table. 
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const demise = dmse_table.find(item => item.dmse_ref === reference);
        if (demise == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in demise_table`)
            feature.properties.dmse_type = undefined;
        }
        else {
                feature.properties.dmse_type = demise.dmse_type_desc;
        }
    });

    //add dmse_status from tenant dmse_table. 
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const demise = dmse_table.find(item => item.dmse_ref === reference);
        if (demise == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in dmse_table`)
            feature.properties.dmse_status = undefined;
        }
        else {
                feature.properties.dmse_status = demise.dmse_status_desc;
        }
    });

    //add epc_letter from dmse_table. 
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const demise = epc_table.find(item => item.depc_dmse_ref === reference);
        if (demise == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in epc_table`)
            feature.properties.epc_rating_letter = undefined;
        }
        else {
                feature.properties.epc_rating_letter = demise.depc_rating_letter;
        }
    });

    //add passing_rent from lease_table. 
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const demise = epc_table.find(item => item.depc_dmse_ref === reference);
        if (demise == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in epc_table`)
            feature.properties.epc_rating_letter = undefined;
        }
        else {
                feature.properties.epc_rating_letter = demise.depc_rating_letter;
        }
    });

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
                    coordinates:  [[[-1.1640429605042755,52.57579883474423], [-1.1637210954224884,52.5758004647532], [-1.1636084426452271,52.575809429800074], [-1.163462262253688,52.57591864022933], [-1.1634139824923295,52.57627968471252], [-1.1639464009814446,52.57627886971696], [-1.163951765398906,52.57634406930785], [-1.1641073335218834,52.57632532443509], [-1.1640885580591203,52.57602459038611], [-1.1640429605042755,52.57579883474423]]]
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

    //text has to be located within the center of the largest rectangle fitted to the leasehold polygon
    //There is a rather simple algorithm that could be applied to convex polygons, but with concave polygons it is more difficult. With concave polygons the best we can get is an appoximation.
    //->finding largest rectangle that would fit inside a convex polygon:
    //#convexHull() function tries to simolify the problem by making any concave polygon a convex polygon and running the function on it. The convexHull() function is not shown below.
    function getRectangleCoordinates(polygon) {
        const convexHullPoints = convexHull(polygon);
    
        let maxArea = 0;
        let rectangleCoordinates = [];
    
        for (let i = 0; i < convexHullPoints.length; i++) {
            const p1 = convexHullPoints[i];
            const p2 = convexHullPoints[(i + 1) % convexHullPoints.length];
    
            for (let j = i + 1; j < convexHullPoints.length; j++) {
                const p3 = convexHullPoints[j];
                const p4 = convexHullPoints[(j + 1) % convexHullPoints.length];
    
                const area = Math.abs(
                    (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p4[0] - p3[0]) * (p2[1] - p1[1])
                );
    
                if (area > maxArea) {
                    maxArea = area;
                    rectangleCoordinates = [p1, p2, p3, p4];
                }
            }
        }
    
        return rectangleCoordinates;
    }
    //rotation should be towards the longest side of this resulting rectangle
    //-> Function to calculate rotation angle based on the longest side of the polygon
    function getRotation(coordinates) {
        var maxDistance = 0;
        var rotation = 0;
        for (var i = 0; i < coordinates.length - 1; i++) {
            var distance = Math.sqrt(Math.pow(coordinates[i][0] - coordinates[i+1][0], 2) + Math.pow(coordinates[i][1] - coordinates[i+1][1], 2));
            if (distance > maxDistance) {
                maxDistance = distance;
                rotation = Math.atan2(coordinates[i+1][1] - coordinates[i][1], coordinates[i+1][0] - coordinates[i][0]) * 180 / Math.PI;
            }
        }
        return rotation;
    }

//COLOURING IN BY ATTRUBUTE:
//Add Colouring for "dmse_type"
const dmse_type_colors = [
    { value: "Retail", color: "#157CBD" }, //blue
    { value: "Residential", color: "#FFC300" } //orange
];

//Add Colouring for "dmse_status"
const dmse_status_colors = [
    { value: "Vacant", color: "#0ee627" }, //green
    { value: "Occupied", color: "#e6db0e" } //yellow
];

const epc_colors = [
    { value: "A", color: "#008e38" },
    { value: "B", color: "#6daf4c" },
    { value: "C", color: "#cad24d" },
    { value: "D", color: "#fbee5c" },
    { value: "E", color: "#f0ba4d" },
    { value: "F", color: "#D76F35" },
    { value: "G", color: "#cd2e2b" } 
]

// Add event listener to select element
const selectElement = document.getElementById('colour_by');
selectElement.addEventListener('change', function () {
    const selectedValue = selectElement.value;
    let colorExpression = defaultcolor; // Default color is red

    // Change color expression based on selected value
    if (selectedValue === 'default_value') {
    colorExpression = defaultcolor; // Default color is red
    } if (selectedValue === 'dmse_type') {
    // Change color based on 'type' attribute and dmse_type_colors array
    colorExpression = ['match', ['get', 'dmse_type']];
    dmse_type_colors.forEach(({ value, color }) => {
    colorExpression.push(value, color);
    });
//!!!! Need to add handelling of error when a new dmse_type is added to Horizon, we do not have a colour hard-coded to it. In that case a new colour should be permanently assigned to it. Notice that dmse_type_colors is a constant.
// This will set a "fallback" colour that will colour in the polygon if the colour for this category is not found.
colorExpression.push('#000000'); //black
    } if (selectedValue === 'epc') {
        colorExpression = ['match', ['get', 'epc_rating_letter']];
        epc_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        colorExpression.push('#000000'); //black
    } else if (selectedValue === 'dmse_status') {
        colorExpression = ['match', ['get', 'dmse_status']];
        dmse_status_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        colorExpression.push('#000000'); //black
    }
    // Set paint property to update colors
    map.setPaintProperty('blaby_leaseholds', 'fill-color', colorExpression);



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


    //text has to be located within the center of the largest rectangle fitted to the leasehold polygon
    //There is a rather simple algorithm that could be applied to convex polygons, but with concave polygons it is more difficult. With concave polygons the best we can get is an appoximation.
    //->finding largest rectangle that would fit inside a convex polygon:
    //#convexHull() function tries to simolify the problem by making any concave polygon a convex polygon and running the function on it. The convexHull() function is not shown below.
    function getRectangleCoordinates(polygon) {
        const convexHullPoints = convexHull(polygon);
    
        let maxArea = 0;
        let rectangleCoordinates = [];
    
        for (let i = 0; i < convexHullPoints.length; i++) {
            const p1 = convexHullPoints[i];
            const p2 = convexHullPoints[(i + 1) % convexHullPoints.length];
    
            for (let j = i + 1; j < convexHullPoints.length; j++) {
                const p3 = convexHullPoints[j];
                const p4 = convexHullPoints[(j + 1) % convexHullPoints.length];
    
                const area = Math.abs(
                    (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p4[0] - p3[0]) * (p2[1] - p1[1])
                );
    
                if (area > maxArea) {
                    maxArea = area;
                    rectangleCoordinates = [p1, p2, p3, p4];
                }
            }
        }
    
        return rectangleCoordinates;
    }
    //rotation should be towards the longest side of this resulting rectangle
    //-> Function to calculate rotation angle based on the longest side of the polygon
    function getRotation(coordinates) {
        var maxDistance = 0;
        var rotation = 0;
        for (var i = 0; i < coordinates.length - 1; i++) {
            var distance = Math.sqrt(Math.pow(coordinates[i][0] - coordinates[i+1][0], 2) + Math.pow(coordinates[i][1] - coordinates[i+1][1], 2));
            if (distance > maxDistance) {
                maxDistance = distance;
                rotation = Math.atan2(coordinates[i+1][1] - coordinates[i][1], coordinates[i+1][0] - coordinates[i][0]) * 180 / Math.PI;
            }
        }
        return rotation;
    }

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

});

