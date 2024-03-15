// map.on('load', function() {

//     let selectedColor = '#FF0000'; // Default color
    
//     //creating map layer source
//     map.addSource('polygons_source', {
//         type: 'geojson',
//         data: {
//             type: 'FeatureCollection',
//             features: [
//                     {
//                     type: 'Feature',
//                     geometry:{
//                         // 1. coordinates need to be defined in counter-clockwise manner
//                         // 2. Ex: if we have a square, we need five vertices. The first and last vertices should be the same to close the shape.
//                         //coordinates: [[[-2.1532236565527683,52.5063335864931], [-2.153254434773885,52.50566874667055], [-2.151899919221705,52.50563854328536], [-2.151865074538591,52.50629811633283]]],
//                         type: 'Polygon',
//                         // coordinates: [[[-2.1532152046974034, 52.50633250508869], [-2.151864423728739, 52.506298625952155], [-2.151901862702516, 52.50563595605098], [-2.153253558042593, 52.50566508719194]]]
//                         // coordinates: [[[-2.1532152046974034, 52.50633250508869], [-2.153253558042593, 52.50566508719194], [-2.151901862702516, 52.50563595605098], [-2.151864423728739, 52.506298625952155]],]
//                         coordinates: [[[-2.1532152046974034, 52.50633250508869], [-2.153253558042593, 52.50566508719194], [-2.151901862702516, 52.50563595605098], [-2.151864423728739, 52.506298625952155], [-2.1532152046974034, 52.50633250508869]]]
//                         // coordinates: [[[-2.151901862702516, 52.50563595605098], [-2.153253558042593, 52.50566508719194], [-2.1532152046974034, 52.50633250508869], [-2.151864423728739, 52.506298625952155]]]
                        


//                         },
//                     properties: {
//                         id: 'polygon1',
//                         'color': selectedColor
//                     }
//                     },
//                     {
//                     type: 'Feature',
//                     geometry:{
//                         type: 'Polygon',
//                         coordinates: [[[-2.1510565181931725, 52.50620701261818], [-2.1490346751018023, 52.50615862397359], [-2.1490652092176106, 52.50562188198029], [-2.151084392519465,52.505666874589195]]]
//                     },
//                     properties: {
//                         id: 'polygon2',
//                         'color': selectedColor
//                     }
//                     },
//                     {
//                     type: 'Feature',
//                     geometry:{
//                         type: 'Polygon',
//                         coordinates: [[[-2.1526988806593863, 52.50534309835808], [-2.151823074245158, 52.50532642797512], [-2.151819050939139,52.50535255000247], [-2.1517895466395203,52.50535255000247], [-2.15178418222456,52.50532561164934], [-2.151739925775246,52.50532561164934], [-2.1517727657882233,52.50474758108922], [-2.1527174499589137,52.50476878477593]]]
//                     },
//                     properties: {
//                         id: 'polygon3',
//                         'color': selectedColor
//                     }
//                     },
//                     {
//                     type: 'Feature',
//                     geometry:{
//                         type: 'Polygon',
//                         coordinates: [[[-2.151329713147561,52.505362024248996], [-2.1511070898015987,52.50535631005715], [-2.151093725891883, 52.50549292097685], [-2.150875125858306,52.505488023110615], [-2.150912194192415,52.504857820701346], [-2.1513695922064926,52.504864376039166]]]
//                     },
//                     properties: {
//                         id: 'polygon4',
//                         'color': selectedColor
//                     }
//                     },
//                     {
//                     type: 'Feature',
//                     geometry:{
//                         type: 'Polygon',
//                         coordinates: [[[-2.1513106969457567,52.5045788205006], [-2.1511538356297706,52.50457550291088], [-2.1511457890011343,52.50461305397019], [-2.1509607165845637,52.504608972329294], [-2.1509851383834757,52.50417849930432], [-2.1513311433564013,52.50418584631217]]]
//                     },
//                     properties: {
//                         id: 'polygon5',
//                         'color': selectedColor
//                     }
//                     },
//                     {
//                     type: 'Feature',
//                     geometry:{
//                         type: 'Polygon',
                        
