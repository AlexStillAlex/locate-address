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
          'blaby_square' : 'select * from main.msivolap.blaby_square',
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
  