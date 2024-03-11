class callEndpoint {
    constructor(endpoint, method, headers,body) {
        this.endpoint = endpoint;
        this.method = method;
        this.headers = headers;
        this.body = body;
    }
    // let obj = new callEndpoint('https://api.os.uk/features/v1/wfs', 'POST', {etc} obj.fetchdata.then(data => console.log(data))
    async fetchData() {
        let options = {
            method: this.method,
            headers: this.headers,
        };
    
        if (this.method.toUpperCase() !== 'GET' && this.method.toUpperCase() !== 'HEAD') {
            options.body = JSON.stringify(this.body);
        }
    
        const response = await fetch(this.endpoint, options);
        const data = await response.json();
        console.log(data);
        return data;
    }

}
// 
class MapLayer {
    constructor(map, id, type, sourceId, data, paint) {
        this.map = map;
        this.id = id;
        this.type = type;
        this.sourceId = sourceId;
        this.data = data;
        this.paint = paint;
    }
    // Add empty source with an ID
    addSource() {
        this.map.addSource(this.sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: this.data
            }
        });
    }
    //  Add the layer
    addLayer() {
        this.map.addLayer({
            'id': this.id,
            'type': this.type,
            'source': this.sourceId,
            'layout': {},
            'paint': this.paint
        });
    }
    // Then add it to the map.
    addToMap() {
        this.addSource();
        this.addLayer();
    }
}