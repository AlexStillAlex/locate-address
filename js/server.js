require('dotenv').config({ path: 'js/.env' });; //Environment variables
console.log(process.env); // Check the environment variables
//This shit deals with all the backend
//Like actual backend. All the other Js files are static pages that are interacted with by users client side.
//Imports
// const LatLon = require('geodesy');
// console.log(LatLon)

// const wgs84 = new LatLon(52.2, 0.12);
// const gridref = wgs84.toOsGrid();
// console.log(gridref.toString()); // 'TL 44982 57869'

const express = require('express');//The server
const bodyParser = require('body-parser'); //Read my post requests
const path = require('path'); //find my static files
const { DBSQLClient } = require('@databricks/sql'); //databricks connect; we want to only import DBSQLClient and not other functions/classes from '@databricks/sql' module. Thus, object destructring syntax.
const { spawn } = require('child_process'); //to run a python script
const request = require('request'); //Allows us to get scripts externally
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
// A way to get urls that are blocked by CORS
app.get('/proxy', (req, res) => {
  const url = req.query.url
  if (!url) {
    res.status(400).send('Missing URL parameter');
    return;
  }
  req.pipe(request(url)).pipe(res);
});

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
  const bbox = turf.bboxPolygon(req.body.bounds);
  // Defines some tables we will be using
  // const query = req.body.query;
  const query = `SELECT * FROM main.achudasama.blaby_staging_topographic_area WHERE descriptiveGroup like '%uildin%'`;

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

//endpoint for "Filter By" section. When the client server loads it will ping this endpoint to populate the dropdown of each "Filter By"
//when the client server loads it will ping this rendpoint to populate the dropdown with our property references.
  app.get('/dropdown-data', async (req, res) => {
    const query = `select prop_ref,prop_latitude,prop_longitude,sum(dmse_area) as prop_area
    from main.offies.property_table 
    left join main.intermediate.int_demise_table_decoded 
    on dmse_prop_ref = prop_ref
    where dmse_area is not null
    group by 1,2,3 order by prop_ref`; // Yikes!
    client.connect({
        token: token,
        host: server_hostname,
        path: http_path
    }).then(async client => {
        const session = await client.openSession();
    
        const queryOperation = await session.executeStatement(
            query,
            { runAsync: true }
        );
    
        await queryOperation.waitUntilReady();
        const result = await queryOperation.fetchAll();
        // console.log(result);
        await queryOperation.close();
        res.json(result); // Send the result back to the client
    }).catch(error => {
        console.log(error);
        res.status(500).send(error);
    });
});




// runs the 'static' pages. I.e. the HTML and scripts that only depend on the client.
app.use(express.static('js/public/'));
app.use('/', express.static('js/views'));
//puts a link in the console for me to copy
app.listen(3001, () => { //Changing this TEMPORARILY so I don't crash Mark's server
    console.log('Server running on http://localhost:3001');
  });

  