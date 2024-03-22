// Causes an error??? Why is it here.
// Keeping for posterity
// const { getGeom } = require("@turf/turf");
//CONSTANTS
var form = document.getElementById("the-form");
// var apikey = 'IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh' //My calls are being throttled so I don't care if this is exposed.
form.addEventListener('submit', lookUpAddressesOld);

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
                    // When popup close sets the source to an empty GeoJSON feature collection
                    map.getSource('topographic-areas').setData({
                        type: 'FeatureCollection',
                        features: []
                    });
                });
        });
}

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
// Highlight the building feature with the TOID returned
// from the OS Places API call
function highlightTOID(toid) {
    let filter = ["in", "TOID", string(toid)];
    map.setFilter("OS/TopographicArea_1/Building/1_3D-highlighted", filter);
}

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


// Determined addresses from a new line separated string. Functionality is for testing.
async function lookUpAddressesOld(e) {
    e.preventDefault();

    clearInfoBox();
    showSpinner();

    let queryAddresses = document.getElementById('address-text').value.split('\n');
    let validAddresses = queryAddresses.filter(address => address.trim() !== ""); //check if address is blank

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

    //Not calling this as it's got stupid layers.
    // highlightTOIDs(toids); // Call the modified highlight function with the array of TOIDs
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
            if (visibleCount < 3) { //Only show 3 items at a time. Change this to one
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

//Same as above, but now for asset managers
function searchReferences_asset_managers() {
    var input, ul,filter, li, a, i, visibleCount;
    input = document.getElementById("asset_manager_box"); //Gets the search bar
    ul = document.getElementById("myMenu_asset_manager");
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

async function populateDropdown_asset_managers(data) {

    // const asset_manager_array = data.map(obj => obj.dmse_surveyor);
    // const assetManagerBox = document.getElementById('asset_manager_box');
    // new Awesomplete(assetManagerBox, {
    //     list: asset_manager_array
    // });


    var menu = document.getElementById('myMenu_asset_manager'); //Gets the menu. Initially blank
    data.forEach(function(item) { 
        //For each item in my data JSON containing property references, it will append a hidden list item to the menu.
        //then has onclick functionality to fly to the coordinates of the property.
        var li = document.createElement('li');
        li.className = 'searchable';
        var a = document.createElement('a'); //these are called ANCHOR tags. 
        a.href = '#'; //Link is blank. good for now.
        a.textContent = item.dmse_surveyor; // Use the prop_ref property as the text

        a.onclick = function() {
            map.setFilter('blaby_leaseholds', ['==', ['string', ['get', 'dmse_surveyor']], item.dmse_surveyor]);
        }

        li.appendChild(a);
        menu.appendChild(li);
    });
}

document.getElementById('asset_manager_box').addEventListener('input', function () {
    const assetManager = document.getElementById('asset_manager_box').value.trim().toLowerCase();
    if (assetManager === '') {
        // If input is empty, show all polygons
        map.setFilter('blaby_leaseholds', null);
}
});


// DRAWING.JS
// When Export map is clicked, the map will download.
document.getElementById('exportMap').addEventListener('click', function() { 
    map.once('render', function() {
        var mapCanvas = map.getCanvas(); //Get the MAPBOX canvas
        var mapImage = new Image(); // Create a blank image for the MAP layer
        mapImage.src = mapCanvas.toDataURL({ pixelRatio: 10 }); // Convert the canvas to a png URL
        var mCoreOverlayImage = new Image(); // Create a blank image for the overlay (MCore logo)
        mCoreOverlayImage.src = 'img/mcore.png'; // Set the source of the Mcore logo

        mapImage.onload = function() {
            // Create a new container for the Konva stage
            var container = document.createElement('div');
            container.id = 'canvas-container';
            document.body.appendChild(container);

            // Create a new Konva stage
            var paddingx = mapCanvas.width/30; // Adjust the padding as needed
            var paddingy = mapCanvas.height/7; 

            
            var stage = new Konva.Stage({
                container: 'canvas-container',
                width: 1191,
                height: 842,
            });

            
            // Create a new Konva layer for the rectangle
            var rectangleLayer = new Konva.Layer();

            // Create a new Konva rectangle
            var rectangle = new Konva.Rect({
                x: 0,   
                y: 0,
                width: stage.width(),
                height: stage.height(),
                fill: 'white' // Adjust the color as needed
            });

            // Add the rectangle to the rectangle layer
            rectangleLayer.add(rectangle);
            // Calculate the center position

            // Calculate the center position
            var centerX = (stage.width() - (mapCanvas.width - 2*paddingx)) / 2;
            var centerY = (stage.height() - (mapCanvas.height - 2*paddingy)) / 2;

            // Create a new Konva image using the map image
            var konvaImage = new Konva.Image({
                image: mapImage,
                x: centerX,
                y: centerY,
                width: mapCanvas.width - 2*paddingx,
                height: mapCanvas.height - 2*paddingy
            });
            // Add the Konva image to the rectangle layer
            rectangleLayer.add(konvaImage);

            // Add the rectangle layer to the stage
            stage.add(rectangleLayer);


            function drawImage() {
                return new Promise((resolve, reject) => {
                    var mCoreOverlayImage = new Image();
                    mCoreOverlayImage.src = 'img/mcore.png';
                    mCoreOverlayImage.onload = function() {
                        var mCoreKonvaImage = new Konva.Image({
                            image: mCoreOverlayImage,
                            height: paddingy,
                            width:  stage.width() / 8,
                            x: paddingx, 
                            y: 0
                        });
                        // Add the MCore logo to the rectangle layer
                        rectangleLayer.add(mCoreKonvaImage);
                        rectangleLayer.draw();
                        resolve();
                    };
                    mCoreOverlayImage.onerror = function() {
                        reject(new Error('Failed to load image'));
                    };
                });
            }
            async function main() {
                try {
                    await drawImage();
            
                    stage.draw();
                    var link = document.createElement('a');
                    link.href = stage.toDataURL({ pixelRatio: 5}); // Set the href attribute
                    link.download = 'map.png';
                    link.click();
            
                    // Remove the container from the document after exporting the image
                    document.body.removeChild(container);
                } catch (error) {
                    console.error('An error occurred:', error);
                }
            }
        main();

        var text = new Konva.Text({
            x: stage.width() / 2,
            y:  paddingy/2,
            text: 'PENSNETT',
            fontSize: stage.width() * 0.02,
            fontFamily: 'Comic Sans MS',
            fill: 'black',
            align: 'center',
        });
        
        // To align the text in the center of its position, set the offset to half of the text's size
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);
        
        // Add the text to the rectangle layer
        rectangleLayer.add(text);
        rectangleLayer.draw();

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



// the x,y position of a rect shape is in fact the top left corner, so to 
// correcty centre we should consider width and height in the mix.
// Konva.Rect and Konva.Image shapes both have x, y being topleft. 
function centreRectShape(shape){
    shape.x( ( stage.getWidth() - shape.getWidth() ) / 2);
    shape.y( ( stage.getHeight() - shape.getHeight() ) / 2);
  }
  

//   CALLING ENDPOINTS

async function populateDropdown(data) {
    var menu = document.getElementById('myMenu'); //Gets the menu. Initially blank
    data.forEach(function(item) { 
        //For each item in my data JSON containing property references, it will append a hidden list item to the menu.
        //then has onclick functionality to fly to the coordinates of the property.
        var li = document.createElement('li');
        li.className = 'searchable';
        var a = document.createElement('a'); //these are called ANCHOR tags. 
        a.href = '#'; //Link is blank. good for now.
        a.textContent = item.prop_ref; // Use the prop_ref property as the text

        a.onclick = function() {
            flyToCoords([item.prop_longitude, item.prop_latitude]); // fsr longitude and latitude are the wrong way round in theses systems.

        // Since I'm repeating something like this 3 times, I should probably make a function for it.
        let totalArea = getArea(coordinates[0]); //Most accurate: Ellipsoidal projection
        let internalArea = item.prop_area/10.764; //Convert from ft² to m²
        let externalArea = totalArea - item.prop_area/10.764;
          // Select the div elements
        let totalAreaDiv = document.getElementById('totalArea');
        let internalAreaDiv = document.getElementById('internalArea');
        let externalAreaDiv = document.getElementById('externalArea');
        // Update the div elements
        totalAreaDiv.innerText = 'Total Area: ' + totalArea.toFixed(2) + ' m²';
        internalAreaDiv.innerText = 'Internal Area: ' + internalArea.toFixed(2)+ ' m²';
        externalAreaDiv.innerText = 'External Area: ' + externalArea.toFixed(2)+ ' m²';
            
        };
        li.appendChild(a);
        menu.appendChild(li);
    });
}

// SELECTING.JS

//highlights features with box defined by coords. Initially the 'circular' box.
async function getFeaturesHighlighted(filterValue, color,bbox = getCircleBoundingBox(map.getCenter(), 200 / 1000 / 111.325)) {
    let offset = 0;
    let allFeatures = [];
    let limit = 100;
    let filter = `oslandusetiera eq '${filterValue}'`;

    while (true) {
        let url = `${baseUrl}?filter=${encodeURIComponent(filter)}&bbox=${bbox}&key=${key}&limit=${limit}&offset=${offset}`;
 
        // Fetch the features.
        const response = await fetch(url);
        const data = await response.json();
        console.log(url);
        allFeatures.push(...data.features);

        // If the number of features in the response is less than the limit, we've reached the last page.
        if (data.features.length < limit) {
            break;
        }

        // Otherwise, increment the offset by the limit to fetch the next page of results.
        offset += limit;
    }

    // Add a new layer with all fetched features.
    map.addLayer({
        "id": `highlighted-buildings-${filterValue}`,
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": allFeatures
            }
        },
        "layout": {},
        "paint": {
            "fill-color": color,
            "fill-opacity": 0.3 //CHANGE TO 0.8 WHEN NOT TESTING
        }
    });
}

// TESTING FOR PENSNETT
/**
 * Get features from the API.
 */
// function getFeatures(flip) {
//     // Define request parameters.
//     const params = {
//         key: apikey,
//         dataset: dataset,
//         offset: 0,
//         output_srs: 'EPSG:4326',
//         srs: 'EPSG:4326'
//     };

//     //arrays for topographical features and TOID for highlighting buildings in the section below
//     let TOID_for_highlighting_buildings = [];
//     let UPRN_for_highlighting_buildings = [];

//     let resultsRemain = true;

//     // Use fetch() method to request all addresses (in JSON format).
//     //
//     // Calls will be made until the number of features returned is less than the
//     // requested count, at which point it can be assumed that all features for
//     // the query have been returned, and there is no need to request further pages.
//     document.getElementById('testPensnett').addEventListener('click', function() {
//         function fetchWhile(resultsRemain) {
//             if( resultsRemain ) {
//                 const queryString = Object.keys(params).map(function(key) {
//                     return key + '=' + params[key];
//                 }).join('&');

//                 fetch('https://api.os.uk/search/places/v1/polygon?' + queryString, { // Inputs OUR Polygon
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify(geoJsonPoly)
//                 })
//                 .then(response => response.ok ? response.json() : Promise.reject({ err: response.status }))
//                 .then(data => {
//                     if( data.header.totalresults === 0 ) {
//                         document.getElementsByClassName('message')[0].style.display = 'inline-block'; //Creates a popup 
//                         return;
//                     }

//                     data.results.forEach(function(val, i) {
//                         let type = val.hasOwnProperty('DPA') ? 'DPA' : 'LPI'; //Can ignore this. To do with which UPRN datasets we used. Hardcoded to LPI
//                         let result = val[ type ];
//                         //Empty map layer as uesual.
//                         let feature = {
//                             "type": "Feature",
//                             "properties": {
//                                 "DATASET": type,
//                                 "UPRN": result.UPRN,
//                                 "ADDRESS": result.ADDRESS
//                             },
//                             "geometry": {
//                                 "type": "Point",
//                                 "coordinates": [ result.LNG, result.LAT ]
//                             }
//                         };
//                         console.log(result);
//                         geoJson.features.push(feature);

//                         //array of topographical features used for highlighting buildings in the next sction
//                         TOID_for_highlighting_buildings.push(result.TOPOGRAPHY_LAYER_TOID);
//                         //array of UPRNs created for highlighting buildings in the next section
//                         //UPRN_for_highlighting_buildings.push(result.UPRN);
                        
//                     });


//                         //Pagination
//                     params.offset += data.results.length;

//                     resultsRemain = data.results.length < 100 ? false : true;

//                     fetchWhile(resultsRemain);
                
//                 })
//                 .catch(error => console.log(error));
//             }
//             else {
//                 map.getSource('addresses').setData(geoJson);

//             HighlightBuildings(TOID_for_highlighting_buildings);

//             }
//         }
//         fetchWhile(resultsRemain);
//     });
//     }

//Highlight Features within Pensnett
function HighlightBuildings(TOID_for_highlighting_buildings){
    //HIGHLIGHTING FEATURES - we get all features within each array
    console.log(TOID_for_highlighting_buildings);

    //there could be several UPRNs refering to the same feature, so many UPRNs referring to same TOID. So, we want only distinct TOIDs.
    function removeDuplicatesFromArray(arr){
        let unique_toid_array = [];
        arr.forEach(element => {
            if (!unique_toid_array.includes(element)){
                unique_toid_array.push(element);
            }
        });
        return unique_toid_array;
    } 
    
    //now we have an array of distinct TOIDS
    unique_toid_array = removeDuplicatesFromArray(TOID_for_highlighting_buildings)
    console.log(unique_toid_array);

    const toidJSON = {
        "type": "FeatureCollection",
        "features": []
    };

    //Maximum number of TOIDs per request
    const maxTOIDsPerRequest = 100;

    //Split the list of TOIDs into smaller arrays
    const dividedTOIDs = [];
    for (let i = 0; i < unique_toid_array.length; i += maxTOIDsPerRequest){
        dividedTOIDs.push(unique_toid_array.slice(i, i+maxTOIDsPerRequest))
    }

    console.log(dividedTOIDs)

    const fetchPromises = dividedTOIDs.map(subsetTOIDs => {
    let arguments_to_default_url = subsetTOIDs.map(toid=> `(toid=%27${toid}%27)`).join('or');
    let default_url = "https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items?key=IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh&filter="
    let final_url_for_highlighting_features = default_url.concat(arguments_to_default_url);
    console.log(final_url_for_highlighting_features);

    fetch(final_url_for_highlighting_features,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            key: apikey
        }
        })
 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Process the response (parse JSON, extract features, etc.)
        const featuresWithinPolygon = data.features;
        console.log(featuresWithinPolygon);

        //toidJSON.features.push(featuresWithinPolygon);
        toidJSON.features = toidJSON.features.concat(featuresWithinPolygon);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    // });
    });

    Promise.all(fetchPromises)
    .then(() => {
    console.log(JSON.stringify(toidJSON));

    map.addLayer({
        id: "buildingHighlight",
        type: "fill",
        source: {
            "type": "geojson",
            "data": toidJSON
        },
        paint: {
            "fill-color": "#f50b07"
        }
    });
    })
    .catch(error => {
        console.error('Error in Promise.all:', error);
    });
}   


/**
 * Opens a popup at the defined location, with some basic HTML content for the
 * feature properties.
 */
function showPopup(properties, coord) {
    let total = properties.length;

    const getAddressEntity = function(obj) {
        return `<b>${obj.ADDRESS}</b><br>Dataset: ${obj.DATASET} | UPRN: ${obj.UPRN}`;
    }

    let content = `<div id="popup-body">${getAddressEntity(properties[0])}</div>`;

    if( total > 1 )
        content += `<div id="popup-nav">
        <span>(1 of ${total})</span>
        <a href="#" class="nav next">&#5125;</a><a href="#" class="nav prev">&#5130;</a>
        </div>`;

    popup = new maplibregl.Popup({ maxWidth: 'none' })
        .setLngLat(coord)
        .setHTML(content)
        .addTo(map);

    let navItems = document.querySelectorAll('.nav'),
        counter = 0;

    for( let i = 0; i < navItems.length; i++ ) {
        navItems[i].addEventListener('click', function(event) {
            event.preventDefault();

            this.classList.contains('next') ? counter++ : counter--;
            counter = counter == -1 ? total - 1 : counter % total;

            document.getElementById('popup-body').innerHTML = getAddressEntity(properties[ counter ]);
            document.querySelector('#popup-nav span').innerHTML = `(${counter+1} of ${total})`;
        });
    }
}

/**
 * Takes an input feature and flips the coordinates from [x, y] to [y, x].
 */
function flipCoords(obj) {
    const coords = obj.geometry.coordinates[0];
    coords.forEach(function(val, i) {
        coords[i] = [val[1], val[0]];
    });
    return obj;
}
//Takes in an OUTERring
function getArea(array,geod = geodesic.Geodesic.WGS84) {         //Default projection system.
    //using the geodesic library to calculate the area of the polygon
    //Used this tutorial:
    //https://geographiclib.sourceforge.io/JavaScript/doc/tutorial-3-examples.html
    var p = geod.Polygon(false);
    for (i = 0; i < array.length; ++i)
        p.AddPoint(array[i][0], array[i][1]);
        p = p.Compute(false, true);

    var area = Math.abs(p.area.toFixed(2));
    return area;
}

// ADDING POLYGONS
    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // Function to calculate rotation angle based on the longest side of the polygon
    function getRotation(coordinates) {
        var R = 6371e3; // Earth's radius in meters
        var counter = 1;
        while (!(coordinates.length >= 2)) {
            counter++;
            coordinates = coordinates.flat(1);
        }
        var maxDistance = 0;
        var rotation = 0;
        for (var i = 0; i < coordinates.length - 1; i++) {
            var x1 = R * Math.cos(coordinates[i][1]) * Math.cos(coordinates[i][0]);
            var y1 = R * Math.cos(coordinates[i][1]) * Math.sin(coordinates[i][0]);
    
            var x2 = R * Math.cos(coordinates[i+1][1]) * Math.cos(coordinates[i+1][0]);
            var y2 = R * Math.cos(coordinates[i+1][1]) * Math.sin(coordinates[i+1][0]);
    
            var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            if (distance > maxDistance) {
                maxDistance = distance;
                rotation = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                console.log(x2-x1, y2-y1)
                console.log('hej')
                console.log(Math.acos((x2-x1)/Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))))
                console.log(Math.atan((y2-y1)/(x2-x1)))

                // if (rotation < 0) {
                //     rotation += 360 - rotation;
                // }
            }
        }
        console.log(rotation)
        return Math.abs(rotation) + Math.PI;

    

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

    // get the centroid of the plygon for text inputting
    function getCentroid(coordinates) {
        // Create a Polygon feature from the coordinates
        var polygon = turf.polygon([coordinates]);
    
        // Calculate the centroid of the polygon
        var centroid = turf.centroid(polygon);
    
        // Return the coordinates of the centroid
        return centroid.geometry.coordinates;
    }

    // Use turf library to rotate a polygon around it's centroid.
    function rotateCoordinates(coordinates, angle) {
        // Create a polygon from the coordinates
        const polygon = turf.polygon(coordinates);
    
        // Calculate the centroid of the polygon
        const centroid = turf.centroid(polygon);
    
        // Rotate the polygon around the centroid by the specified angle
        const rotatedPolygon = turf.transformRotate(polygon, angle, { pivot: centroid });
    
        // Return the coordinates of the rotated polygon
        return rotatedPolygon.geometry.coordinates[0];
    }
    // Like np.linspace

    function linSpace(startValue, stopValue, cardinality) {
        var arr = [];
        var step = (stopValue - startValue) / (cardinality - 1);
        for (var i = 0; i < cardinality; i++) {
          arr.push(startValue + (step * i));
        }
        return arr;
      }

      async function getLargestResult(testcoord, thetaValues) {
        // Initialise blank variables
        let largestArea = null;
        let largestTheta = null;  
        let finalcoords = null;
        for (let theta of thetaValues) {
            rotatedCoords = rotateCoordinates(testcoord, theta); //rotate our polygon. 
            const response = await fetch('/get_rectangle_py', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "coords": [rotatedCoords]}),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            let coords = JSON.parse(data.data);//Read data
            let area = getArea(coords[0]); // Weird things with the arrays.
            // console.log(area,coords)
            // console.log(rotateCoordinates(coords,-theta))
            newrectangle = rotateCoordinates(coords,-theta) //Undo our rotation
            //Checks the largest area
            if (largestArea === null || area > largestArea) {
                largestArea = area;
                largestTheta=theta;
                finalcoords = rotateCoordinates(coords,-theta);
            }
            // Update the layer?
            map.getSource('inscribed_rectangles_testing').setData({
              type: 'FeatureCollection',
              features: [{
                  type: 'Feature',
                  geometry: {
                      type: 'Polygon',
                      coordinates: [newrectangle]
                  }
              }]
          });
        }
        console.log(largestArea,finalcoords,largestTheta)
        return {largestArea,finalcoords,largestTheta};
      }

function create_pie_charts (feature_points, color_categories, feature_property_categories) {
    //First, let's create filters as distinct variables. Create an object to store the filters
    const filter_categories = {};

    //All values in epc_colors are numbers
    if (color_categories.every(obj => typeof obj.value === 'number')){

        for (let i = 0; i < color_categories.length - 1; i++) {
            const currentValue = color_categories[i].value;
            const nextValue = color_categories[i + 1].value;
        
            const filterKey = `color_by_category_${nextValue}`;
            const filterCondition = ['all', 
                ['>=', ['get', feature_property_categories], currentValue],
                ['<', ['get', feature_property_categories], nextValue]
            ];
        
            filter_categories[filterKey] = filterCondition;
        }
    }
    //All values in passing_rent_colors are strings
    if (color_categories.every(obj => typeof obj.value === 'string')){
        // Iterate over (category) colour object to create filters
        color_categories.forEach(item => {
            filter_categories['color_by_category_' + item.value] = ['==', ['get', feature_property_categories], item.value];
        });
    }

    // Create clusterProperties dynamically
    const clusterProperties = {};
    Object.keys(filter_categories).forEach(key => {
        clusterProperties[key] = ['+', ['case', filter_categories[key], 1, 0]];
    });

    console.log(clusterProperties)
    // Now you can use clusterProperties in your map source
    map.addSource('unclustered-point', {
        'type': 'geojson',
        'data': {
            type: 'FeatureCollection',
            features: feature_points
            },
        'cluster': true,
        'clusterRadius': 80,
        'clusterProperties': clusterProperties
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'unclustered-point',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        },
        maxzoom : 15 //don't show this layer when zoom level is < 15
    });

    //Create an array of colors from color_categories
    const colors = color_categories.map(item => item.color);

    // objects for caching and keeping track of HTML marker objects (for performance)
    const markers = {};
    let markersOnScreen = {};

    function updateMarkers() {
        const newMarkers = {};

        //PROBLEM: here; the features do not have properties color_by_category_20000, color_by_category_40000, etc.
        const features = map.querySourceFeatures('unclustered-point');

        // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
        // and add it to the map if it's not there already
        for (let i = 0; i < features.length; i++) {
            const coords = features[i].geometry.coordinates;
            const props = features[i].properties;

            if (!props.cluster) continue;
            const id = props.cluster_id;

            let marker = markers[id];

            if (!marker) {
                const el = createDonutChart(props);
                marker = markers[id] = new maplibregl.Marker({
                    element: el
                }).setLngLat(coords);
            }

            newMarkers[id] = marker;

            if (!markersOnScreen[id]) marker.addTo(map);
        }
        // for every marker we've added previously, remove those that are no longer visible
        for (id in markersOnScreen) {
            if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
    }

    // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
    map.on('data', (e) => {
        if (e.sourceId !== 'unclustered-point' || !e.isSourceLoaded) return;
        map.on('move', updateMarkers);
        map.on('moveend', updateMarkers);
        updateMarkers();
    });

    // code for creating an SVG donut chart from feature properties
    function createDonutChart(props) {
        const offsets = [];

        const counts = Object.keys(props)
        .filter(key => key.startsWith("color_by_category_"))
        .map(key => props[key]);

        let total = 0;
        for (let i = 0; i < counts.length; i++) {
            offsets.push(total);
            total += counts[i];
        }

        const fontSize =
        total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
        const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
        const r0 = Math.round(r * 0.6);
        const w = r * 2;

        let html =
            `<div><svg width="${
                w
            }" height="${
                w
            }" viewbox="0 0 ${
                w
            } ${
                w
            }" text-anchor="middle" style="font: ${
                fontSize
            }px sans-serif; display: block">`;

        for (i = 0; i < counts.length; i++) {
            html += donutSegment(
                offsets[i] / total,
                (offsets[i] + counts[i]) / total,
                r,
                r0,
                colors[i]
            );
        }
        html +=
            `<circle cx="${
                r
            }" cy="${
                r
            }" r="${
                r0
            }" fill="white" /><text dominant-baseline="central" transform="translate(${
                r
            }, ${
                r
            })">${
                total.toLocaleString()
            }</text></svg></div>`;

        const el = document.createElement('div');
        el.innerHTML = html;
        return el.firstChild;
    }

    function donutSegment(start, end, r, r0, color) {
        if (end - start === 1) end -= 0.00001;
        const a0 = 2 * Math.PI * (start - 0.25);
        const a1 = 2 * Math.PI * (end - 0.25);
        const x0 = Math.cos(a0),
            y0 = Math.sin(a0);
        const x1 = Math.cos(a1),
            y1 = Math.sin(a1);
        const largeArc = end - start > 0.5 ? 1 : 0;

        return [
            '<path d="M',
            r + r0 * x0,
            r + r0 * y0,
            'L',
            r + r * x0,
            r + r * y0,
            'A',
            r,
            r,
            0,
            largeArc,
            1,
            r + r * x1,
            r + r * y1,
            'L',
            r + r0 * x1,
            r + r0 * y1,
            'A',
            r0,
            r0,
            0,
            largeArc,
            0,
            r + r0 * x0,
            r + r0 * y0,
            `" fill="${color}" />`
        ].join(' ');
    }
}

// Add legend
function color_by_legend(colors) {
    for (let item of colors) {
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
}

//Add continous number legend
function color_by_legend_number(minPassingRent, maxPassingRent, numSteps) {
    // Create legend items
    const stepSize = (maxPassingRent - minPassingRent) / numSteps; // Calculate step size
    passing_rate_colors = []

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

        rgb_cololor = `rgb(255, 255, ${255 - (i * (255 / numSteps))})`
        colorBox.style.backgroundColor = rgb_cololor; // Calculate color based on step
        legendItem.appendChild(colorBox);

        // Create a label.
        let label = document.createTextNode(passingRent.toFixed(2)); // Round to 2 decimal places
        legendItem.appendChild(label);

        // Add the legend item to the legend.
        //notice that before it was: "colourLegendDiv.appendChild(legendItem);"
        colourlegend.appendChild(legendItem);

        //convert rgb(_,_,_) to hex
        hex_color = rgbToHex(rgb_cololor)

        //populate passing_rate_colors object:
        passing_rate_colors.push({ value: passingRent, color: hex_color })
    }
}

function create_default_pie_charts_on_high_zoom_level(centroid_points) {
    map.addSource('centroid_polygon', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: centroid_points
        },
        cluster: true,
        clusterMaxZoom: 15, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });
    
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'centroid_polygon',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://maplibre.org/maplibre-style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                5,
                '#f1f075',
                10,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });
    
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'centroid_polygon',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': [ "Source Sans Pro Regular" ],
            'text-size': 12
        }
    });
    
    map.addLayer({
        id: 'unclustered-point-default',
        type: 'circle',
        source: 'centroid_polygon',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        },
        maxzoom : 15 //don't show this layer when zoom level is < 15
    });
    
    // inspect a cluster on click
    map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await map.getSource('centroid_polygon').getClusterExpansionZoom(clusterId);
        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom
        });
    });
    
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
}

