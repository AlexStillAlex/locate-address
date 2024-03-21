import { LatLon } from 'https://cdn.jsdelivr.net/npm/geodesy@2/osgridref.js';

window.getGridRef = function(variable) {
    const wgs84 = new LatLon(52.2, 0.12);
    const gridref = wgs84.toOsGrid();
    console.log(variable);
    console.log(gridref.toString()); // 'TL 44982 57869'
}

// Contains a bunch of logic to convert a mapbounds to easting and northings
// With some formatting.
// This will require a bit of work since the OS map tile IDs don't exactly match up
// And we aren't given a reference point.
// Instead we're using the two letter names to query some tables
// will take a bit longer .
window.convertGridRef = function(){
    // Get map bounds
    const bounds = map.getBounds();
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    // Create rectangle from bounds
    let rectangle = bboxToRectangle(southWest,northEast);
    //Creating a set as we don't care for duplicates
    let gridRefs = new Set();
    // Iterate over the coordinates values in the rectangle object. These are arrays.
    Object.values(rectangle).forEach(coord => {
        // Create a new LatLon object from the coordinates
        console.log(coord)
        const wgs84 = new LatLon(coord.lat, coord.lng);
        const gridref = wgs84.toOsGrid();
        console.log(gridref.toString());
        // Turns grid ref to string, removes spaces, gets first 6 characters
        // SP 56525 97719 --> SP5652
        const shortGridRef = gridref.toString().replace(/\s/g, '').substring(0, 6);
        // console.log(shortGridRef);
        // Extract the first two characters and the last four characters
        let prefix = shortGridRef.substring(0, 2);
        let suffix = shortGridRef.substring(2);

        // Convert the last four characters to a number and round to the nearest 5
        suffix = Math.round(parseInt(suffix) / 5) * 5;
        // Concatenate the result back to the first two characters of the string
        const formattedGridRef = prefix + suffix.toString().padStart(4, '0');
        // Push to set
        
        gridRefs.add(prefix);
    });
    // We like arrays
    return Array.from(gridRefs);
}