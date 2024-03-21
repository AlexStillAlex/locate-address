// //This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand

async function goadMapTest(){

//We have three map layers: leasehold_polygon layer (polygon), freehold_polygon layer (polygon), and tenant_names_layer (symbol; i.e. point)
    defaultcolor = 'rgb(143, 190, 226)'; // Default color
    // National Polygon Data will only have coordinates and title number. In this example, we have coordinates and dmse_ref
    const blaby_leasehold_polygons = [
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates:  [[[-1.16408809,52.57602247],[-1.16404835,52.57582307],[-1.16390855,52.57583341],[-1.16394919,52.57603246],[-1.16406393,52.57602421],[-1.16407731,52.57602325],[-1.16408809,52.57602247]]]
            },
            properties: {
                id: '17000890',
                'color': defaultcolor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16390855,52.57583341],[-1.16382506,52.57583956],[-1.16386423,52.57603852],[-1.16394919,52.57603246],[-1.16390855,52.57583341]]]
            },
            properties: {
                id: '17000891',
                'color': defaultcolor
            }
        },
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16382506,52.57583956],[-1.16374408,52.57584555],[-1.16376686,52.57595953],[-1.16379267,52.57596016],[-1.16380997,52.57596059],[-1.16382581,52.5760413],[-1.16386423,52.57603852],[-1.16382506,52.57583956]]]
            },
            properties: {
                id: '170008902',
                'color': defaultcolor
            }
        },
        //not in LM registry
         {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16376686,52.57595953],[-1.16374408,52.57584555],[-1.16367226,52.57585089],[-1.16369385,52.57595766],[-1.16376686,52.57595953]]]
            },
            properties: {
                id: '170008903',
                'color': defaultcolor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16364143,52.57594864],[-1.16364296,52.5759564],[-1.16369385,52.57595766],[-1.16367226,52.57585089],[-1.1636006,52.57585614],[-1.16362005,52.57591947],[-1.16362366,52.57593126],[-1.16362507,52.5759358],[-1.1636388,52.57593542],[-1.16364143,52.57594864]]]
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
                coordinates: [[[-1.16359661,52.57585647],[-1.16348484,52.57592967],[-1.16348367,52.5760299],[-1.16377214,52.57603103],[-1.16377112,52.5759681],[-1.16363094,52.57596639],[-1.16361583,52.5759662],[-1.16361593,52.57593605],[-1.16362507,52.5759358],[-1.16362366,52.57593126],[-1.16362005,52.57591947],[-1.1636006,52.57585614],[-1.16359661,52.57585647]]]
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
                coordinates: [[[-1.16377214,52.57603103],[-1.16348367,52.5760299],[-1.16348276,52.57607754],[-1.16378552,52.57608012],[-1.16378689,52.57603159],[-1.16377214,52.57603103]]]
            },
            properties: {
                id: '17000896',
                'color': defaultcolor
            }
        },
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16378552,52.57608012],[-1.16348276,52.57607754],[-1.16348188,52.57612428],[-1.16378403,52.57612731],[-1.16378552,52.57608012]]]
            },
            properties: {
                id: '17000897',
                'color': defaultcolor
            }
        },
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16348188,52.57612428],[-1.16348098,52.57617147],[-1.1637827,52.5761745],[-1.16378373,52.57613797],[-1.16378403,52.57612731],[-1.16348188,52.57612428]]]
            },
            properties: {
                id: '17000898',
                'color': defaultcolor
            }
        },
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.16347845,52.57628113],[-1.16378062,52.57628398],[-1.16378153,52.57625135],[-1.16378186,52.57623933],[-1.16378293,52.57620102],[-1.16348048,52.57619754],[-1.16347845,52.57628113]]]
            },
            properties: {
                id: '17000899',
                'color': defaultcolor
            }
        },


        // industrial site: Oakhill Trading Estate, Leicester
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.13125893,52.61494639],[-1.1312574,52.61516573],[-1.13184816,52.61516781],[-1.13184942,52.61494711],[-1.13125893,52.61494639]]]
            },
            properties: {
                id: '17006871',
                'color': defaultcolor
            }
        },
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.13125893,52.61494639],[-1.13184942,52.61494711],[-1.13185056,52.61472507],[-1.13126035,52.61472524],[-1.13125893,52.61494639]]]
            },
            properties: {
                id: '17006872',
                'color': defaultcolor
            }
        },
        //not in LM registry
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.1312619,52.614505],[-1.13126035,52.61472524],[-1.13185056,52.61472507],[-1.1318518,52.61450527],[-1.1312619,52.614505]]]
            },
            properties: {
                id: '17006873',
                'color': defaultcolor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.13150682,52.61414798],[-1.13141255,52.61414768],[-1.13140107,52.61414764],[-1.13140117,52.61413587],[-1.1314012,52.61413306],[-1.13137079,52.61413296],[-1.13137077,52.61413574],[-1.13137067,52.61414754],[-1.13126426,52.61414721],[-1.1312619,52.614505],[-1.1318518,52.61450527],[-1.13185307,52.61428413],[-1.13164473,52.61428371],[-1.13164473,52.61428365],[-1.13158428,52.61428351],[-1.13158458,52.61424939],[-1.13158548,52.61414822],[-1.13150682,52.61414798]]]
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
                coordinates: [[[-1.13255909,52.61465654],[-1.13218986,52.61465563],[-1.13218843,52.6149896],[-1.13255766,52.6149905],[-1.13255909,52.61465654]]]
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

    // //creating leasehold layer source
    // map.addSource('blaby_leaseholds', {
    //     type: 'geojson',
    //     data: {
    //         type: 'FeatureCollection',
    //         features: blaby_leasehold_polygons
    //     }
    // });

    // //creating leasehold layer
    // map.addLayer({
    //     id: 'blaby_leaseholds',
    //     type: 'fill',
    //     source: 'blaby_leaseholds',
    //     'paint': {
    //         'fill-color': ['get', 'color'],
    //         'fill-opacity': 0.7
    //       }
    // });

    layers_array = []

   const blaby_polygons = {
        id: 'blaby_leaseholds',
        type: 'fill',
        source: {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: blaby_leasehold_polygons
            }
        },
        'paint': {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.7
          }
    }

    layers_array.push(blaby_polygons);
    // map.addSource("blaby_leaseholds", blaby_polygons.source);
    map.addLayer(blaby_polygons);


    //add freehold source
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
    
    //add freehold layer
    map.addLayer({
        id: 'blaby_freeholds',
        type: 'line',
        "minzoom": 16,
        source: 'blaby_freeholds',
        'paint': {
            "line-color": "black",
            "line-opacity": 0.9,
            "line-width": 3
        }
    });
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
            dmse_status: "Occupied",
            passing_rent: 21000
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
            dmse_status: "Occupied",
            passing_rent: 10000
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
            dmse_status: "Occupied",
            passing_rent: 40000
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
            dmse_status: "Occupied",
            passing_rent: 19500
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
            dmse_status: "Occupied",
            passing_rent: 70000
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
            dmse_status: "Occupied",
            passing_rent: 106750
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
            dmse_status: "Occupied",
            passing_rent: 62000
        }
    }
]