function rgbToHex(color) {
    // Check if the color is in the correct format
    const regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/; 
    //fuck regex 
    //me and my homies hate regex
    const match = color.match(regex);
    
    if (!match) {
        throw new Error("Invalid RGB color format");
    }
    
    // Parse the RGB values
    const red = parseInt(match[1]);
    const green = parseInt(match[2]);
    const blue = parseInt(match[3]);
    
    // Convert to hexadecimal format
    const hex = ((red << 16) | (green << 8) | blue).toString(16).padStart(6, '0');
    
    return '#' + hex;
}

function addLayerToMap(id, type, source, color, opacity, width,layout={}) {
    map.addLayer({
        'id': id,
        'type': type,
        'source': source,
        'layout': layout,
        'paint': {
            [`${type}-color`]: color,
            [`${type}-opacity`]: opacity,
            [`${type}-width`]: width
        }
    });
}
// Object will be a dictionary.
//This is something to deal with later. But useful refractor.
function addPolygonLayers(map, id, object, index) {
    map.addSource(id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [object.coordinates]
            }
        }
    });
    // Add a new layer with the unique ID.
    addLayerToMap(id, 'line', id, '#46E', 0.0, 3);

    map.addLayer({
        'id': 'label_' + index,
        'type': 'symbol',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': getCentroid(object.coordinates)
                }
            }
        },
        'layout': {
            "text-font": ["Source Sans Pro Regular"],
            'text-field': tenant_name,
            'text-size': 13,
            'text-rotate': object.rotateFlag * 90 - object.largestTheta,
            'text-max-width': 7,
            'symbol-placement': 'point',
            'text-allow-overlap': false
        },
        'paint': {
            'text-color': '#000'
        }
    });
}
// should take in a coordinate array
// of a rectangle  and get the pixel width of that rectangle????
function calculatePixelWidth(feature=map.getSource('interior_text_100032071986')._data.properties.rect_coordinates) {
    let rectangle = feature;
    let sw = map.project(rectangle[0]); // southwest corner
    let ne = map.project(rectangle[1]); // northeast corner

    let pixelWidth = Math.abs(ne.x - sw.x);

    console.log('Pixel width:', pixelWidth);
    return pixelWidth;
}

