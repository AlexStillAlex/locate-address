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