//                         coordinates: [[[-2.1503634935821765, 52.506516360380914], [-2.1510353869398386,52.506533502503146], [-2.1510099337394877,52.50707908754555], [-2.150339381485537,52.50706357819931]]]
//                     },
//                     properties: {
//                         id: 'polygon6',
//                         'color': selectedColor
//                     }
//                     }      
//             ]
//         }
//     })

//     //creating map layer
//     map.addLayer({
//         id: 'polygons',
//         type: 'fill',
//         source: 'polygons_source',
//         'paint': {
//             'fill-color': ['get', 'color'],
//             'fill-opacity': 0.7
//           }
//     });
  
// });



    // blaby_leasehold_polygons.forEach(function(polygon) {
    //     var center = getCenterOfPolygon(polygon.geometry.coordinates);
    //     var label = document.createElement('div');
    //     label.className = 'map-label';
    //     label.textContent = polygon.tenantName;
  
    //     new maplibregl.Marker(label)
    //       .setLngLat(center)
    //       .addTo(map);
    //   });
    // });
  
    // function getCenterOfPolygon(coordinates) {
    //   var bounds = coordinates[0].reduce(function(bounds, coord) {
    //     return bounds.extend(coord);
    //   }, new maplibregl.LngLatBounds(coordinates[0][0], coordinates[0][0]));
  
    //   return bounds.getCenter();
    // }




  // //lease_tenant_table
  // //select dmse_ref, tnnt_name from main.intermediate.int_leas_table_decoded
  //   let query_lease_tenant_table = 'select leas_dmse_ref as dmse_ref, tnnt_trade_name as tenant_name, leas_passing_rent from main.offies.lease_table left join main.intermediate.int_tenant_table_decoded on tnnt_ref = leas_tnnt_ref'
  //   fetch('/run-query', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       query: query_lease_tenant_table // Send the user's input as a JSON'd query
  //     })
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     console.log(data);
  //     lease_tenant_table = data;
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error);
  //   });

  // //dmse_table
  // //select dmse_ref, dmse_desc, dmse_prop_ref, dmse_grop_name, dmse_status_desc, dmse_type_desc from main.intermediate.int_demise_table_decoded
  // let query_dmse_table = 'select dmse_ref, dmse_desc, dmse_prop_ref, dmse_grop_name, dmse_status_desc, dmse_type_desc from main.intermediate.int_demise_table_decoded'
  //   fetch('/run-query', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       query: query_dmse_table // Send the user's input as a JSON'd query
  //     })
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     console.log(data);
  //     dmse_table = data;
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error);
  //   });

  // //EPC table
  // //select depc_dmse_ref, depc_rating_letter from main.intermediate.int_epc_demise_table
  // let query_EPC_table = 'select depc_dmse_ref, depc_rating_letter from main.intermediate.int_epc_demise_table'
  //   fetch('/run-query', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       query: query_EPC_table // Send the user's input as a JSON'd query
  //     })
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     console.log(data);
  //     epc_table = data;
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error);
  //   });


// app.post('/run-query', async (req, res) => {
//   const query = req.body.query; // Extract the query from the request body
//   client.connect({
//     token: token,
//     host: server_hostname,
//     path: http_path
//   }).then(async client => {
//     const session = await client.openSession();
  
//     const queryOperation = await session.executeStatement(
//       query, // Use the query from the request body
//       { runAsync: true }
//     );
  
//     await queryOperation.waitUntilReady();
//     const result = await queryOperation.fetchAll();
//     console.log(result);
//     await queryOperation.close();
//     res.json(result); // Send the result back to the client
      
