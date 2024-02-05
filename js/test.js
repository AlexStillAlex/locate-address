// // const axios = require('axios');

// // Databricks domain, token and notebook path

// // Submit the run
// axios.post(`${databricksDomain}/api/2.0/jobs/runs/submit`, {
//     run_name: 'My Notebook Run',
//     new_cluster: {
//         "cluster_name": "Alex's Cluster",
//         "spark_version": "13.3.x-scala2.12",
//         "spark_conf": {},
//         "aws_attributes": {
//             "first_on_demand": 1,
//             "availability": "SPOT_WITH_FALLBACK",
//             "zone_id": "auto",
//             "spot_bid_price_percent": 100,
//             "ebs_volume_count": 0
//         }},
//     notebook_task: {
//         notebook_path: notebookPath,
//     },
// }, {
//     headers: {
//         'Authorization': `Bearer ${token}`,
//     },
// }).then(response => {
//     // Get the run ID
//     const runId = response.data.run_id;

//     // Poll the get endpoint until the job status is terminated
//     const intervalId = setInterval(() => {
//         axios.get(`${databricksDomain}/api/2.0/jobs/runs/get?run_id=${runId}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//             },
//         }).then(response => {
//             if (response.data.state.life_cycle_state === 'TERMINATED') {
//                 clearInterval(intervalId);

//                 // Get the output of the notebook
//                 axios.get(`${databricksDomain}/api/2.0/jobs/runs/get-output?run_id=${runId}`, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 }).then(response => {
//                     // Log the output of the notebook. This is where I would do stuff with the data.
//                     console.log(response.data);
//                 }).catch(error => {
//                     console.error(error);
//                 });
//             }
//         }).catch(error => {
//             console.error(error);
//         });
//     }, 5000);
// }).catch(error => {
//     console.error(error);
// });

const express = require('express');
const { DBSQLClient } = require('@databricks/sql');

const app = express();

app.get('/databricks', async (req, res) => {
  const databricksDomain = 'https://dbc-73a55ff5-934c.cloud.databricks.com';
  const token = 'dapic2cf91c196a44779c222f3469a47ffd6';
  const notebookPath = '/Users/achudasama@lcpproperties.co.uk/webapptesting';

  const client = new DBSQLClient();

  try {
    await client.connect({
      host: databricksDomain,
      path: notebookPath,
      token: token,
    });

    const session = await client.openSession();

    // Do something with the session...

    res.json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});