put_tenant_labels()

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

        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories
        create_pie_charts(centroid_points, dmse_type_colors, "dmse_type")
        

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
        
        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories
        create_pie_charts(centroid_points, epc_colors, "epc_rating_letter")

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
        
        //INPUTS into "color_by_legend_number" function to create a legend
        const minPassingRent = 0; // Smallest passing rent
        const maxPassingRent = 120000; // Largest passing rent
        const numSteps = 5; // Number of legend steps

        colorExpression = ['interpolate', ['linear'], ['get', 'passing_rent'], minPassingRent, '#ffffff', maxPassingRent, '#fafa00']; // Smallest passing rent (0) to largest passing rent (1000000), from white to yellow

        //first argument: minValue. Second argument: maxValue. Third argument: number of steps.
        color_by_legend_number(minPassingRent, maxPassingRent, numSteps)

        console.log(passing_rate_colors)

        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories
        create_pie_charts(centroid_points, passing_rate_colors, "passing_rent")

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

        // first_argument: feature_points, second_argument: color_categories, third_argument: feature_property_categories
        create_pie_charts(centroid_points, dmse_status_colors, "dmse_status")
    }
    // Set paint property to update colors
    map.setPaintProperty('blaby_leaseholds', 'fill-color', colorExpression);
});
}
