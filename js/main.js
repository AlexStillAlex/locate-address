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
        "minzoom": 13,
        "layout": {},
        "paint": {
            "fill-extrusion-color": "#DCD7C6",
            "fill-extrusion-opacity": 0.5,
            "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13,
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

// Option to upload a CSV file
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
        let text = e.target.result;
        populateDropdown(text, 0); // 0 for the first column
    };

    reader.readAsText(file);
});
// Populates a dropdown with unique values from a CSV column
function populateDropdown(csvText, columnIndex) {
    let rows = csvText.split('\n');
    let dropdown = document.getElementById('csvDataDropdown');
    let uniqueValues = new Set(); // Use a Set to store unique values

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row if present
        let columns = row.split(','); // Assuming comma-separated values
        if (columns.length > columnIndex) {
            uniqueValues.add(columns[columnIndex].trim()); // Add value to the Set
        }
    });

    uniqueValues.forEach(value => {
        let option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}
// Event listener for the drowdown
document.getElementById('csvDataDropdown').addEventListener('change', function(event) {
    let selectedValue = event.target.value;
    filterAndProcessCSV(selectedValue);
});

var globalCSVText;  // Global variable to store the CSV text
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
        globalCSVText = e.target.result; // Store CSV text in the global variable
        populateDropdown(globalCSVText, 0); // 0 for the first column
    };
    reader.readAsText(file);
});

async function filterAndProcessCSV(selectedValue) {
    let rows = globalCSVText.split('\n');
    let groupedRows = [];

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row if present
        let columns = row.split(','); // Assuming comma-separated values
        if (columns[0].trim() === selectedValue) {  // Assuming the first column is the one to match
            groupedRows.push(row);
        }
    });

    // Process grouped rows
    await lookUpAddresses(groupedRows);
}
// Querying the OS Places API
var form = document.getElementById("the-form");
form.addEventListener('submit', lookUpAddressesOld);

// Determined addresses from a new line separated string. Functionality is for testing.
async function lookUpAddressesOld(e) {
    e.preventDefault();

    clearInfoBox();
    showSpinner();

    let queryAddresses = document.getElementById('address-text').value.split('\n');
    let validAddresses = queryAddresses.filter(address => address.trim() !== "");

    if (validAddresses.length === 0) {
        alert('Please input at least one address!');
        hideSpinner();
        return;
    }

    let allAddresses = [];
    let totalLat = 0, totalLng = 0;
    let toids = []; // Array to store TOIDs

    for (let address of validAddresses) {
        let addresses = await fetchAddressFromPlaces(address);
        if (addresses.header.totalresults > 0) {
            allAddresses.push(...addresses.results);
            totalLat += addresses.results[0].DPA.LAT;
            totalLng += addresses.results[0].DPA.LNG;
            toids.push(addresses.results[0].DPA.TOPOGRAPHY_LAYER_TOID); // Add TOID to array
        }
    }

    hideSpinner();

    if (allAddresses.length < 1) {
        alert("No valid addresses found - please try again.")
        return;
    }

    let avgLat = totalLat / allAddresses.length;
    let avgLng = totalLng / allAddresses.length;

    flyToCoords([avgLng, avgLat]);
    updateInfoBoxMultiple(allAddresses);

    highlightTOIDs(toids); // Call the modified highlight function with the array of TOIDs
}

async function lookUpAddresses(addresses) {
    clearInfoBox();
    showSpinner();

    let validAddresses = addresses.filter(address => address.trim() !== "");

    if (validAddresses.length === 0) {
        alert('Please input at least one address!');
        hideSpinner();
        return;
    }

    let allAddresses = [];
    let totalLat = 0, totalLng = 0;
    let toids = []; // Array to store TOIDs

    for (let address of validAddresses) {
        let addresses = await fetchAddressFromPlaces(address);
        if (addresses.header.totalresults > 0) {
            allAddresses.push(...addresses.results);
            totalLat += addresses.results[0].DPA.LAT;
            totalLng += addresses.results[0].DPA.LNG;
            toids.push(addresses.results[0].DPA.TOPOGRAPHY_LAYER_TOID); // Add TOID to array
        }
    }

    hideSpinner();

    if (allAddresses.length < 1) {
        alert("No valid addresses found - please try again.")
        return;
    }

    let avgLat = totalLat / allAddresses.length;
    let avgLng = totalLng / allAddresses.length;

    flyToCoords([avgLng, avgLat]);
    updateInfoBoxMultiple(allAddresses);

    highlightTOIDs(toids); // Call the modified highlight function with the array of TOIDs
}
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
            "fill-color": "#38f",
            "fill-opacity": 0.5
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
        return `Address: ${address.DPA.ADDRESS}<br>UPRN: ${address.DPA.UPRN}<br>TOID: ${address.DPA.TOPOGRAPHY_LAYER_TOID}<br>Longitude: ${address.DPA.LNG}<br>Latitude: ${address.DPA.LAT}<br><br>`;
    }).join('');

    document.getElementById('address-info').innerHTML = infoContent; // Make sure this is in the HTML holy hell
}

function clearInfoBox() {
    document.getElementById('address-info').innerHTML = ""; // Updated to clear the correct element
    // document.getElementById('address').innerText = "";
    // document.getElementById('uprn').innerText = "";
    //document.getElementById('toid').innerText = "";
    // document.getElementById('longitude').innerHTML = "";
    // document.getElementById('latitude').innerHTML = "";
}

// Animated fly to coords, and rotate camera on arrival
async function flyToCoords(coords) {
    map.once('moveend', function () {
        map.rotateTo(0.0, { duration: 4000 });
    });

    map.flyTo({
        center: coords,
        zoom: 17.5,
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
function getFeatures(coord) {
    console.log(coord)
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
    const wfsParams = {
        key: apikey,
        service: 'WFS',
        request: 'GetFeature',
        version: '2.0.0',
        typeNames: 'Topography_TopographicArea',
        propertyName: 'TOID,DescriptiveGroup,SHAPE',
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

    return 'https://api.os.uk/features/v1/wfs?' + encodedParameters;
}


// Helper functions for the spinner element
function showSpinner() {
    document.getElementById('spinner').style.visibility = 'visible';
}

function hideSpinner() {
    document.getElementById('spinner').style.visibility = 'hidden';
}