//     await session.close();
//     client.close();
//   }).catch(error => {
//     console.log(error);
//     res.status(500).json({ message: 'An error occurred' });
//   });
// });

    // //add dmse_status from tenant dmse_table. 
    // blaby_leasehold_polygons.forEach(feature => {
    //     const reference = feature.properties.id.toString();
    //     const demise = dmse_table.find(item => item.dmse_ref === reference);
    //     if (demise == undefined){
    //         console.log(`The demise reference ${reference} taken from the polygon is not in dmse_table`)
    //         feature.properties.dmse_status = undefined;
    //     }
    //     else {
    //             feature.properties.dmse_status = demise.dmse_status_desc;
    //     }
    // });

    //add epc_letter from epc_table. 
    // blaby_leasehold_polygons.forEach(feature => {
    //     const reference = feature.properties.id.toString();
    //     const demise = epc_table.find(item => item.depc_dmse_ref === reference);
    //     if (demise == undefined){
    //         console.log(`The demise reference ${reference} taken from the polygon is not in epc_table`)
    //         feature.properties.epc_rating_letter = undefined;
    //     }
    //     else {
    //         feature.properties.epc_rating_letter = demise.depc_rating_letter;
    //     }
    // });


                        // {"epc_A":["+",["case",["==",["string",["get","epc_rating_letter"]],"A"],1,0]],
            // "epc_B":["+",["case",["==",["string",["get","epc_rating_letter"]],"B"],1,0]],
            // "epc_C":["+",["case",["==",["string",["get","epc_rating_letter"]],"C"],1,0]],
            // "epc_D":["+",["case",["==",["string",["get","epc_rating_letter"]],"D"],1,0]],
            // "epc_E":["+",["case",["==",["string",["get","epc_rating_letter"]],"E"],1,0]],
            // "epc_F":["+",["case",["==",["string",["get","epc_rating_letter"]],"F"],1,0]],
            // "epc_G":["+",["case",["==",["string",["get","epc_rating_letter"]],"G"],1,0]],
            // "epc_Null":["+",["case",["==",["string",["get","epc_rating_letter"]],"_NA"],1,0]]
        // }
            // "epc_Null": ['+', ['case', ['!', ['has', 'epc_rating_letter']], 1, 0]]

        // {"epc_A":["+",["case",["==",["string",["get","epc_rating_letter"]],"A"],1,0]],
        // "epc_B":["+",["case",["==",["string",["get","epc_rating_letter"]],"B"],1,0]],
        // "epc_C":["+",["case",["==",["string",["get","epc_rating_letter"]],"C"],1,0]],
        // "epc_D":["+",["case",["==",["string",["get","epc_rating_letter"]],"D"],1,0]],
        // "epc_E":["+",["case",["==",["string",["get","epc_rating_letter"]],"E"],1,0]],
        // "epc_F":["+",["case",["==",["string",["get","epc_rating_letter"]],"F"],1,0]],
        // "epc_G":["+",["case",["==",["string",["get","epc_rating_letter"]],"G"],1,0]],
        // "epc_No EPC Available":["+",["case",["==",["string",["get","epc_rating_letter"]],"No EPC Available"],1,0]]}

                // const counts = [
        //     props["epc_A"],
        //     props["epc_B"],
        //     props["epc_C"],
        //     props["epc_D"],
        //     props["epc_E"],
        //     props["epc_F"],
        //     props["epc_G"],
        //     props["epc_NA"]
        // ];



                    // map.setClusterProperties('unclustered-point', clusterProperties)
            // map.setData('unclustered-point', {
            //     type: 'FeatureCollection',
            //     features: centroid_points
            // })
            // // map.setSourceLayer('unclustered-point', 'epc_cluster_source');
            // map.setFilter('unclustered-point', ['!', ['has', 'point_count']]);
            // map.setPaintProperty('unclustered-point', {
            //     'circle-color': colorExpression,
            //     'circle-radius': 12,
            //     'circle-stroke-width': 1,
            //     'circle-stroke-color': '#fff'
            // })

        // map.setLayoutProperty('unclustered-point-epc', 'visibility', 'visible');