function calculateTextWidth(text= 'TAMMY THE VILLAGE BARBERS', fontSize= 13, fontFamily = 'Source Sans Pro Regular') {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = `${fontSize}px ${fontFamily}`; // Set the font size and family

    let sum = 0;
    for (let i = 0; i < text.length; i++) {
        let metrics = context.measureText(text[i]);
        sum += metrics.width;
        console.log('Character:', text[i], 'Width:', metrics.width, 'Sum:', sum);
    }
    // stop using the same ID
    if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
    return sum;
}

function getLongestSide(rectangle) {
    // Assume rectangle is an array of points: [[x1, y1], [x2, y2], [x3, y3], [x4, y4], [x1, y1]]
    let sides = [
        {coords: [rectangle[0], rectangle[1]], length: turf.distance(rectangle[0], rectangle[1])},
        {coords: [rectangle[1], rectangle[2]], length: turf.distance(rectangle[1], rectangle[2])},
    ];

    let longestSide = sides.reduce((prev, current) => (prev.length > current.length) ? prev : current);

    return longestSide.coords;
}

function calculateRectanglePixels(rectangle){
    let rectLeft = map.project(rectangle[0]); // Left side
    let rectRight = map.project(rectangle[1]); //Right side
    return Math.abs(rectLeft.x - rectRight.x);
}
// Allows for calculation of fonts without needing to rerender the map.
function calculateExtremeFontSizes(object_id='interior_text_100032071986') {
    // Map zoom levels
    let maxZoom = map.getMaxZoom();
    let minZoom = map.getMinZoom();
    //Get coordinates of longest side of textbox
    let rectCoordinates = getLongestSide(map.getSource(object_id)._data.properties.rect_coordinates);
    //Project these into pixels
    let rectLeft = map.project(rectCoordinates[0]); // Left side
    let rectRight = map.project(rectCoordinates[1]); //Right side
    //Calculate the pixel width
    let currentPixelWidth =  Math.abs(rectLeft.x - rectRight.x);
    // Pixel width = currentPixelWidth/(2^(currentZoom - targetZoom))
    let minPixelWidth = currentPixelWidth/(Math.pow(2,map.getZoom()-minZoom));
    let maxPixelWidth = currentPixelWidth/(Math.pow(2,map.getZoom()-maxZoom));
    // Get the length of the tennant name string
    let fontScale = map.getSource(object_id)._data.properties.organisation_name.length;
    //Returns the minimum and maximum font sizes
    return [minPixelWidth/fontScale,maxPixelWidth/fontScale];

}

