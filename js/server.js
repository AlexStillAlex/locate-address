require('dotenv').config({ path: 'js/.env' });; //Environment variables
console.log(process.env); // Check the environment variables
//This shit deals with all the backend
//Like actual backend. All the other Js files are static pages that are interacted with by users client side.
//Imports
const express = require('express');//The server
const bodyParser = require('body-parser'); //Read my post requests
const path = require('path'); //find my static files
const { DBSQLClient } = require('@databricks/sql'); //databricks connect

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

//receives a query from the client, 
// connects to a remote server, executes the query, 
// fetches the results, logs the results to the console,
// and sends the results back to the client.
app.post('/run-query', async (req, res) => {
    const query = req.body.query; // Extract the query from the request body
    client.connect({
      token: token,
      host: server_hostname,
      path: http_path
    }).then(async client => {
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
      client.close();
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: 'An error occurred' });
    });
});

//endpoint called /get-data for the backend.
app.get('/get-data', (req, res) => {
    const url = 'https://use-land-property-data.service.gov.uk/api/v1/datasets/history/ccod';
  
    fetch(url, {
        headers: {
          'Authorization': `${HMapikey}`,
          'Cache-Control': 'no-cache' // Sometimes the server will load an old response. Have it on when testing.
         }
      })
      .then(response => response.json())
      .then(data => {
        console.log(data); // log data on server
        res.json(data); // send data to client
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'An error occurred' });
      });
  });
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
        console.log(result);
        await queryOperation.close();
        res.json(result); // Send the result back to the client
    }).catch(error => {
        console.log(error);
        res.status(500).send(error);
    });
});

app.post('/run-query', async (req, res) => {
    const query = req.body.query; // Extract the query from the request body
    client.connect({
      token: token,
      host: server_hostname,
      path: http_path
    }).then(async client => {
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
      client.close();
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: 'An error occurred' });
    });
});

//endpoint called /wfsproxy for the backend.
app.post('/wfs-proxy', (req, res) => {
    const url = 'https://api.os.uk/features/v1/wfs' //?key=IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh&service=wfs&request=GetFeature&version=2.0.0&typeNames=Topography_TopographicArea'
  console.log(req.body);
  fetch(url, { // Pass the URL as the first argument to fetch
    method: 'POST',
    headers: {
      'Authorization': 'IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: req.body // Pass the request body as the second argument to fetch
  })
  .then(res => res.json())
  .then(data => {
      console.log(data);
  })
  .catch(error => {
      console.log(error);
  });
});

// runs the 'static' pages. I.e. the HTML and scripts that only depend on the client.
app.use(express.static('js/public'));
//puts a link in the console for me to copy
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });