
// API Key in config object 
var apikey = 'IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh'
var config = {
    apikey: apikey // a project on a Premium plan with OS Places API and OS Vector Tile API added
};

// Endpoints
const endpoints = {
    places: 'https://api.os.uk/search/places/v1',
    vectorTile: 'https://api.os.uk/maps/vector/v1/vts'
};


//Creating a mapstyle. I DO NOT USE THIS.
const style = {
    "version": 8,
    "sources": {
        "raster-tiles": {
            "type": "raster",
            "tiles": [ "https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=" + apikey ],
            "tileSize": 256
        }
    },
    "layers": [{
        "id": "os-maps-zxy",
        "type": "raster",
        "source": "raster-tiles"
    }]
};

// Initialise the map object.
var map = new maplibregl.Map({
    container: 'map',
    minZoom: 6,
    // maxZoom: 18,
    style: endpoints.vectorTile + '/resources/styles?key=' + config.apikey,
    center: [-2.968, 54.425],
    zoom: 13,
    transformRequest: url => {
        return {
            url: url + '&srs=3857'
        }
    }
});



// Add navigation control (excluding compass button) to the map.
map.addControl(new maplibregl.NavigationControl());

map.on("style.load", function () {
    // Duplicate 'OS/TopographicArea_1/Building/1' layer to extrude the buildings
    // in 3D using the Building Height Attribute (RelHMax) value.
    map.addLayer({
        "id": "OS/TopographicArea_1/Building/1_3D",
        "type": "fill-extrusion",
        "source": "esri",
        "source-layer": "TopographicArea_1",
        "filter": [
            "==",
            "_symbol",
            33
        ],
        "minzoom": 16,
        "layout": {},
        "paint": {
            "fill-extrusion-color": "#DCD7C6",
            "fill-extrusion-opacity": 0.5,
            "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                16,
                0,
                16.05,
                ["get", "RelHMax"]
            ]
        }
    });
    // Here we add the highlighted layer, with all buildings filtered out. 
    // We'll set the filter to our searched buildings when we actually
    // call the OS Places API and  have a TOID to highlight.
    map.addLayer({
        "id": "OS/TopographicArea_1/Building/1_3D-highlighted",
        "type": "fill-extrusion",
        "source": "esri",
        "source-layer": "TopographicArea_1",
        "filter": ["in", "TOID", ""],
        "minzoom": 16,
        "layout": {},
        "paint": {
            "fill-extrusion-color": "#FF1F5B",
            "fill-extrusion-opacity": 1,
            "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                16,
                0,
                16.05,
                ["get", "RelHMax"]
            ],
        }
    });
});



function highlightTOIDs(toids) {
    if (toids.length > 0) {
        let filter = ["in", "TOID"].concat(toids);
        map.setFilter("OS/TopographicArea_1/Building/1_3D-highlighted", filter);
    }
}

async function fetchAddressFromPlaces(address) {

    let url = endpoints.places + `/find?query=${encodeURIComponent(address)}&maxresults=1&output_srs=EPSG:4326&key=${config.apikey}`;
    let res = await fetch(url);
    let json = await res.json()

    return json;
}

 // Create an empty GeoJSON FeatureCollection.
 const geoJson = {
    "type": "FeatureCollection",
    "features": []
};

// Add event which waits for the map to be loaded.
map.on('load', function() {
    // Add an empty GeoJSON layer for the Topographic Area features.
    map.addLayer({
        "id": "topographic-areas",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": geoJson
        },
        "layout": {},
        "paint": {
            "fill-color": "#38f", //BLUE
            "fill-opacity": 0.7
        }
    });

    // Add click event handler.
    map.on('click', function(e) {
        let coord = e.lngLat;
        getFeatures(coord);
    });
});


// Input relevant information to the map overlay div
function updateInfoBox(placesResponse) {

    let addressString, UPRN, TOID, longitude, latitude;

    addressString = placesResponse.results[0].DPA.ADDRESS;
    UPRN = placesResponse.results[0].DPA.UPRN;
    TOID = placesResponse.results[0].DPA.TOPOGRAPHY_LAYER_TOID;
    longitude = placesResponse.results[0].DPA.LNG;
    latitude = placesResponse.results[0].DPA.LAT;

    document.getElementById('address').innerText = addressString;
    document.getElementById('uprn').innerText = UPRN;
    document.getElementById('toid').innerText = TOID;
    document.getElementById('longitude').innerHTML = longitude;
    document.getElementById('latitude').innerHTML = latitude;
}

function updateInfoBoxMultiple(addresses) {
    let infoContent = addresses.map(address => {
        return `Address: ${address.DPA.ADDRESS}
        <br>UPRN: ${address.DPA.UPRN}
         <br>TOID: ${address.DPA.TOPOGRAPHY_LAYER_TOID}
         <br>Longitude: ${address.DPA.LNG}
         <br>Latitude: ${address.DPA.LAT}
         <br><br>`;
    }).join('');

    document.getElementById('address-info').innerHTML = infoContent; // Make sure this is in the HTML holy hell
}
// Deal with this shit tomorrow using the circle greenspaces API
// async function highlightBuildings() {
//     // Code to perform the property search...

