const baseUrl = 'https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items';
const filter = "oslandusetiera eq 'Residential Accommodation'";
const key = 'IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh';
const ostierusageValues = [
    { value: "Residential Accommodation", color: "#000" },
    { value: "Commercial Activity: Industrial Or Manufacturing", color: "#f00" },
    { value: "Commercial Activity: Other", color: "#0f0" },
    { value: "Commercial Activity: Retail", color: "#00f" },
    { value: "Construction", color: "#ff0" },
    { value: "Education", color: "#f0f" },
    { value: "Government Services", color: "#0ff" },
];
// Get the visible map bounds (BBOX).
let bounds = map.getBounds();

//Get a circular bounding box based off a map centre. 
function getCircleBoundingBox(center, radiusInDegrees) {
    let Circlebbox = [
        center.lng - radiusInDegrees,
        center.lat - radiusInDegrees,
        center.lng + radiusInDegrees,
        center.lat + radiusInDegrees
    ].join(',');
    return Circlebbox;
}

async function getFeaturesHighlighted(filterValue, color) {
    let Circlebbox = getCircleBoundingBox(map.getCenter(), 200 / 1000 / 111.325);
    let offset = 0;
    let allFeatures = [];
    let limit = 100;
    let filter = `oslandusetiera eq '${filterValue}'`;

    while (true) {
        let url = `${baseUrl}?filter=${encodeURIComponent(filter)}&bbox=${Circlebbox}&key=${key}&limit=${limit}&offset=${offset}`;

        // Fetch the features.
        const response = await fetch(url);
        const data = await response.json();
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
            "fill-opacity": 0.8
        }
    });
}

// Add event listener which waits for the map to be loaded.
map.on('load', async function() {
    for (let item of ostierusageValues) {
        await getFeaturesHighlighted(item.value, item.color);
    }
});

// Add event listener which waits for the map to be dragged.
map.on('dragend', async function() {
    // Remove the existing highlighted buildings layers if they exist.
    for (let item of ostierusageValues) {
        let layerId = `highlighted-buildings-${item.value}`;
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
            map.removeSource(layerId);
        }
    }

    // Fetch and highlight new buildings.
    for (let item of ostierusageValues) {
        await getFeaturesHighlighted(item.value, item.color);
    }
});