function adjustFontSize(object_id, fontFamily = 'Source Sans Pro Regular') {
    let fontSize = 1; // start from 1
    let textWidth;
    let text = map.getSource(object_id)._data.properties.organisation_name;
    // gotta rotate the object to
    let maxWidth = calculatePixelWidth(rotateCoordinates([map.getSource(object_id)._data.properties.rect_coordinates], -map.getSource(object_id)._data.properties.rotation_angle))
    // let testwidth = calculatePixelWidth(map.getSource(object_id)._data.properties.rect_coordinates)
    // console.log('Max width', maxWidth,'testwidth',testwidth)
    do {
        fontSize++; // increase the font size
        textWidth = calculateTextWidth(text, fontSize, fontFamily);
    } while (textWidth <= maxWidth);

    return fontSize - 1; // subtract 1 because the loop overshot by 1
}
//Get a circular bounding box based off a map centre. It isn't actually circular.
function getCircleBoundingBox(center, radiusInDegrees) {
    let Circlebbox = [
        center.lng - radiusInDegrees,
        center.lat - radiusInDegrees,
        center.lng + radiusInDegrees,
        center.lat + radiusInDegrees
    ].join(',');
    return Circlebbox;
}

//highlights features with box defined by coords. Initially the 'circular' box.
async function getFeaturesHighlighted(filterValue, color,bbox = getCircleBoundingBox(map.getCenter(), 200 / 1000 / 111.325)) {
    let offset = 0;
    let allFeatures = [];
    let limit = 100;
    let filter = `oslandusetiera eq '${filterValue}'`;

    while (true) {
        let url = `${baseUrl}?filter=${encodeURIComponent(filter)}&bbox=${bbox}&key=${key}&limit=${limit}&offset=${offset}`;
        // Fetch the features.
        const response = await fetch(url);
        const data = await response.json();
        console.log(url);
        allFeatures.push(...data.features);

        // If the number of features in the response is less than the limit, we've reached the last page.
        if (data.features.length < limit) {
            break;
        }
        // Otherwise, increment the offset by the limit to fetch the next page of results.
        offset += limit;
    }
    // Add a new layer with all fetched features.
    map.addLayer({
        "id": `highlighted-buildings-${filterValue}`,
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": allFeatures
            }
        },
        "layout": {},
        "paint": {
            "fill-color": color,
            "fill-opacity": 0.3 //CHANGE TO 0.8 WHEN NOT TESTING
        }
    });
}

