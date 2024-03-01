map.on('load', function() {
    //used for seeing the coordinates of where the mouse goes
    map.on('click', (e) => {
    document.getElementById('info').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        `${
            // e.lngLat is the longitude, latitude geographical position of the event
            JSON.stringify(e.lngLat.wrap())}`;
    });

    // Change the cursor to a pointer when hovering over a polygon
    map.on('mousemove', 'blaby_leaseholds', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to the default when it leaves
    map.on('mouseleave', 'blaby_leaseholds', function() {
        map.getCanvas().style.cursor = '';
        
    });
    

     // Change color of clicked polygon
    map.on('click', 'blaby_leaseholds', function (e) {
        let clickedPolygon = e.features[0];
        let newColor = document.getElementById('colorPicker').value;
        clickedPolygon.properties.color = newColor;
        let id_of_clicked_polygon = clickedPolygon.properties.id;
        // this logs the ID of clicked polygon. This way, one can look at console to see what is the id of the polygon they clicked on
        console.log(id_of_clicked_polygon)

        //setData() will set data attribute within the source. source = {type: 'geojson', data: {}}
        map.getSource('blaby_leaseholds').setData({
            type: 'FeatureCollection',
            //note that we are accessing '_data' property rather than 'data'. If you look at what is inside a source, you would notice it is '_data', rather than 'data'. Random decision by MapLibre.\
            //we can use '.map' method, because 'features' is an array of features. So, for each feature in this array, we are changing the colour to new colour if that polygon was pressed on.
            features: map.getSource('blaby_leaseholds')._data.features.map(feature => {
                if (feature.properties.id === id_of_clicked_polygon) {
                // Update the color property of the desired polygon
                feature.properties.color = newColor;
                }
                return feature;
            })
            });
    
        //Update the map layer with the modified data
        map.setPaintProperty('blaby_leaseholds', 'fill-color', ['get', 'color']);
    });
});