// //This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand

async function goadMapTest(){

// map.on('load', function() {
// Possible conflict because map is called twice

//We have three map layers: leasehold_polygon layer (polygon), freehold_polygon layer (polygon), and tenant_names_layer (symbol; i.e. point)
    defaultcolor = '#FF0000'; // Default color
    // National Polygon Data will only have coordinates and title number. In this example, we have coordinates and dmse_ref
    const blaby_leasehold_polygons = [
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.163908171797857,52.575831712757434], [-1.1638277055276376,52.57583823278733], [-1.1638682013073094,52.57603631448853], [-1.1639510871427774,52.576030573234306], [-1.163908171797857,52.575831712757434]]]
            },
            properties: {
                id: '17000891',
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
                'color': defaultcolor
            }
        },

        // industrial site: Oakhill Trading Estate, Leicester
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates:  [[[-1.131841286097142,52.61494511216986], [-1.1312569221032618,52.614949660983285], [-1.1312606680265844,52.615161180288], [-1.1318450320204647,52.61517027786988], [-1.131841286097142,52.61494511216986]]]
            },
            properties: {
                id: '17006871',
                'color': defaultcolor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.131841286097142,52.61428780365418], [-1.131586563330302,52.614280980330506], [-1.1315790714849072,52.61415588587724], [-1.1312681598732297,52.614151336981365], [-1.1312662869104315,52.61450387501583], [-1.1318525238659731,52.614507286660626], [-1.131841286097142,52.61428780365418]]]
            },
            properties: {
                id: '17006874',
                'color': defaultcolor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.1325584268997773, 52.61465934533422], [-1.1321896231603432,52.614656088206374], [-1.1321909642649644,52.61498994252298], [-1.1325557446896255,52.614989128247174], [-1.1325584268997773,52.61465934533422]]]
            },
            properties: {
                id: '17006875',
                'color': defaultcolor
            }
        }
    ]

    //add properties to 'blaby_leasehold_polygons'
    blaby_leasehold_polygons.forEach(feature => {
        //take the demise reference from a particular feature
        const reference = feature.properties.id.toString();
        // add tenant_name and passing_rent from lease_tenant_table
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
        // add dmse_type, dmse_status, dmse_desc from dmse_table
        const dmse_demise = dmse_table.find(item => item.dmse_ref === reference);
        if (dmse_demise == undefined) {
            console.log(`The demise reference ${reference} taken from the polygon is not in dmse_table`);
            feature.properties.dmse_type = undefined;
            feature.properties.dmse_status = undefined;  
            feature.properties.dmse_desc = undefined;
            feature.properties.dmse_surveyor = undefined;
        }
        else {
                feature.properties.dmse_type = dmse_demise.dmse_type_desc;
                feature.properties.dmse_status = dmse_demise.dmse_status_desc;
                feature.properties.dmse_desc = dmse_demise.dmse_desc;
                feature.properties.dmse_surveyor = dmse_demise.dmse_surveyor;
        }
        // add epc_rating_letter from epc_table
        const epc_table_demise = epc_table.find(item => item.depc_dmse_ref === reference);
        if (epc_table_demise == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in epc_table`)
            feature.properties.epc_rating_letter = undefined;
        }
        else {
            feature.properties.epc_rating_letter = epc_table_demise.depc_rating_letter;
        }
    });

    //check that attributes have been added to the map source:
    // console.log(map.getLayer('blaby_leaseholds'));
    // console.log(map.getSource('blaby_leaseholds'));

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



// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //Creating Circles on Map Zoom level > ()
// //Input should be taken from tenant-names coordinates. For now we will test on fictional example.
const centroid_points = [
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates: [-1.163888981124046,52.57594745749188]
        },
        properties: {
            id: '17000891',
            epc_rating_letter: "C",
            dmse_type: "Retail",
            dmse_status: "Occupied"
        }
    },
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates: [-1.1636471894971692,52.57589847779269]
        },
        properties: {
            id: '17000894',
            epc_rating_letter: "C",
            dmse_type: "Retail",
            dmse_status: "Occupied"
        }
    },
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates: [-1.163577452060963,52.575978347970135]
        },
        properties: {
            id: '17000895',
            // epc_rating_letter : "NA"
            epc_rating_letter: "NA",
            // epc_rating_letter : null
            dmse_type: "Retail",
            dmse_status: "Occupied"
        }
    },
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates:  [-1.1636243907191783,52.576052513005266]
        },
        properties: {
            id: '17000896',
            epc_rating_letter: "C",
            dmse_type: "Retail",
            dmse_status: "Occupied"
        }
    },

    // industrial points:
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates:  [-1.131515360354797,52.615013486934345]
        },
        properties: {
            id: '17006871',
            epc_rating_letter: "C",
            dmse_type: "Industrial",
            dmse_status: "Occupied"
        }
    },
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates:  [-1.1315503209007147,52.61441423077889]
        },
        properties: {
            id: '17006874',
            epc_rating_letter: "D",
            dmse_type: "Industrial",
            dmse_status: "Occupied"
        }
    },
    {
        type: 'Feature',
        geometry:{
            type: 'Point',    
            coordinates:  [-1.132370549067332,52.6147750917348]
        },
        properties: {
            id: '17006875',
            epc_rating_letter: "C",
            dmse_type: "Industrial",
            dmse_status: "Occupied"
        }
    }
]

create_default_pie_charts_on_high_zoom_level(centroid_points);

//COLOURING IN BY ATTRUBUTE:
//Add Colouring for "dmse_type"
const dmse_type_colors = [
    { value: "Retail", color: "#157CBD" }, //blue
    { value: "Residential", color: "#FFC300" }, //orange
    { value: "Industrial", color: "#ff00bf" }, //pink
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
    { value: "G", color: "#cd2e2b" },
    { value: "NA", color: "#000000"} 
]

document.getElementById('colour_by').addEventListener('change', function () {
    //let's remove any legend that might be there from the previous selection:
    const colourLegendDiv = document.getElementById('colourlegend');
    colourLegendDiv.style.display = 'none';
    colourLegendDiv.innerHTML = '';

    const selectedValue = document.getElementById('colour_by').value;
    let colorExpression = defaultcolor; // Default color is red

    // Change color expression based on selected value
    if (selectedValue === 'default_value') {
        //let's remove any existing pie charts on high zoom level
        if(map.getLayer('unclustered-point')){
            map.removeLayer('unclustered-point');
            map.removeSource('unclustered-point');
        }
        // let's add back the default pie charts on high zoom level
            map.setLayoutProperty('unclustered-point-default', 'visibility', 'visible');
            map.setLayoutProperty('clusters', 'visibility', 'visible');
            map.setLayoutProperty('cluster-count', 'visibility', 'visible');

        colorExpression = defaultcolor; // Default color is red
    } 
    if (selectedValue === 'dmse_type') {
        //let's remove any existing pie charts on high zoom level
        if(map.getLayer('unclustered-point')){
            map.removeLayer('unclustered-point');
            map.removeSource('unclustered-point');
        }

        // let's remove any default pie charts on high zoom level
            map.setLayoutProperty('unclustered-point-default', 'visibility', 'none');
            map.setLayoutProperty('clusters', 'visibility', 'none');
            map.setLayoutProperty('cluster-count', 'visibility', 'none');

        // Change color based on 'type' attribute and dmse_type_colors array
        colorExpression = ['match', ['get', 'dmse_type']];
        dmse_type_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        //!!!! Need to add handelling of error when a new dmse_type is added to Horizon, we do not have a colour hard-coded to it. In that case a new colour should be permanently assigned to it. Notice that dmse_type_colors is a constant.
        // This will set a "fallback" colour that will colour in the polygon if the colour for this category is not found.
        colorExpression.push('#000000'); //black

        color_by_legend(dmse_type_colors);
        colourLegendDiv.style.display = 'block';

        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories, fourth_argument: colorExpression
        create_pie_charts(centroid_points, dmse_type_colors, "dmse_type", colorExpression)
        

    } if (selectedValue === 'epc') {

        //let's remove any existing pie charts on high zoom level
        if(map.getLayer('unclustered-point')){
            map.removeLayer('unclustered-point');
            map.removeSource('unclustered-point');
        }

        // let's remove any default pie charts on high zoom level
        map.setLayoutProperty('unclustered-point-default', 'visibility', 'none');
        map.setLayoutProperty('clusters', 'visibility', 'none');
        map.setLayoutProperty('cluster-count', 'visibility', 'none');

        colorExpression = ['match', ['get', 'epc_rating_letter']];
        epc_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        colorExpression.push('#000000'); //black

        color_by_legend(epc_colors);
        colourLegendDiv.style.display = 'block';
        
        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories, fourth_argument: colorExpression
        create_pie_charts(centroid_points, epc_colors, "epc_rating_letter", colorExpression)

    } 
    if (selectedValue === 'passing_rent') {
        //let's remove any existing pie charts on high zoom level
        if(map.getLayer('unclustered-point')){
            map.removeLayer('unclustered-point');
            map.removeSource('unclustered-point');
        }

        // let's remove any default pie charts on high zoom level
        map.setLayoutProperty('unclustered-point-default', 'visibility', 'none');
        map.setLayoutProperty('clusters', 'visibility', 'none');
        map.setLayoutProperty('cluster-count', 'visibility', 'none');
        
        const minPassingRent = 0; // Smallest passing rent
        const maxPassingRent = 100000; // Largest passing rent
        const numSteps = 5; // Number of legend steps
        const stepSize = (maxPassingRent - minPassingRent) / numSteps; // Calculate step size

        // colorExpression = ['step', ['get', 'passing_rent'], '#ffffff', 10000, '#02f7f7', 20000]
        colorExpression = ['interpolate', ['linear'], ['get', 'passing_rent'], 0, '#ffffff', 100000, '#fafa00']; // Smallest passing rent (0) to largest passing rent (1000000), from white to yellow
        
        passing_rate_colors = []

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
            console.log(passingRent)
            console.log();

            rgb_cololor = `rgb(255, 255, ${255 - (i * (255 / numSteps))})`
            colorBox.style.backgroundColor = rgb_cololor; // Calculate color based on step
            legendItem.appendChild(colorBox);

            // Create a label.
            let label = document.createTextNode(passingRent.toFixed(2)); // Round to 2 decimal places
            legendItem.appendChild(label);

            // Add the legend item to the legend.
            colourLegendDiv.appendChild(legendItem);

            //convert rgb(_,_,_) to hex
            hex_color = rgbToHex(rgb_cololor)

            //populate passing_rate_colors object:
            passing_rate_colors.push({ value: passingRent, color: hex_color })
        }

        console.log(passing_rate_colors)

        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories, fourth_argument: colorExpression
        create_pie_charts(centroid_points, passing_rate_colors, "passing_rent", colorExpression)

        // Show the legend for passing rent when 'passing_rent' option is selected
        colourLegendDiv.style.display = 'block';

    } 
    else if (selectedValue === 'dmse_status') {
        //let's remove any existing pie charts on high zoom level
        if(map.getLayer('unclustered-point')){
            map.removeLayer('unclustered-point');
            map.removeSource('unclustered-point');
        }

        // let's remove any default pie charts on high zoom level
        map.setLayoutProperty('unclustered-point-default', 'visibility', 'none');
        map.setLayoutProperty('clusters', 'visibility', 'none');
        map.setLayoutProperty('cluster-count', 'visibility', 'none');

        colorExpression = ['match', ['get', 'dmse_status']];
        dmse_status_colors.forEach(({ value, color }) => {
        colorExpression.push(value, color);
        });
        colorExpression.push('#000000'); //black

        color_by_legend(dmse_status_colors);
        colourLegendDiv.style.display = 'block';

        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories, fourth_argument: colorExpression
        create_pie_charts(centroid_points, dmse_status_colors, "dmse_status", colorExpression)
    }
    // Set paint property to update colors
    map.setPaintProperty('blaby_leaseholds', 'fill-color', colorExpression);
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
}); 
}