function put_tenant_labels () {
    tenant_labels.forEach((feature) => {
        // Unique ID
      let id = 'uprn_' + feature.uprn;
      let rect_id = 'interior_text_' + feature.uprn;
      console.log(rect_id,typeof(rect_id))

      //  These are strings.
       feature['Interior Rectangle'] = JSON.parse(feature['Interior Rectangle']);
       feature.coordinates = JSON.parse(feature.coordinates);
       console.log(feature);
       map.addSource(id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [feature.coordinates]
            }
        }
    });
    map.addSource(rect_id, {
      'type': 'geojson',
      'data': {
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': getCentroid(feature['Interior Rectangle'])
          },
          'properties': {
              'rect_coordinates': feature['Interior Rectangle'],
              'rotation_angle': feature['Rotation Angle'],
              'rotation_flag': feature['Rotation Flag'],
              'organisation_name': feature.organisation_name
          }
      }
  });
    // Add a new layer with the unique ID. Will need to write it a bit better.
    // addLayerToMap( id, 'line', id, '#46E', 1, 3);
    map.addLayer({
      'id': id,
      'type': 'line',
      'source': id, // Use the ID of the source
      "minzoom": 16,
      'paint': {
          'line-color': '#46E',
          'line-opacity': 1,
          'line-width': 3
      }
  });
    // let interpolateFonts = calculateExtremeFontSizes(rect_id);
    map.addLayer({
      'id': rect_id + '_layer',
      'type': 'symbol',
      'source': rect_id, // Use the ID of the source
      "minzoom": 16, //Don't show obvs
      'layout': {
          "text-font": ["Source Sans Pro Regular"],
          'text-field': feature.organisation_name,
          'text-size': ['interpolate', ['linear'], ['zoom'],16, 2, 19, 13],
        //   'text-size': 13,
          // 'text-size': adjustFontSize(rect_id),
          'text-rotate': feature['Rotation Flag'] * 90 + feature['Rotation Angle'] - 90,
          'text-max-width': 6, //

          'symbol-placement': 'point',
      },
      'paint': {
          'text-color': '#000'
      }
  });
    // Add a new layer with the unique ID. Will need to write it a bit better.
    // addLayerToMap( id, 'line', id, '#46E', 0.0, 3);
      
      })

  // Initialize Sources!
  map.addSource('inscribed_rectangles_testing', {
      type: 'geojson',
      data: {
          type: 'FeatureCollection',
          features: []
      }
  });
