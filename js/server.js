require('dotenv').config({ path: 'js/.env' });; //Environment variables
console.log(process.env); // Check the environment variables
//This shit deals with all the backend
//Like actual backend. All the other Js files are static pages that are interacted with by users client side.
//Imports
const express = require('express');//The server
const bodyParser = require('body-parser'); //Read my post requests
const path = require('path'); //find my static files
const { DBSQLClient } = require('@databricks/sql'); //databricks connect; we want to only import DBSQLClient and not other functions/classes from '@databricks/sql' module. Thus, object destructring syntax.
const { spawn } = require('child_process'); //to run a python script

const wkx = require('wkx'); // Used to parse WKT data i.e. things like POLYGON ((coords))
const turf = require('@turf/turf'); // Used to check for intersections

var token = process.env.DBSQL_TOKEN; //DBT access token will last until 29th/February
var server_hostname = process.env.SERVER_HOSTNAME;
var http_path = process.env.HTTP_PATH;
var HMapikey = process.env.HM_API_KEY; //Land Registry API key

//This is like writing import numpy AS np.
const app = express();
const client = new DBSQLClient();
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json()); //Middleware. Stuff we do before processing the api request. 


// A flag variable to check if we've already got a databricksconnection. 
let dbClient;

// tests if we've connected to databricks so we don't keep on reconnecting/creating over and over.
async function connectToDb() {
  if (!dbClient) {
    dbClient = await client.connect({
      token: token,
      host: server_hostname,
      path: http_path
    });
  }
  return dbClient;
}

//Gets the inscribed rectangle from the python script.
app.post('/get_rectangle_py', (req, res) => {
  // Define the Python script and arguments
  let script = 'js/public/functions/inter_rect2.py'; //make sure this is in the root directory. OR THE SAME as server.js
  let coords = req.body.coords;  // Get coordinates of Polygon

  // Spawn a child process to run the Python script
  let process = spawn('python3', [script, ...coords]);
  let output = '';
  // Capture the output
  process.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`stdout: ${data}`);
  });

  // Error handling
  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  process.on('error', (error) => {
    console.error(`spawn error: ${error}`);
  });

  process.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
        res.send({ status: 'error', exitCode: code });
    } else {
        res.send({ status: 'completed', exitCode: code, data: output });
    }
  });
});
//receives a query from the client, 
// connects to a remote server, executes the query, 
// fetches the results, logs the results to the console,
// and sends the results back to the client.
app.post('/run-query', async (req, res) => {
  //connect to Databricks client
    client.connect({
      token: token,
      host: server_hostname,
      path: http_path
    }).then(async client => {
      
    const queryResults = {};
    
    // Execute each query sequentially
    for (const [queryName, query] of Object.entries(req.body)) {
    const session = await client.openSession();
    const queryOperation = await session.executeStatement(query);
    const result = await queryOperation.fetchAll();
    await queryOperation.close();
    await session.close();

      // Store the query result 
      queryResults[queryName] = result;
    }

    res.json(queryResults); // Send the result back to the client
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: 'An error occurred' });
  });
});

app.post('/run-general-query', async (req, res) => {
  const query = req.body.query; // Extract the query from the request body
  connectToDb().then(async client => {
    const session = await client.openSession();
    const queryOperation = await session.executeStatement(
      query, // Use the query from the request body
      { runAsync: true }
    );
    await queryOperation.waitUntilReady();
    const result = await queryOperation.fetchAll();
    console.log(result);
    await queryOperation.close();
    res.json(result); // Send the result back to the client
    await session.close();
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: 'An error occurred' });
  });
});

app.post('/intersecting-geometries', async (req, res) => {
  // Define the bounding box
  // A general query.
  console.log(req.body.bounds);
  const bbox = turf.bboxPolygon(req.body.bounds);
  // const bbox = turf.bboxPolygon([-1.1641002123868134, 52.57436145749756, -1.1632955496821467, 52.57759864165229]);
  //General appraoch for now itshardcoded
  // const query = req.body.query; 
 // Run the SQL query to get the data
  // const query = `SELECT * FROM main.achudasama.blaby_staging_topographic_area WHERE descriptiveGroup like '%uildin%'`;
  const query = 'select * from main.msivolap.blaby_square';
  connectToDb().then(async client => {
    const session = await client.openSession();
    const queryOperation = await session.executeStatement(
      query, // Use the query from the request body
      { runAsync: true }
    );

    

    await queryOperation.waitUntilReady();
    const data = await queryOperation.fetchAll();

    // Convert all the WKT data to GeoJSON
    const geojsonData = data.map(row => {
      const polygon = wkx.Geometry.parse(row.polygon).toGeoJSON();
      return { ...row, polygon };
    });

    // Filter the GeoJSON data for intersections
    const intersectData = geojsonData.filter(row => {
      const intersects = turf.booleanIntersects(bbox, row.polygon);

      // Log the polygon and whether it intersects with the bounding box
      console.log(`Polygon: ${JSON.stringify(row.polygon)}`);
      console.log(`Intersects: ${intersects}`);

      return intersects; // Return the result of the intersection check
    });

    await queryOperation.close();
    res.json(intersectData); // Send the intersecting data to the client
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: 'An error occurred' });
    })
});

// //endpoint called /get-data for the backend.
// app.get('/get-data', (req, res) => {
//     const url = 'https://use-land-property-data.service.gov.uk/api/v1/datasets/history/ccod';
  
//     fetch(url, {
//         headers: {
//           'Authorization': `${HMapikey}`,
//           'Cache-Control': 'no-cache' // Sometimes the server will load an old response. Have it on when testing.
//          }
//       })
//       .then(response => response.json())
//       .then(data => {
//         console.log(data); // log data on server
//         res.json(data); // send data to client
//       })
//       .catch(error => {
//         console.log(error);
//         res.status(500).json({ message: 'An error occurred' });
//       });
//   });




// runs the 'static' pages. I.e. the HTML and scripts that only depend on the client.
app.use(express.static('js/public/'));
app.use('/', express.static('js/views'));
//puts a link in the console for me to copy
app.listen(3001, () => { //Changing this TEMPORARILY so I don't crash Mark's server
    console.log('Server running on http://localhost:3001');
  });

  