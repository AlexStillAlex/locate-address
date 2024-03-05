// BACKEND INTERACTIONS
document.addEventListener("DOMContentLoaded", (event) => {
// window.onload = function() { //When the server loads ping a request to the backend to populate the dropdown with property references.
fetch('/dropdown-data')
    .then(response => response.json())
    .then(data => {
      // console.log(data); // log data on server
        populateDropdown(data);
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
        'query_dmse_table': 'select dmse_ref, dmse_desc, dmse_prop_ref, dmse_grop_name, dmse_status_desc, dmse_type_desc from main.intermediate.int_demise_table_decoded',
        'query_EPC_table': 'select depc_dmse_ref, depc_rating_letter from main.intermediate.int_epc_demise_table'
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // POINT TO CHECK
      lease_tenant_table = data.query_lease_tenant_table;
      dmse_table = data.query_dmse_table;
      epc_table = data.query_EPC_table;

      console.log(lease_tenant_table)
      console.log(dmse_table)
      console.log(epc_table)
      // This is the function in that other file.
      goadMapTest();
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