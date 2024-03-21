const baseUrl = 'https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items';
const filter = "oslandusetiera eq 'Residential Accommodation'";
const key = 'IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh';
const ostierusageValues = [
    { value: "Residential Accommodation", color: "#157CBD" },
    { value: "Commercial Activity: Industrial Or Manufacturing", color: "#FFC300" },
    { value: "Commercial Activity: Other", color: "#FF5733" },
    { value: "Commercial Activity: Retail", color: "#C70039" },
    { value: "Construction", color: "#900C3F" },
    { value: "Education", color: "#900C3F" },
    { value: "Government Services", color: "#3E061C" },
];
//add a layer for the
map.on('load', function() {
    // Add an empty GeoJSON layer for the box.
    map.addLayer({
        "id": "circle",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": geoJson
        },
        "layout": {},
        "paint": {
            "fill-color": "#f80",
            "fill-opacity": 0.5
        }
    });
});
// Add an item to the legend for each ostierusageValue.
for (let item of ostierusageValues) {
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
    legend.appendChild(legendItem);
}


//variable for the BIGRED HIGHLIGHT BUILDINGS button
let highlightFeaturesButton = document.getElementById('highlightFeatures');

// When button is pressed, highlight buildings with the selected land use.
highlightFeaturesButton.addEventListener('click', async function() {for (let item of ostierusageValues) {
    let layerId = `highlighted-buildings-${item.value}`;
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
        map.removeSource(layerId);
    }
}
// Fetch and highlight new buildings.
for (let item of ostierusageValues) {
    await getFeaturesHighlighted(item.value, item.color);
};
});
