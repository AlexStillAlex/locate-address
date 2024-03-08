// BACKEND INTERACTIONS
document.addEventListener("DOMContentLoaded", (event) => {
// window.onload = function() { //When the server loads ping a request to the backend to populate the dropdown with property references.
fetch('/dropdown-data')
    .then(response => response.json())
    .then(data => {
      // console.log(data); // log data on server
        populateDropdown(data);
        console.log(data)
    });
  // }
    
  //lease_tenant_table
  //select dmse_ref, tnnt_name from main.intermediate.int_leas_table_decoded
    fetch('/run-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'query_lease_tenant_table': 'select leas_dmse_ref as dmse_ref, tnnt_trade_name as tenant_name, leas_passing_rent from main.offies.lease_table left join main.intermediate.int_tenant_table_decoded on tnnt_ref = leas_tnnt_ref',
        'query_dmse_table': 'select dmse_ref, dmse_desc, dmse_prop_ref, dmse_grop_name, dmse_status_desc, dmse_type_desc, dmse_surveyor from main.intermediate.int_demise_table_decoded',
        'query_EPC_table': 'select depc_dmse_ref, depc_rating_letter from main.intermediate.int_epc_demise_table',
        'query_distinct_asset_manager' : 'select distinct(dmse_surveyor) from main.intermediate.int_demise_table_decoded where dmse_surveyor is not null'
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Global variables
      lease_tenant_table = data.query_lease_tenant_table;
      dmse_table = data.query_dmse_table;
      epc_table = data.query_EPC_table;
      distinct_asset_manager = data.query_distinct_asset_manager;

      console.log(lease_tenant_table)
      console.log(dmse_table)
      console.log(epc_table)
      console.log(distinct_asset_manager)

      // This is the function in that other file. It just does some highlighting
      goadMapTest().then(populateDropdown_asset_managers(distinct_asset_manager))

      // Currently this is the blaby polygons but we can cange that
      // We chain fetch requests like this.
      let testcoord = [[[-1.1636723708311365,52.57585024916335], [-1.1635999511877344,52.57585432418023], [-1.1636254321734896,52.57593337943709], [-1.1636388432186777,52.575936639444876], [-1.1636455487407602,52.575956199484835], [-1.163695169607763,52.57595782948789], [-1.1636723708311365,52.57585024916335]]]
      // add an empty map source
      map.addSource('inscribed_rectangles_testing', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [
            ]
        }
    });  
      // Runs a python script to get the AXIS aligned rectangle.
      let epsilon = 1;
      let theta = 0;
      // function getLIR(coords){
      return fetch('/get_rectangle_py', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "coords": testcoord }),  // Pass the coordinates in the request body
        })
      // }
      }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();  // This returns a Promise
    })
    .then(data => {
        //  [(x1,y1),(x2,y2),(x3,y3),(x4,y4)] --> [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
        console.log(data.data);

        let rawcoords = JSON.parse(data.data);
      
        // Used to define axis of rotation for text
        let newcoords = rawcoords.map(tuple => Array.from(tuple));
        // Defines the centre of text placement.
        let centreCoord = getCentroid(newcoords[0])

        //Createa feature that is a point where the text will be added.
        let feature = {
          type: 'Feature',
          geometry: {
              type: 'Point',
              coordinates: centreCoord
          }
      };
    // Get the current data from the source
    let sourceData = map.getSource('inscribed_rectangles_testing')._data;

    // Add the new feature to the features array
    sourceData.features.push(feature);
    // Update the source with the new data
    map.getSource('inscribed_rectangles_testing').setData(sourceData);
    map.addLayer({
          'id': 'test_rectangles',
          'type': 'symbol',
          'source': 'inscribed_rectangles_testing',
          'layout': {
          // 'text-font' must be one that is from OS data fonts. More info about which fonts we can use: https://github.com/openmaptiles/fonts
            "text-font": [ "Source Sans Pro Regular" ], //Testing here!
            'text-field': 'Testing',
            'text-size': 30,
            'text-rotate': getRotation(newcoords),
            'text-justify': 'center'
          },
          'paint': {
            'text-color': '#000'
          }
        });
        // Add a line layer
    map.addLayer({
      'id': 'testing',
      'type': 'line',
      'source': 'inscribed_rectangles_testing',
      'layout': {},
      'paint': {
          'line-color': '#f0f',
          'line-opacity': 1,
          'line-width': 3
      }
  });
})
    
    .catch(error => {
        // Handle the error here
        console.error('There has been a problem with your fetch operation:', error);
    })
  .catch((error) => {
    console.error('Error:', error);
    });
  });

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