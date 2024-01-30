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