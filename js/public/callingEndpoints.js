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
 

       //Creating a MARQUEE element (funny.)
        var marquee = document.createElement('marquee');
        marquee.className = 'marquee-style'; // Set the class name
        console.log(coordinates)
        let totalArea= turf.area(turf.polygon(coordinates)); //Calculate the total area of the property
        externalArea = totalArea - item.prop_area/10.764;
        console.log(turf.polygon(coordinates));
        marquee.textContent =  `Your external area is: ${externalArea.toFixed(2)} m²`;  // Set the text content
        // Append the marquee to the body of the document
        console.log(totalArea,item.prop_area/10)
        document.body.appendChild(marquee);
            
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