// Helper function
  addLayerToMap('testing', 'line', 'inscribed_rectangles_testing', '#6ae', 1, 3);
    const rectangles = [
      {   "dmse_ref": '17000891',
          
          "largestArea": 61.67,
          "finalcoords": [
              [-1.1636758060587908, 52.575850730932316],
              [-1.163694142519489, 52.575928233953675],
              [-1.163630793948073, 52.57593376906523],
              [-1.1636124574856694, 52.575856266048795],
              [-1.1636758060587908, 52.575850730932316]
          ],
          "largestTheta": 8.18181818181818,
          "rotateFlag": 1
      },
      { "dmse_ref": '17000894',
        
          "largestArea": 189.01,
          "finalcoords": [
              [-1.163904183079353, 52.57583207974244],
              [-1.1639508322033407, 52.57602925218124],
              [-1.1638745169727827, 52.576035920249986],
              [-1.1638278678435654, 52.57583874782633],
              [-1.163904183079353, 52.57583207974244]
          ],
          "largestTheta": 8.18181818181818,
          "rotateFlag": 1
      },
      {   "dmse_ref": '17000895',
          "largestArea": 210.77,
          "finalcoords": [
              [-1.1637658, 52.5759678],
              [-1.1637658, 52.5760289],
              [-1.1634855, 52.5760289],
              [-1.1634855, 52.5759678],
              [-1.1637658, 52.5759678]
          ],
          "largestTheta": 0,
          "rotateFlag": 0
      },
      {   "dmse_ref": '17000896',
          "largestArea": 174.86,
          "finalcoords": [
              [-1.1637866, 52.5760306],
              [-1.1637866, 52.5760779],
              [-1.1634862, 52.5760779],
              [-1.1634862, 52.5760306],
              [-1.1637866, 52.5760306]
          ],
          "largestTheta": 0,
          "rotateFlag": 0
      }
  ];
  rectangles.forEach((rectangle, index) => {
    let id = 'rectangle_' + index;
  // Find tenant names.
      // Get the data from the 'blaby_leaseholds' source
  let data = map.getSource('blaby_leaseholds')._data;
  let feature = data.features.find(feature => feature.properties.id === rectangle.dmse_ref);
  let tenant_name = feature ? feature.properties.tenant_name : 'No tenant';

    // Add a new source with the unique ID
    map.addSource(id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [rectangle.finalcoords]
            }
        }
    });
    
    // Add a new layer with the unique ID. Will need to write it a bit better.
    addLayerToMap( id + '1', 'line', id, '#46E', 1, 3);
    map.addLayer({
      'id': 'label_' + index,
      'type': 'symbol',
      "minzoom": 16,
      'source': {
          'type': 'geojson',
          'data': {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': getCentroid(rectangle.finalcoords)
              }
          }
      },
      'layout': {
          "text-font": [ "Source Sans Pro Regular" ],
          'text-field': tenant_name.toUpperCase(),
          'text-size': 13,
          'text-rotate': rectangle.rotateFlag*90-rectangle.largestTheta ,
          'text-max-width': 7, // Measured in ems. 1em = font size in pixels
          'symbol-placement': 'point',
          // 'text-anchor': 'left', // Right-align the text (its weird because of geometry...).
          'text-allow-overlap': false
          // 'text-offset': [-1, 0] // Move the text 1em to the left.
      },
      'paint': {
          'text-color': '#000'
      }
  }); //No error handling lol
})
}
// Queries databricks to get all the building features outlined in the mpa veiw
function getSpatialFeatures(){

    const bounds = map.getBounds();
    const bbox = [
      bounds.getSouthWest().lng, // min longitude
      bounds.getSouthWest().lat, // min latitude
      bounds.getNorthEast().lng, // max longitude
      bounds.getNorthEast().lat  // max latitude
  ];
    fetch('/intersecting-geometries', {
      method: 'POST', // Specify the method
      headers: {
          'Content-Type': 'application/json', // Set the content type
      },
      body: JSON.stringify({
          'query' : Json.stringify(formatSpatialQuery()),
          'bounds': bbox
      }),
  })
        .then(response => response.json())
        .then(data => {
            // Handle the data here
            console.log(data);
  
            // Add an empty data source
            map.addSource('databricksSpatialFeatures', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': []
                }
            });
  
    // Create an array to hold the features
    let features = [];
  
    // Iterate through the data and create a feature for each item
    for (let i = 0; i < data.length; i++) {
        features.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': data[i].polygon.coordinates
            }
        });
    }
  
  // Set the data in the source
  map.getSource('databricksSpatialFeatures').setData({
      'type': 'FeatureCollection',
      'features': features
  });
  
            // Add a new layer to the map with the GeoJSON data
            map.addLayer({
                'id': 'spatialBuildingLine',
                'type': 'line',
                'source': 'databricksSpatialFeatures',
                'layout': {},
                'paint': {
                    'line-color': '#088',
                    'line-opacity': 0.8,
                    'line-width': 3
                }
            });
  
            map.moveLayer('spatialBuildingLine');
  
  
        
        })
        .catch(error => {
            // Handle the error here
            console.error('Error:', error);
        });
}
// bbox gives southwest and north east coords
function bboxToRectangle(southWest, northEast) {
    const northWest = { lng: southWest.lng, lat: northEast.lat };
    const southEast = { lng: northEast.lng, lat: southWest.lat };
    return {
        southWest,
        northWest,
        northEast,
        southEast
    };
}
// Helper Function to take osGridReferences and format them into a string which will form a request body.
function formatSpatialQuery(){
    // Gets first two letters of grid ref from bbox coords
    let osGridReferences = window.convertGridRef();
    const schema = 'main.achudasama';
    // 
    let subQueries = osGridReferences.map(item => `(SELECT * FROM ${schema}.${item}_all)`);
    // Unions the tables together for querying
    let query = subQueries.join(' UNION ALL ');

    return query;
}


