// BACKEND INTERACTIONS
//The sequesce of layer loading:
// map layer -> polygons -> tenant names -> zoomed_out_pie_charts
// So, the sequence of calling endpoints should also be the same.
// dropdown data should be loaded as early as possible.

document.addEventListener("DOMContentLoaded", (event) => {
  // window.onload = function() { //When the server loads ping a request to the backend to populate the dropdown with property references.
  fetch('/dropdown-data')
      .then(response => response.json())
      .then(data => {
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
          'query_lease_tenant_table': 'select leas_dmse_ref as dmse_ref, tnnt_trade_name as tenant_name, leas_passing_rent from main.offies.lease_table left join main.intermediate.int_tenant_table_decoded on tnnt_ref = leas_tnnt_ref',
          'query_dmse_table': 'select dmse_ref, dmse_desc, dmse_prop_ref, dmse_grop_name, dmse_status_desc, dmse_type_desc, dmse_surveyor from main.intermediate.int_demise_table_decoded',
          'query_EPC_table': 'select depc_dmse_ref, depc_rating_letter from main.intermediate.int_epc_demise_table',
          'query_distinct_asset_manager' : 'select distinct(dmse_surveyor) from main.intermediate.int_demise_table_decoded where dmse_surveyor is not null',
          'query_dropdown_data': 'select prop_ref,prop_latitude,prop_longitude,sum(dmse_area) as prop_area from main.offies.property_table left join main.intermediate.int_demise_table_decoded on dmse_prop_ref = prop_ref where dmse_area is not null group by 1,2,3 order by prop_ref'
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
            // Return another fetch request here
            // return fetch('/run-general-query', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({'query': 'select * from main.achudasama.exterior_names_testing'})
            // });
        })
        // .then(response => response.json())
        // .then(data => {
        //   console.log(data);
        //   polygon_data = data;    
      //     // Add the TOID layers
      //     map.addSource('external_polygons', {
      //       'type': 'geojson',
      //       'data': {
      //           'type': 'FeatureCollection',
      //           'features': []
      //       }
      //   });
      //   // Add the inscribed rectangles
      //   map.addSource('internal_rectangles', {
      //     'type': 'geojson',
      //     'data': {
      //         'type': 'FeatureCollection',
      //         'features': []
      //     }
      // });

        //   for (let i = 0; i < data.length; i++) {
        //     console.log(data[i]);

        //     let polygon_feature = {
        //       'type': 'Feature',
        //       'geometry': {
        //           'type': 'Polygon', 
        //           'coordinates': [JSON.parse(data[i].coordinates)]
        //       }
        //   };

        //   let inscribed_rectangle = {
        //     'type': 'Feature',
        //     'geometry': {
        //         'type': 'Polygon', // Or 'Point', 'LineString', etc., depending on your data
        //         'coordinates': JSON.parse(data[i]['Interior Rectangle'])
        //     },    
        //     'properties': {
        //       'uprn': data[i].uprn,
        //       'Rotation Angle': data[i]['Rotation Angle'],
        //       'Rotation Flag': data[i]['Rotation Flag'],
        //       'tenant_name': data[i].organisation_name
        //   }
            
        // };
        // map.getSource('external_polygons')._data.features.push(polygon_feature);
        // map.getSource('internal_rectangles')._data.features.push(inscribed_rectangle);
        
      //   }
        // });
        // console.log(polygon_data);
        let polygon_data;
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
            data.forEach((feature, index) => {
              // Unique ID
            let id = 'uprn_' + data[index].uprn;

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
          // Add a new layer with the unique ID. Will need to write it a bit better.
          addLayerToMap( id, 'line', id, '#46E', 1, 3);

          console.log(getCentroid(feature['Interior Rectangle']))
          map.addLayer({
            'id': 'interior_text' + feature.uprn,
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': getCentroid(feature['Interior Rectangle'])
                    }
                }
            },
            'layout': {
                "text-font": [ "Source Sans Pro Regular" ],
                'text-field': feature.organisation_name,
                'text-size': 13,
                'text-rotate': feature['Rotation Flag']*90+feature['Rotation Angle'] - 90, //Got the rotation flag the wrong way round lol.
                'text-max-width': 7, // Adjust this value as needed
                'symbol-placement': 'point',
                // 'text-anchor': 'left', // Right-align the text (its weird because of geometry...).
                'text-allow-overlap': false
                // 'text-offset': [-1, 0] // Move the text 1em to the left.
            },
            'paint': {
                'text-color': '#FFF'
            }
        });
          // Add a new layer with the unique ID. Will need to write it a bit better.
          // addLayerToMap( id, 'line', id, '#46E', 0.0, 3);
            
            })
          })
          .catch(error => {
              console.error('Error:', error); // Log any errors
          });
          console.log(polygon_data);
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

        // Currently this is the blaby polygons but we can cange that
        // We chain fetch requests like this.
        //the big one. martincacoll
        // let testcoord = [[[-1.1635999511877344,52.57585432418023], [-1.1634841917738186,52.575927864813195], [-1.1634855328784397,52.57602892494674], [-1.1637711881385258,52.576030554947124], [-1.1637658237200412,52.575967799893505], [-1.163615620015662,52.57596616989139], [-1.163615620015662,52.575935199830695],[-1.1636254321734896,52.57593337943709], [-1.1635999511877344,52.57585432418023]]]
        // add an empty map source
       //VM catering coords
        // let testcoord = [[[-1.1636723708311365,52.57585024916335], [-1.1635999511877344,52.57585432418023], [-1.1636254321734896,52.57593337943709], [-1.1636388432186777,52.575936639444876], [-1.1636455487407602,52.575956199484835], [-1.163695169607763,52.57595782948789], [-1.1636723708311365,52.57585024916335]]]
        // for (let feature of map.getSource('blaby_leaseholds')._data.features) {
          // VAPES
        // let testcoord = [[[-1.163908171797857,52.575831712757434], [-1.1638277055276376,52.57583823278733], [-1.1638682013073094,52.57603631448853], [-1.1639510871427774,52.576030573234306], [-1.163908171797857,52.575831712757434]]]
          // COE MARK
          // let testcoord =  [[[-1.1634862041582892,52.576029832545515], [-1.1634862041582892,52.57607791752608], [-1.1637866115681845,52.57607954752464], [-1.1637866115681845,52.57603064754568], [-1.1634862041582892,52.576029832545515]]]
        // console.log(feature.geometry)
          // polygoncoords = feature.geometry.coordinates;
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
                'text-max-width': 7, // Adjust this value as needed
                'symbol-placement': 'point',
                // 'text-anchor': 'left', // Right-align the text (its weird because of geometry...).
                'text-allow-overlap': false
                // 'text-offset': [-1, 0] // Move the text 1em to the left.
            },
            'paint': {
                'text-color': '#000'
            }
        });
          
        });
   
         console.log(rectangles)
        // // Runs a python script to get the AXIS aligned rectangle.
        // let thetaValues = linSpace(-45,45,45) //Lets test if this takes too long.
        // getLargestResult(testcoord, thetaValues)
      .then(largestResult => {
        console.log(1);
  
    })
      .catch(error => console.error(error));
  // } 
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
  });
  /////////////////////////////////////////////////////////////////////