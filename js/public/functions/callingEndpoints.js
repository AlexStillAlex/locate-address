// BACKEND INTERACTIONS
document.addEventListener("DOMContentLoaded", (event) => {
  // map.on('load', function() {
  // window.onload = function() { //When the server loads ping a request to the backend to populate the dropdown with property references.
  fetch('/dropdown-data')
      .then(response => response.json())
      .then(data => {
        // console.log(data); // log data on server
          populateDropdown(data);
          console.log(data)
      });
    // }

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
          'dropdown_data': 'select prop_ref,prop_latitude,prop_longitude,sum(dmse_area) as prop_area from main.offies.property_table left join main.intermediate.int_demise_table_decoded on dmse_prop_ref = prop_ref where dmse_area is not null group by 1,2,3 order by prop_ref'
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
        goadMapTest().then(() => {
            populateDropdown_asset_managers(distinct_asset_manager);
      
        })
      
        fetch('/run-general-query', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({'query': 'select * from main.achudasama.exterior_names_testing'})
          })
          .then(response => response.json()) // Parse the response as JSON
          .then(data => {
            // polygon_data = data;
            data.forEach((feature) => {
              // Unique ID
            let id = 'uprn_' + feature.uprn;
            let rect_id = 'interior_text_' + feature.uprn;
            console.log(rect_id,typeof(rect_id))

            //  These are strings.
             feature['Interior Rectangle'] = JSON.parse(feature['Interior Rectangle']);
             feature.coordinates = JSON.parse(feature.coordinates);
             console.log(feature);
             map.addSource(id, {
              'type': 'geojson',
              'data': {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'Polygon',
                      'coordinates': [feature.coordinates]
                  }
              }
          });
          map.addSource(rect_id, {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': getCentroid(feature['Interior Rectangle'])
                },
                'properties': {
                    'rect_coordinates': feature['Interior Rectangle'],
                    'rotation_angle': feature['Rotation Angle'],
                    'rotation_flag': feature['Rotation Flag'],
                    'organisation_name': feature.organisation_name
                }
            }
        });
          // Add a new layer with the unique ID. Will need to write it a bit better.
          addLayerToMap( id, 'line', id, '#46E', 1, 3);
          let interpolateFonts = calculateExtremeFontSizes(rect_id);
          map.addLayer({
            'id': rect_id + '_layer',
            'type': 'symbol',
            'source': rect_id, // Use the ID of the source
            'layout': {
                "text-font": ["Source Sans Pro Regular"],
                'text-field': feature.organisation_name,
                // 'text-size': ['interpolate', ['linear'], ['zoom'], map.getMinZoom(), interpolateFonts[0], map.getMaxZoom(), interpolateFonts[1]],
                'text-size': 13,
                // 'text-size': adjustFontSize(rect_id),
                'text-rotate': feature['Rotation Flag'] * 90 + feature['Rotation Angle'] - 90,
                'text-max-width': 4, //
                'symbol-placement': 'point',
            },
            'paint': {
                'text-color': '#000'
            }
        });
          // Add a new layer with the unique ID. Will need to write it a bit better.
          // addLayerToMap( id, 'line', id, '#46E', 0.0, 3);
            
            })
          })
          .catch(error => {
              console.error('Error:', error); // Log any errors
          });
        // Initialize Sources!
        map.addSource('inscribed_rectangles_testing', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });
      // Helper function
        addLayerToMap('testing', 'line', 'inscribed_rectangles_testing', '#6ae', 1, 3);
          const rectangles = [
            {   "dmse_ref": '17000891',
                
                "largestArea": 61.67,
                "finalcoords": [
                    [-1.1636758060587908, 52.575850730932316],
                    [-1.163694142519489, 52.575928233953675],
                    [-1.163630793948073, 52.57593376906523],
                    [-1.1636124574856694, 52.575856266048795],
                    [-1.1636758060587908, 52.575850730932316]
                ],
                "largestTheta": 8.18181818181818,
                "rotateFlag": 1
            },
            { "dmse_ref": '17000894',
              
                "largestArea": 189.01,
                "finalcoords": [
                    [-1.163904183079353, 52.57583207974244],
                    [-1.1639508322033407, 52.57602925218124],
                    [-1.1638745169727827, 52.576035920249986],
                    [-1.1638278678435654, 52.57583874782633],
                    [-1.163904183079353, 52.57583207974244]
                ],
                "largestTheta": 8.18181818181818,
                "rotateFlag": 1
            },
            {   "dmse_ref": '17000895',
                "largestArea": 210.77,
                "finalcoords": [
                    [-1.1637658, 52.5759678],
                    [-1.1637658, 52.5760289],
                    [-1.1634855, 52.5760289],
                    [-1.1634855, 52.5759678],
                    [-1.1637658, 52.5759678]
                ],
                "largestTheta": 0,
                "rotateFlag": 0
            },
            {   "dmse_ref": '17000896',
                "largestArea": 174.86,
                "finalcoords": [
                    [-1.1637866, 52.5760306],
                    [-1.1637866, 52.5760779],
                    [-1.1634862, 52.5760779],
                    [-1.1634862, 52.5760306],
                    [-1.1637866, 52.5760306]
                ],
                "largestTheta": 0,
                "rotateFlag": 0
            }
        ];
        rectangles.forEach((rectangle, index) => {
          let id = 'rectangle_' + index;
        // Find tenant names.
            // Get the data from the 'blaby_leaseholds' source
        let data = map.getSource('blaby_leaseholds')._data;
        let feature = data.features.find(feature => feature.properties.id === rectangle.dmse_ref);
        let tenant_name = feature ? feature.properties.tenant_name : 'No tenant';

          // Add a new source with the unique ID
          map.addSource(id, {
              'type': 'geojson',
              'data': {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'Polygon',
                      'coordinates': [rectangle.finalcoords]
                  }
              }
          });
          
          // Add a new layer with the unique ID. Will need to write it a bit better.
          addLayerToMap( id, 'line', id, '#46E', 0.0, 3);
          map.addLayer({
            'id': 'label_' + index,
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': getCentroid(rectangle.finalcoords)
                    }
                }
            },
            'layout': {
                "text-font": [ "Source Sans Pro Regular" ],
                'text-field': tenant_name,
                'text-size': 13,
                'text-rotate': rectangle.rotateFlag*90-rectangle.largestTheta ,
                // 'text-max-width': 7, // Adjust this value as needed
                'symbol-placement': 'point',
                // 'text-anchor': 'left', // Right-align the text (its weird because of geometry...).
                'text-allow-overlap': false
                // 'text-offset': [-1, 0] // Move the text 1em to the left.
            },
            'paint': {
                'text-color': '#000'
            }
        }); //No error handling lol
      })
  });
  
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
  });
  