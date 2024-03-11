
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
//  const customStyleJson = 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/master/OS_VTS_3857_Road.json';
    const customStyleJson = 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_27700_Dark.json';
    const style2 = 'https://api.os.uk/maps/vector/v1/vts/resources/styles?key=' + apikey;  

// Initialise the map object.
const style = {
    "version": 8,
    "glyphs": "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf", //These are the available fonts
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
    // wolverhampton 
    center: [-1.16369788103475,52.575980079451796],
    // center: [ -2.158607182943474, 52.504686972808571 ],
    zoom: 17,
    transformRequest: url => { //Does something weird to the API call when sending the key. If in doubt check url by logging to conosle.
        if(! /[?&]key=/.test(url) ) url += '?key=' + apikey
        return {
            url: url + '&srs=3857'
            // console.log(url)
        }
    }
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



// Function to get features of the clicked point


////////////////////////////////////////////////////////////////////////////////////////////////////////



//   //best commit:
//   console.log(`All you need is
//   ⢀⡴⠑⡄⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
//   ⠸⡇⠀⠿⡀⠀⠀⠀⣀⡴⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠑⢄⣠⠾⠁⣀⣄⡈⠙⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⢀⡀⠁⠀⠀⠈⠙⠛⠂⠈⣿⣿⣿⣿⣿⠿⡿⢿⣆⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⢀⡾⣁⣀⠀⠴⠂⠙⣗⡀⠀⢻⣿⣿⠭⢤⣴⣦⣤⣹⠀⠀⠀⢀⢴⣶⣆ 
//   ⠀⠀⢀⣾⣿⣿⣿⣷⣮⣽⣾⣿⣥⣴⣿⣿⡿⢂⠔⢚⡿⢿⣿⣦⣴⣾⠁⠸⣼⡿ 
//   ⠀⢀⡞⠁⠙⠻⠿⠟⠉⠀⠛⢹⣿⣿⣿⣿⣿⣌⢤⣼⣿⣾⣿⡟⠉⠀⠀⠀⠀⠀ 
//   ⠀⣾⣷⣶⠇⠀⠀⣤⣄⣀⡀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
//   ⠀⠉⠈⠉⠀⠀⢦⡈⢻⣿⣿⣿⣶⣶⣶⣶⣤⣽⡹⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠀⠀⠀⠉⠲⣽⡻⢿⣿⣿⣿⣿⣿⣿⣷⣜⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣷⣶⣮⣭⣽⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠀⠀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
//   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⠿⠿⠿⠛⠉`)
