
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

// Initialise the map object.
const map = new maplibregl.Map({
    container: 'map',
    minZoom: 6,
    maxZoom: 18,
    style: customStyleJson,
    maxBounds: [
        [ -10.76418, 49.528423 ],
        [ 1.9134116, 61.331151 ]
    ],
    center: [ -0.1145886,51.4649944 ],
    zoom: 16,
    preserveDrawingBuffer: true, //Allows me to export a higher resolution map. Thank Stackoverflow.
    transformRequest: url => {
        if(! /[?&]key=/.test(url) ) url += '?key=' + apikey //stipid regex
        return {
            url: url + '&srs=3857'
        }
    }
});

// Add navigation control (excluding compass button) to the map.
map.addControl(new maplibregl.NavigationControl());
//Removed logic to create a 3D layer. Reduces the number of API calls.

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
    console.log(params)
    const encodedParameters = Object.keys(params)
        .map(paramName => paramName + '=' + encodeURI(params[paramName]))
        .join('&');  
        // console.log('https://api.os.uk/features/v1/wfs?' + encodedParameters)
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
//In the HTML file this searches references when the user types in the search bar.
function searchReferences() {
    var input, ul,filter, li, a, i, visibleCount;
    input = document.getElementById("mySearch"); //Gets the search bar
    ul = document.getElementById("myMenu");
    var filter = input.value.toUpperCase(); // shouldnt matter cos we're dealing with numvers
    li = ul.getElementsByTagName("li"); 
    visibleCount = 0; //Counter to keep track of how many items are visible

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0]; //Each list element has a tag called 'a'. These are called anchor tags.
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            if (visibleCount < 3) { //Only show 3 items at a time
                li[i].style.display = "block"; //Show vertically
                visibleCount++;
            } else {
                li[i].style.display = "none";
            }
        } else {
            li[i].style.display = "none";
        }
    }
}

window.onload = function() { //When the server loads ping a request to the backend to populate the dropdown with property references.
    fetch('/dropdown-data')
        .then(response => response.json())
        .then(data => {
            populateDropdown(data);
        });
}
function populateDropdown(data) {
    var menu = document.getElementById('myMenu'); //Gets the menu. Initially blank
    data.forEach(function(item) { 
        //For each item in my data JSON containing property references, it will happend a hidden list item to the menu.
        //then has onclick functionality to fly to the coordinates of the property.
        var li = document.createElement('li');
        li.className = 'searchable';
        var a = document.createElement('a');
        a.href = '#';
        a.textContent = item.prop_ref; // Use the prop_ref property as the text
        a.onclick = function() {
            flyToCoords([item.prop_longitude, item.prop_latitude]); // fsr longitude and latitude are the wrong way round in theses systems.
        };
        li.appendChild(a);
        menu.appendChild(li);
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
// BACKEND INTERACTIONS
//Get the Databricks query on Client side
document.getElementById('testButton').addEventListener('click', function() {
    const query = document.getElementById('queryInput').value;
    fetch('/run-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query // Send the user's input as the query
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });
//Get the HM land registry stuff on client side.
document.getElementById('testButton').addEventListener('click', function() {
    fetch('/get-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });
/////////////////////////////////////////////////////////////////////
//Radio Logic
// var radios = document.querySelectorAll('#mapOverlay [type="radio"]');
// console.log(radios)
// // Add an event listener to each radio button
// for (var i = 0; i < radios.length; i++) {
//     radios[i].addEventListener('change', function() {
//         // Check if the "Images" radio button is selected
//         if (document.getElementById('Images').checked) {
//             // The "Images" radio button is selected, load features.js
//             addImageLayer(true);
//         } else {
//                 addImageLayer(false);
//             }
//     });
// }
// When Export map is clicked, the map will download.
document.getElementById('exportMap').addEventListener('click', function() { 
    //I was having some ittisues with the map not rendering before the download so I measured the time it took to render.
    // console.log('clicked')
    // tic = Date.now() //tic
    //Logic to IMPROVE resolution of Map. Should be easier for exports.
    var dpi = 900;
    Object.defineProperty(window, 'devicePixelRatio', {
        get: function() {return dpi / 96} //Standard ratio suppposedly.
    });
    map.once('render', function() { // Wait for the map to render! Important otherwise you get a blank image!
        var imgURL = map.getCanvas().toDataURL('image/png'); // Get the data URL of the map
        var link = document.createElement('a'); 
        link.href = imgURL; 
        link.download = 'what_a_gift.png'; // Set the download attribute to the desired file name
        link.click(); // Click the link to start the download

        // toc =  Date.now()
        // console.log('time taken:')
        // console.log((toc - tic) / 1000)
    });
    map.triggerRepaint(); // Force a map rerender
});




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