// the user should start typing in the input field and the dropdown would be giving them support to autofill their query
// when the user clicks enter, the filter should be executed on the data.
function dropdown_asset_manager (){

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

  var asset_manager_array = asset.map(obj => obj.distinct_asset_manager);

  /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
  autocomplete(document.getElementById("myInput"), asset_manager_array);
}


//////
// a.onclick = function() {
//     map.setFilter('blaby_leaseholds', ['==', ['string', ['get', 'dmse_surveyor']], item.dmse_surveyor]);
// }
async function updateMapStyle(value){
    // Don't overwrite users
    let fillLayers = map.getStyle().layers.filter(layer => {
        return layer.type === 'fill'
        && layer.id !== "blaby_leaseholds";
    });
    // User defined layers to be saved
    var savedColors = fillLayers.map(item => ({id: item.id, color: item.paint["fill-color"] }));
    // Button name
    if (value === "Standard") {
        console.log("Standard")
        // start painting bro
        savedColors.forEach(savedColor => {
            let itemToUpdate = fillLayers.find(item => item.id === savedColor.id);
            if (itemToUpdate) {
                map.setPaintProperty(itemToUpdate.id, 'fill-color', savedColor.color);
            }
        });
    } else if (value === "GOAD") {
        console.log("GOAD")
        fillLayers.forEach(layer => {
            map.setPaintProperty(layer.id, 'fill-color', '#ffffff');
        });
        map.setPaintProperty('OS/TopographicArea_1/Building/1', 'fill-color', 'rgb(255,255,205)');
    }
}

