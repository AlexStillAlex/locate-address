// BACKEND INTERACTIONS

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
////////////////////////////////////////////////////////////////////////////////////////////////////////


//Get the Databricks query on Client side
document.getElementById('testButton').addEventListener('click', function() {
    const query = document.getElementById('queryInput').value;
    fetch('/run-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query // Send the user's input as a JSON'd query
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