// //let's remove any pie chart clusters that might be there from previous selection:
// map.addLayer({
//     id: 'unclustered-point',
//     type: 'circle',
//     source: {
//         'type': 'geojson',
//         'data': {
//             'type': 'FeatureCollection',
//             'features': [],
//         'cluster': true,
//         'clusterRadius': 80,
//         }
//     },
// });

    // //hide pie-chart layers
    // if (map.getLayer('unclustered-point-epc')) {
    //     // Hide the layer if it exists
    //     map.setLayoutProperty('unclustered-point-epc', 'visibility', 'none');
    // }


    // function create_pie_charts (feature_points, color_categories, feature_property_categories, colorExpression) {
        // map.addLayer({
        //     id: 'unclustered-point',
        //     type: 'circle',
        //     source: 'unclustered-point',
        //     filter: ['!', ['has', 'point_count']],
        //     paint: {
                    // 'circle-color': colorExpression,
        //         'circle-radius': 12,
        //         'circle-stroke-width': 1,
        //         'circle-stroke-color': '#fff'
        //     },
        //     maxzoom : 15 //don't show this layer when zoom level is < 15
        // });

    // Adding the tenant names
    // map.addLayer({
    //     'id': 'tenant-names',
    //     'type': 'symbol',
    //     'source': 'blaby_leaseholds',
    //     'layout': {
    //     // 'text-font' must be one that is from OS data fonts. More info about which fonts we can use: https://github.com/openmaptiles/fonts
    //       "text-font": [ "Source Sans Pro Regular" ], //Testing here!
    //       'text-field': ['get', 'tenant_name'],
    //       'text-size': 12,
    //       'text-rotate': getRotation(['get', 'coordinates']),
    //     //   'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
    //     //   'text-radial-offset': 0.5,
    //       'text-justify': 'center'
    //     },
    //     'paint': {
    //       'text-color': '#000'
    //     }
    //   });

      //should I make a fetch request here?


        // map.addLayer({
        //     'id': 'tenant-names',
        //     'type': 'symbol',
        //     'source': 'blaby_leaseholds', 
        //     'layout': {
        //     // 'text-font' must be one that is from OS data fonts. More info about which fonts we can use: https://github.com/openmaptiles/fonts
        //       "text-font": [ "Source Sans Pro Regular" ], //Testing here!
        //       'text-field': ['get', 'tenant_name'],
        //       'text-size': 12,
        //       'text-rotate': getRotation(['get', 'coordinates']),
        //     //   'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
        //     //   'text-radial-offset': 0.5,
        //       'text-justify': 'center'
        //     },
        //     'paint': {
        //       'text-color': '#000'
        //     }
        // });

           // Extract query from the request body
    // const queries = {
    //   query_lease_tenant_table : req.body.query_lease_tenant_table,
    //   query_dmse_table : req.body.query_dmse_table,
    //   query_EPC_table : req.body.query_EPC_table,
    //   query_distinct_asset_manager : req.body.query_distinct_asset_manager
    // }

    // check that all the queries are well recieved by the server
    // console.log(queries)


      //endpoint for "Filter By" section. When the client server loads it will ping this endpoint to populate the dropdown of each "Filter By"
//when the client server loads it will ping this rendpoint to populate the dropdown with our property references.
//   app.get('/dropdown-data', async (req, res) => {
//     const query = `select prop_ref,prop_latitude,prop_longitude,sum(dmse_area) as prop_area
//     from main.offies.property_table 
//     left join main.intermediate.int_demise_table_decoded 
//     on dmse_prop_ref = prop_ref
//     where dmse_area is not null
//     group by 1,2,3 order by prop_ref`; // Yikes!
//     client.connect({
//         token: token,
//         host: server_hostname,
//         path: http_path
//     }).then(async client => {
//         const session = await client.openSession();
    
//         const queryOperation = await session.executeStatement(
//             query,
//             { runAsync: true }
//         );
    
//         await queryOperation.waitUntilReady();
//         const result = await queryOperation.fetchAll();
//         // console.log(result);
//         await queryOperation.close();
//         res.json(result); // Send the result back to the client
//     }).catch(error => {
//         console.log(error);
//         res.status(500).send(error);
//     });
// });

  // window.onload = function() { //When the server loads ping a request to the backend to populate the dropdown with property references.
  // fetch('/dropdown-data')
  //     .then(response => response.json())
  //     .then(data => {
  //         populateDropdown(data);
  //         console.log(data)
  //     });
    // }


 // <button id="testButton" class = "big-red-button">Test Query</button> 
  //         <input type="text" id="queryInput" placeholder="Write a correct SQL query" value = 'select count(*) from main.intermediate.int_unit_table_decoded'></input>
  //Get the Databricks query on Client side
