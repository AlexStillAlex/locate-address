// BACKEND INTERACTIONS
document.addEventListener("DOMContentLoaded", (event) => {
      //making queries to databricks
      fetch('/run-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'lease_tenant_table': 'select leas_dmse_ref as dmse_ref, tnnt_trade_name as tenant_name, leas_passing_rent from main.offies.lease_table left join main.intermediate.int_tenant_table_decoded on tnnt_ref = leas_tnnt_ref',
          'dmse_table': 'select dmse_ref, dmse_desc, dmse_prop_ref, dmse_grop_name, dmse_status_desc, dmse_type_desc, dmse_surveyor from main.intermediate.int_demise_table_decoded',
          'epc_table': 'select depc_dmse_ref, depc_rating_letter from main.intermediate.int_epc_demise_table',
          // populating asset_manager dropdown
          'distinct_asset_manager' : 'select distinct(dmse_surveyor) from main.intermediate.int_demise_table_decoded where dmse_surveyor is not null',
          'dropdown_data': 'select prop_ref,prop_latitude,prop_longitude,sum(dmse_area) as prop_area from main.offies.property_table left join main.intermediate.int_demise_table_decoded on dmse_prop_ref = prop_ref where dmse_area is not null group by 1,2,3 order by prop_ref',
          // tenant_labels
          'tenant_labels': 'select * from main.achudasama.exterior_names_testing'
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // Global variables
        for (const key in data){
          window[key] = data[key]
        }

        // This is the function in that other file. It just does some highlighting
        goadMapTest().then(() => {
            populateDropdown_asset_managers(distinct_asset_manager);
            populateDropdown(dropdown_data)
        })
    });

//Testing shit
// document.getElementById('testGeometry').addEventListener('click', function() {

  const bounds = map.getBounds();
  const bbox = [
    bounds.getSouthWest().lng, // min longitude
    bounds.getSouthWest().lat, // min latitude
    bounds.getNorthEast().lng, // max longitude
    bounds.getNorthEast().lat  // max latitude
];
  fetch('/intersecting-geometries', {
    method: 'POST', // Specify the method
    headers: {
        'Content-Type': 'application/json', // Set the content type
    },
    body: JSON.stringify({
        // Include the data you want to send here
        'bounds': bbox
    }),
})
      .then(response => response.json())
      .then(data => {
          // Handle the data here
          console.log(data);

          // Add an empty data source
          map.addSource('randompolygonshit', {
              'type': 'geojson',
              'data': {
                  'type': 'FeatureCollection',
                  'features': []
              }
          });

  // Create an array to hold the features
  let features = [];

  // Iterate through the data and create a feature for each item
  for (let i = 0; i < data.length; i++) {
      features.push({
          'type': 'Feature',
          'geometry': {
              'type': 'Polygon',
              'coordinates': data[i].polygon.coordinates
          }
      });
  }

// Set the data in the source
map.getSource('randompolygonshit').setData({
    'type': 'FeatureCollection',
    'features': features
});

          // Add a new layer to the map with the GeoJSON data
          map.addLayer({
              'id': 'fuckyoulayers',
              'type': 'line',
              'source': 'randompolygonshit',
              'layout': {},
              'paint': {
                  'line-color': '#088',
                  'line-opacity': 0.8,
                  'line-width': 3
              }
          });

          map.moveLayer('fuckyoulayers');


      
      })
      .catch(error => {
          // Handle the error here
          console.error('Error:', error);
      });
  });

// });
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Get the Databricks query on Client side
  // document.getElementById('testButton').addEventListener('click', function() {
  //     const query = document.getElementById('queryInput').value;
  //     fetch('/run-general-query', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         query: query // Send the user's input as a JSON'd query
  //       })
  //     })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log(data);
      
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error);
  //     });
    // });
  // });
  