// //This JS contains the feature to look up one's mouse coordinates and five polygons in Pensnett created by hand
map.on('load', function() {

    let selectedColor = '#FF0000'; // Default color
    
    const blaby_leasehold_polygons = [
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.163908171797857,52.575831712757434], [-1.1638277055276376,52.57583823278733], [-1.1638682013073094,52.57603631448853], [-1.1639510871427774,52.576030573234306], [-1.163908171797857,52.575831712757434]]]
            },
            properties: {
                id: '17000891',
                address: 'unit 2',
                'color': selectedColor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.1636723708311365,52.57585024916335], [-1.1635999511877344,52.57585432418023], [-1.1636254321734896,52.57593337943709], [-1.1636388432186777,52.575936639444876], [-1.1636455487407602,52.575956199484835], [-1.163695169607763,52.57595782948789], [-1.1636723708311365,52.57585024916335]]]
            },
            properties: {
                id: '17000894',
                address: 'unit 5',
                'color': selectedColor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates: [[[-1.1635999511877344,52.57585432418023], [-1.1634841917738186,52.575927864813195], [-1.1634855328784397,52.57602892494674], [-1.1637711881385258,52.576030554947124], [-1.1637658237200412,52.575967799893505], [-1.163615620015662,52.57596616989139], [-1.163615620015662,52.575935199830695],[-1.1636254321734896,52.57593337943709], [-1.1635999511877344,52.57585432418023]]]
            },
            properties: {
                id: '17000895',
                address: 'unit 6',
                'color': selectedColor
            }
        },
        {
            type: 'Feature',
            geometry:{
                type: 'Polygon',    
                coordinates:  [[[-1.1634862041582892,52.576029832545515], [-1.1634862041582892,52.57607791752608], [-1.1637866115681845,52.57607954752464], [-1.1637866115681845,52.57603064754568], [-1.1634862041582892,52.576029832545515]]]
            },
            properties: {
                id: '17000896',
                address: 'unit 6-7; actually 7',
                'color': selectedColor
            }
        }
    ]

    //add tenant_name attribute to each feature's properties. To do so, look up the tenant name in the databricks tenant table by dmse_reference that is already attached to the feature.
    blaby_leasehold_polygons.forEach(feature => {
        const reference = feature.properties.id.toString();
        const tenant = tenant_table.find(item => item.dmse_ref === reference);
        if (tenant == undefined){
            console.log(`The demise reference ${reference} taken from the polygon is not in tenant_table`)
            feature.properties.tenant_name = undefined;
        }
        else {
                feature.properties.tenant_name = tenant.tenant_name;
        }
    });

    console.log(blaby_leasehold_polygons);


    //creating map layer source
    map.addSource('blaby_leaseholds', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: blaby_leasehold_polygons
        }
    });
    //creating map layer
    map.addLayer({
        id: 'blaby_leaseholds',
        type: 'fill',
        source: 'blaby_leaseholds',
        'paint': {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.7
          }
    });

    map.addSource('blaby_freeholds', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [
                {
                type: 'Feature',
                geometry:{
                    type: 'Polygon',    
                    coordinates:  [[[-1.1640429605042755,52.57579883474423], [-1.1637210954224884,52.5758004647532], [-1.1636084426452271,52.575809429800074], [-1.163462262253688,52.57591864022933], [-1.1634139824923295,52.57627968471252], [-1.1639464009814446,52.57627886971696], [-1.163951765398906,52.57634406930785], [-1.1641073335218834,52.57632532443509], [-1.1640885580591203,52.57602459038611], [-1.1640429605042755,52.57579883474423]]]
                },
                properties: {
                    id: '15000050'
                }
                }
            ]
        }
    });
    //creating map layer
    map.addLayer({
        id: 'blaby_freeholds',
        type: 'line',
        source: 'blaby_freeholds',
        'paint': {
            "line-color": "black",
            "line-opacity": 0.9,
            "line-width": 3
        }
    });

});