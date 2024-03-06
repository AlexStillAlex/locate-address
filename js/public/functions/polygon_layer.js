// //This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand

async function goadMapTest(){

// map.on('load', function() {
// Possible conflict because map is called twice
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
        // console.log(map.getLayer('blaby_leaseholds'));
    // console.log(map.getSource('blaby_leaseholds'));
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        // Logic for adding tenant name
        const tenant = lease_tenant_table.find(item => item.dmse_ref === reference);
        console.log(tenant)
        if (tenant == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in lease_tenant_table`)
            feature.properties.tenant_name = undefined;
            feature.properties.passing_rent = undefined;
        }
        else {
                feature.properties.tenant_name = tenant.tenant_name;
                feature.properties.passing_rent = tenant.leas_passing_rent;
        }
        // Logic for adding dmse_type and dmse_status
        const dmse_demise = dmse_table.find(item => item.dmse_ref === reference);
        if (dmse_demise == undefined) {
            console.log(`The demise reference ${reference} taken from the polygon is not in dmse_table`);
            feature.properties.dmse_type = undefined;
            feature.properties.dmse_status = undefined;        
        }
        else {
                feature.properties.dmse_type = demise.dmse_type_desc;
                feature.properties.dmse_status = demise.dmse_status_desc;
        }
    });

    // //add dmse_status from tenant dmse_table. 
    // blaby_leasehold_polygons.forEach(feature => {
    //     const reference = feature.properties.id.toString();
    //     const demise = dmse_table.find(item => item.dmse_ref === reference);
    //     if (demise == undefined){
    //         console.log(`The demise reference ${reference} taken from the polygon is not in dmse_table`)
    //         feature.properties.dmse_status = undefined;
    //     }
    //     else {
    //             feature.properties.dmse_status = demise.dmse_status_desc;
    //     }
    // });

    //add epc_letter from epc_table. 
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const demise = epc_table.find(item => item.depc_dmse_ref === reference);
        if (demise == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in epc_table`)
            feature.properties.epc_rating_letter = undefined;
        }
        else {
            feature.properties.epc_rating_letter = epc_demise.depc_rating_letter;
        }
    });

    //TODOdd passing_rent from lease_table. 

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
    // Adding the tenant names
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
      //should I make a fetch request here?
}
   
