//   document.getElementById('testButton').addEventListener('click', function() {
//     const query = document.getElementById('queryInput').value;
//     fetch('/run-query', {
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
//   });


        // lease_tenant_table = data.lease_tenant_table;
        // dmse_table = data.dmse_table;
        // epc_table = data.epc_table;
        // distinct_asset_manager = data.distinct_asset_manager;
        // dropdown_data = data.dropdown_data












        // console.log("GOAD")
            
            // map_layers = map.style._layers

            // layer_array.forEach(layer => {
            //     map.removeLayer(layer.id);
            // });
            
            // source_array.forEach(source => {
            //     map.removeSource(source.id);
            // });

            // console.log("layers removed")

            // map.removeLayer('blaby_leaseholds')
            // map.removeSource('blaby_leaseholds')
            
           
            // removeAllLayers().then(map.setStyle("goadstyle.json")).then(goadMapTest())



            // fetch("goadstyle.json")
            //     .then(response => {
            //         if (!response.ok) {
            //             throw new Error('Network response was not ok');
            //         }
            //         return response.json(); // Parse JSON from the response
            //     })
            //     .then(data => {
            //         // Modify the data as needed
                    
                    // Example: Log the modified data
                    // goad_json = data;
            //         console.log(goad_json);


                    
            //         layers_array.forEach(function(layer){
            //             map.addSource('blaby_leaseholds', {
            //                 type: 'geojson',
            //                 data: {
            //                     type: 'FeatureCollection',
            //                     features: layer
            //                 }
            //             });
        
            //             //creating leasehold layer
            //             map.addLayer({
            //                 id: 'blaby_leaseholds',
            //                 type: 'fill',
            //                 source: 'blaby_leaseholds',
            //                 'paint': {
            //                     'fill-color': ['get', 'color'],
            //                     'fill-opacity': 0.7
            //                 }
            //             });
            //             the_layer = map.getLayer("blaby_leaseholds")         
            //         })
            //     })
                
            // map.setStyle("goadstyle.json")
            // //Name of Layer with buildings (OS/TopographicArea_1/Building/1)
            
            // // map.addLayer("blaby_leaseholds")
            // // Function to remove all layers from the map
            

            // map.setStyle("https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_27700_Dark.json")

            

            // customStyleJson = 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_27700_Dark.json';
            // map.setStyle(customStyleJson)
            // layer_array.forEach(function(newLayer){
            //     customStyleJson.layers.push(newLayer);
            // })
            
            // customStyleJson.layers.push(newLayer);

            // layer_array.forEach(function(newLayer){
            //     map.style._layers.push(newLayer);
            // })

            // map.style.layers = map_layers

            // source_array.forEach(source => {
            //     map.addSource(source);
            // });
            
            // layer_array.forEach(layer => {
            //     map.addLayer(layer);
            // });

             // layers_array.forEach(function(layer){
            //     map.removeLayer(layer.id);
            //     console.log("one")
            //     map.removeSource(layer.id);
            // })

            // map.setStyle("goadstyle.json")

            // layers_array.forEach(function(layer){
            //     // map.addSource(layer.id, layer.source);
            //     console.log("two")
            //     map.addLayer(layer);
     
            // })




          //   //solution 2: add our added layers to style.JSON
          //   // Function to load JSON file asynchronously using fetch API
          //   function loadJSON(callback) {
          //     fetch('goadstyle.json')
          //         .then(response => response.json())
          //         .then(json => callback(json))
          //         .catch(error => console.error('Error loading JSON:', error));
          // }

          // loadJSON(function(json) {
          //     console.log(json); // This will log the JSON data to the console

          //     layers_array.forEach(layer => {
          //         // json.sources.push(layer);
          //         json.layers.push(layer);
          //     })
              
          //     console.log(json)
          //     // console.log(json.layers.blaby_polygons.source)

          //     map.setStyle(json)
          // });