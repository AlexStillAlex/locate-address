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
      let testcoord = [[[-1.163908171797857,52.575831712757434], [-1.1638277055276376,52.57583823278733], [-1.1638682013073094,52.57603631448853], [-1.1639510871427774,52.576030573234306], [-1.163908171797857,52.575831712757434]]]
      // TESTING
      // add an empty map source
      map.addSource('inscribed_rectangles_testing', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [
            ]
        }
    });  
      let interior_polygon_source = map.getSource('blaby_leaseholds')

      return fetch('/get_rectangle_py', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "coords": testcoord }),  // Pass the coordinates in the request body
        })
      }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }


        return response.json();  // This returns a Promise
    })
    .then(data => {
        //  [(x1,y1),(x2,y2),(x3,y3),(x4,y4)] --> [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
        let rawcoords = JSON.parse(data.data);
        console.log(typeof(rawcoords))
        
        console.log(rawcoords[1])
        let newcoords = rawcoords.map(tuple => Array.from(tuple));
        //Create JSON
        let feature = {
          type: 'Feature',
          geometry: {
              type: 'Polygon',
              coordinates: newcoords
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