// THIS SHOULD BE A NEW SCRIPT?














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
    //let's remove any legend that might be there from the previous selection:
    const colourLegendDiv = document.getElementById('colourlegend');
    colourLegendDiv.style.display = 'none';
    colourLegendDiv.innerHTML = '';

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

    // Add legend
    for (let item of dmse_type_colors) {
        let legendItem = document.createElement('div');

        // Create a color box.
        let colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.marginRight = '8px';
        colorBox.style.backgroundColor = item.color;
        legendItem.appendChild(colorBox);

        // Create a label.
        let label = document.createTextNode(item.value);
        legendItem.appendChild(label);

        // Add the legend item to the legend.
        colourlegend.appendChild(legendItem);
    }
    colourLegendDiv.style.display = 'block';

    } if (selectedValue === 'epc') {
        colorExpression = ['match', ['get', 'epc_rating_letter']];
        epc_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        colorExpression.push('#000000'); //black

        // Add legend
        for (let item of epc_colors) {
            let legendItem = document.createElement('div');

            // Create a color box.
            let colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.marginRight = '8px';
            colorBox.style.backgroundColor = item.color;
            legendItem.appendChild(colorBox);

            // Create a label.
            let label = document.createTextNode(item.value);
            legendItem.appendChild(label);

            // Add the legend item to the legend.
            colourlegend.appendChild(legendItem);
        }
        colourLegendDiv.style.display = 'block';
    } if (selectedValue === 'passing_rent') {
        // colorExpression = ['step', ['get', 'passing_rent'], '#ffffff', 10000, '#02f7f7', 20000]
        colorExpression = ['interpolate', ['linear'], ['get', 'passing_rent'], 0, '#ffffff', 100000, '#fafa00']; // Smallest passing rent (0) to largest passing rent (1000000), from white to blue

        // Add legend for passing rent
        const minPassingRent = 0; // Smallest passing rent
        const maxPassingRent = 1000000; // Largest passing rent
        const numSteps = 5; // Number of legend steps

        // Calculate step size
        const stepSize = (maxPassingRent - minPassingRent) / numSteps;

        // Create legend items
        for (let i = 0; i <= numSteps; i++) {
            let legendItem = document.createElement('div');

            // Calculate passing rent value for this step
            const passingRent = minPassingRent + (i * stepSize);

            // Create a color box.
            let colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.marginRight = '8px';
            console.log(`rgb(255, 255, ${255 - (i * (255 / numSteps))})`);
            colorBox.style.backgroundColor = `rgb(255, 255, ${255 - (i * (255 / numSteps))})`; // Calculate color based on step
            legendItem.appendChild(colorBox);

            // Create a label.
            let label = document.createTextNode(passingRent.toFixed(2)); // Round to 2 decimal places
            legendItem.appendChild(label);

            // Add the legend item to the legend.
            colourLegendDiv.appendChild(legendItem);
        }

        // Show the legend for passing rent when 'passing_rent' option is selected
        colourLegendDiv.style.display = 'block';

    } else if (selectedValue === 'dmse_status') {
        colorExpression = ['match', ['get', 'dmse_status']];
        dmse_status_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        colorExpression.push('#000000'); //black

        // Add legend
    for (let item of dmse_status_colors) {
        let legendItem = document.createElement('div');

        // Create a color box.
        let colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.marginRight = '8px';
        colorBox.style.backgroundColor = item.color;
        legendItem.appendChild(colorBox);

        // Create a label.
        let label = document.createTextNode(item.value);
        legendItem.appendChild(label);

        // Add the legend item to the legend.
        colourlegend.appendChild(legendItem);
    }
    colourLegendDiv.style.display = 'block';
    }
    // Set paint property to update colors
    map.setPaintProperty('blaby_leaseholds', 'fill-color', colorExpression);

    map.addLayer({
        'id': 'tenant-names',
        'type': 'symbol',
        'source': 'blaby_leaseholds', //define a different source of the inscribed rectangle
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
    //     // Adding the invisible rectangles!
    // testcoord  = [[-1.1641723912687918, 52.57460904292981], [-1.1641686371240196, 52.574698897528776], [-1.1635196965080394, 52.574688832165926], [-1.1635234519780315, 52.574598977599464], [-1.1641723912687918, 52.57460904292981]]
    // map.addSource('rectesting', {
    //     'type': 'geojson',
    //     'data': {
    //       'type': 'Feature',
    //       'properties': {},
    //       'geometry': {
    //         'type': 'Polygon',
    //         // Define the coordinates of your rectangle here
    //         'coordinates': [
    //             testcoord]
    //       }
    //     }
    //   });
    
    //   // Add the rectangle layer
    //   map.addLayer({
    //     'id': 'rectesting',
    //     'type': 'line',
    //     'source': 'rectesting',
    //     'layout': {},
    //     'paint': {
    //       'line-color': '#088', // Color of the rectangle
    //       'line-opacity': 1.0, //Invisible rectangle
    //       'line-width': 3
    //     }
    //   });
    //   map.addLayer({
    //     'id': 'text',
    //     'type': 'symbol',
    //     'source': 'rectesting',
    //     'layout': {
    //         // 'text-font' must be one that is from OS data fonts. More info about which fonts we can use: https://github.com/openmaptiles/fonts
    //           "text-font": [ "Source Sans Pro Regular" ], //Testing here!
    //           'text-field': 'TESTING',
    //           'text-size': 12,
    //            'text-rotate': getRotation(testcoord),
    //         //   'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
    //         //   'text-radial-offset': 0.5,
    //           'text-justify': 'center'
    //         },
    //     'paint': {
    //       'text-color': '#000'
    //     }
    //   });
    }); 

