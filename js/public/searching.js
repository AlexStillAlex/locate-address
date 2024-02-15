
// Querying the OS Places API
var form = document.getElementById("the-form");
form.addEventListener('submit', lookUpAddressesOld);

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