//     // After the search is completed, get the map bounds and fetch the features
//     var bounds = map.getBounds();
//     //Set bounds
//     var topLeft = bounds.getNorthWest();
//     var bottomRight = bounds.getSouthEast();
//         //Rounding
//     var topLeftLat = topLeft.lat.toFixed(6);
//     var topLeftLng = topLeft.lng.toFixed(6);
//     var bottomRightLat = bottomRight.lat.toFixed(6);
//     var bottomRightLng = bottomRight.lng.toFixed(6);
// //Construct BBOX
//     var bbox = topLeftLng + "," + topLeftLat + "," + bottomRightLng + "," + bottomRightLat;
//     bbox = 3.545148 +',' + 50.727083+','+3.538470+','+50.728095
//     console.log(bbox)
//     const features = await fetch(`https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items?bbox=${bbox}&key=IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh&filter=description%20=%20'Building'`, {
//         headers: {
//             'Accept': 'application/geo+json',
//             'key': apikey
//         }
//     }).then((response) => response.json());

//     // Do something with features...
// }
function clearInfoBox() {
    document.getElementById('address-info').innerHTML = ""; // Updated to clear the correct element
}

// Animated fly to coords, and rotate camera on arrival
//TODO: Only rotate once within postcode?
async function flyToCoords(coords) {
    map.once('moveend', function () {
        map.rotateTo(0.0, { duration: 4000 });
    });

    map.flyTo({
        center: coords,
        zoom: 18.5,
        pitch: 0,
        bearing: 180
    });
}

// Highlight the building feature with the TOID returned
// from the OS Places API call
function highlightTOID(toid) {
    let filter = ["in", "TOID", string(toid)];
    map.setFilter("OS/TopographicArea_1/Building/1_3D-highlighted", filter);
}


// Define the features and their colors
var features = [
    { name: 'Airports', color: '#088' },
    // Add more features here
];
//Adds a DIV badly.
// //Checks when the DIV has loaded and appends the legend to the div
// document.addEventListener('DOMContentLoaded', (event) => {
//     // Get the legend div
//     var legend = document.getElementById('legend');

//     // Define the features and their colors
//     var features = [
//         { name: 'Airports', color: '#088' },
//         // Add more features here
//     ];

//     // Add a legend item for each feature
//     features.forEach(function(feature) {
//         // Create the color indicator
//         var colorIndicator = document.createElement('span');
//         colorIndicator.style.display = 'inline-block';
//         colorIndicator.style.width = '20px';
//         colorIndicator.style.height = '20px';
//         colorIndicator.style.backgroundColor = feature.color;

//         // Create the label
//         var label = document.createElement('span');
//         label.textContent = feature.name;

//         // Create the legend item
//         var item = document.createElement('div');
//         item.appendChild(colorIndicator);
//         item.appendChild(label);

//         // Add the legend item to the legend
//         legend.appendChild(item);
//     });
// });
// Function to get features of the clicked point
function getFeatures(coord) {
    // Create an OGC XML filter parameter value which will select the TopographicArea
    // features containing the coordinates of the clicked point.
    let xml = '<ogc:Filter>';
    xml += '<ogc:Contains>';
    xml += '<ogc:PropertyName>SHAPE</ogc:PropertyName>';
    xml += '<gml:Point srsName="EPSG:4326">';
    xml += '<gml:coordinates>' + coord.toArray().reverse().join(',') + '</gml:coordinates>';
    xml += '</gml:Point>';
    xml += '</ogc:Contains>';
    xml += '</ogc:Filter>';

    // Define (WFS) parameters object.
    // This queries the headers under the 'TopographicArea' layer, found in 
    //https://api.os.uk/features/v1/wfs?service=wfs&request=getcapabilities&key=IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh
    //If you want to make a request for a different layer, you must define a new set of constants and append them to the div later.
    const wfsParams = {
        key: apikey,
        service: 'WFS',
        request: 'GetFeature',
        version: '2.0.0',
        typeNames: 'Topography_TopographicArea',
        propertyName: 'TOID,DescriptiveGroup,SHAPE,Shape_Area',
        outputFormat: 'GEOJSON',
        filter: xml,
        count: 1
    };

    // Use fetch() method to request GeoJSON data from the OS Features API.
    // If successful - set the GeoJSON data for the 'topographic-areas' layer and
    // re-render the map.
    fetch(getUrl(wfsParams))
        .then(response => response.json())
        .then(data => {
            if(! data.features.length )
                return;


            map.getSource('topographic-areas').setData(data);
            
            let properties = data.features[0].properties;
            properties = (({ GmlID, OBJECTID, ...o }) => o)(properties);
            // console.log(properties) //So the properties are determined before this GET request.
            // Hold on


            let content = '<div class="grid-container">';
            for( let i in properties ) {
                content += `<div>${i}</div><div>${properties[i]}</div>`;
            }
            content += '</div>';

            let popup = new maplibregl.Popup({ maxWidth: 'none' })
                .setLngLat(coord)
                .setHTML(content)
                .addTo(map);

            popup.on('close', function() {
                map.getSource('topographic-areas').setData(geoJson);
            });
        });
}
// Function to get features of the clicked point
/**
 * Return URL with encoded parameters.
 * @param {object} params - The parameters object to be encoded.
 */
function getUrl(params) {
    console.log(params)
    const encodedParameters = Object.keys(params)
        .map(paramName => paramName + '=' + encodeURI(params[paramName]))
        .join('&');

        
        console.log('https://api.os.uk/features/v1/wfs?' + encodedParameters)
    return 'https://api.os.uk/features/v1/wfs?' + encodedParameters;
}

// Helper functions for the spinner element
function showSpinner() {
    document.getElementById('spinner').style.visibility = 'visible';
}

function hideSpinner() {
    document.getElementById('spinner').style.visibility = 'hidden';
}