//Test if this works
// API Key in config object 
var apikey = 'IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh' //My calls are being throttled so I don't care if this is exposed.
var config = {
    apikey: apikey 
};

// Endpoints
const endpoints = {
    places: 'https://api.os.uk/search/places/v1',
    vectorTile: 'https://api.os.uk/maps/vector/v1/vts'
};
//Definining custom map styles
 const customStyleJson = 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Road.json';
 const style2 = 'https://api.os.uk/maps/vector/v1/vts/resources/styles?key=' + apikey;

// Initialise the map object.
const style = {
    "version": 8,
    "glyphs": "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    "sources": {
        "raster-tiles": {
            "type": "raster",
            "tiles": [ "https://api.os.uk/maps/raster/v1/zxy/Road_3857/{z}/{x}/{y}.png?key=" + apikey ],
            "tileSize": 256
        }
    },
    "layers": [{
        "id": "os-maps-zxy",
        "type": "raster",
        "source": "raster-tiles"
    }]
};

// Initialize the map object.
const map = new maplibregl.Map({
    container: 'map',
    minZoom: 6,
    maxZoom: 19,
    style: customStyleJson,
    maxBounds: [
        [ -10.76418, 49.528423 ],
        [ 1.9134116, 61.331151 ]
    ],
    center: [ -2.158607182943474, 52.504686972808571 ],
    zoom: 17,
    transformRequest: url => {
        if(! /[?&]key=/.test(url) ) url += '?key=' + apikey
        return {
            url: url + '&srs=3857'
        }
    }
});

map.on('style.load', function () {
    console.log('Style has loaded.');
});

map.on('error', function (e) {
    console.error('An error occurred: ', e.error);
});
// Add navigation control (excluding compass button) to the map.

    map.addControl(new maplibregl.NavigationControl({
        showCompass: true
    }));

//Add scale control.
    map.addControl(new maplibregl.ScaleControl({
        maxWidth: 200, //in Pixels
        unit: 'metric'
    }));

//This function is redundant if we don't have to highlight buildings that have been searched.
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
            "fill-opacity": 0.3 //Don't even need to highlight htis
        }
    });

    // Add click event handler.
    map.on('click', function(e) {
        let coord = e.lngLat;

        // SetMarkerLocation(coord);
        getFeatures(coord);

    });
});

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

// Function to get features of the clicked point

// Declare an object to store the markers outside of the fetch function
let markers = {};
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
        propertyName: 'TOID,Theme,SHAPE,CalculatedAreaValue,RelH2,RelHMax,DescriptiveTerm', // I'm asking for all the features now.
        outputFormat: 'GEOJSON',
        filter: xml,
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
////////////////////////////////////////////////////////////////////////////////////////////////////////

// When Export map is clicked, the map will download.
document.getElementById('exportMap').addEventListener('click', function() { 
    var dpi = 900;
    Object.defineProperty(window, 'devicePixelRatio', {
        get: function() {return dpi / 96}
    });
    map.once('render', function() {
        var mapCanvas = map.getCanvas();
        var mapImage = new Image();
        mapImage.src = mapCanvas.toDataURL('image/png');
        //Adds padding. WIll need to do as a percentage of the Map pixels.
        mapImage.onload = function() {
            var padding = 50; // The amount of white space to add around the image
            var canvas = document.createElement('canvas');
            canvas.width = mapCanvas.width + padding * 2;
            canvas.height = mapCanvas.height + padding * 2;
            var context = canvas.getContext('2d');

            // Draw a white rectangle
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the map image on top of the white rectangle
            context.drawImage(mapImage, padding, padding);

            // Export the image
            var imgURL = canvas.toDataURL('image/png');
            var link = document.createElement('a');
            link.href = imgURL;
            link.download = 'what_a_gift.png';
            link.click();
        };
    });
    map.triggerRepaint();
});

    //Toggles the Collapsible menu when clicked. Does this by taking the Button ID.
function toggleCollapsible(event) {
    var buttonId = event.target.id; 
    var coll = document.getElementById(buttonId); 
    coll.classList.toggle("active");
    var sections = coll.nextElementSibling;//Logic to show/hide
    if (sections.style.display == "block") {
        sections.style.display = "none";
    } else {
        sections.style.display = "block";
    }
}

  //best commit:
  console.log(`All you need is
  ⢀⡴⠑⡄⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
  ⠸⡇⠀⠿⡀⠀⠀⠀⣀⡴⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠑⢄⣠⠾⠁⣀⣄⡈⠙⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⢀⡀⠁⠀⠀⠈⠙⠛⠂⠈⣿⣿⣿⣿⣿⠿⡿⢿⣆⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⢀⡾⣁⣀⠀⠴⠂⠙⣗⡀⠀⢻⣿⣿⠭⢤⣴⣦⣤⣹⠀⠀⠀⢀⢴⣶⣆ 
  ⠀⠀⢀⣾⣿⣿⣿⣷⣮⣽⣾⣿⣥⣴⣿⣿⡿⢂⠔⢚⡿⢿⣿⣦⣴⣾⠁⠸⣼⡿ 
  ⠀⢀⡞⠁⠙⠻⠿⠟⠉⠀⠛⢹⣿⣿⣿⣿⣿⣌⢤⣼⣿⣾⣿⡟⠉⠀⠀⠀⠀⠀ 
  ⠀⣾⣷⣶⠇⠀⠀⣤⣄⣀⡀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
  ⠀⠉⠈⠉⠀⠀⢦⡈⢻⣿⣿⣿⣶⣶⣶⣶⣤⣽⡹⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠀⠀⠀⠉⠲⣽⡻⢿⣿⣿⣿⣿⣿⣿⣷⣜⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣷⣶⣮⣭⣽⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠀⠀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⠿⠿⠿⠛⠉`)
