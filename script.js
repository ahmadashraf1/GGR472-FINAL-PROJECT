mapboxgl.accessToken = 'pk.eyJ1IjoibmF0a2VjIiwiYSI6ImNscjZudnpsdjJhcm8ya21jMXJuY29iYWwifQ.KonIboWryT9OOwjzC-0GTg';
//access token for my mapbox style
const map = new mapboxgl.Map({
    container: 'my-map',
    // map container ID
    style: 'mapbox://styles/mapbox/standard',
    //my style URL
    center: [-79.335115, 43.729266],
    // starting position (Toronto) [lng, lat] 
    zoom: 10.5,
    // starting zoom, Toronto fits onto screen 
});


map.on('load', () => {
    // Adding data
    map.addSource('park-data', {
        //adding green space geojson file
        type: 'geojson',
        data: 'https://natalikec.github.io/Lab_3/Data_Lab3/green_spaces.geojson',
    });

    map.addSource('heatrelief-data', {
        //adding heat relief geojson file
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/ahmadashraf1/GGR472-FINAL-PROJECT/main/HeatReliefNetwork.geojson',
    });

    map.addSource('temp-data', {
        //adding temp
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/ahmadashraf1/GGR472-FINAL-PROJECT/tempdata/Mean%20temprature.json',
    });

    //adding layers
    map.addLayer({
        //green space polygons
        'id': 'park-polygon',
        'type': 'fill',
        'source': 'park-data',
        'paint': {
            'fill-color': 'hsl(143, 36%, 37%)',
            //green color
            'fill-opacity': 0.5
        }
    });

    map.addLayer({
        //adding heat relief netowork
        'id': 'center-points',
        'type': 'circle',
        'source': 'heatrelief-data',
        'paint': {
            'circle-radius': 5.5,
            'circle-color': [
                'match',
                ['get', 'NewLocation'],
                'Pool', '#5c99b5',
                'Shelter Services', '#1b79d1',
                'Library', '#1b79d1',
                'Community Centre', '#1b79d1',
                '#3b3b40'], // all other values 
            //using match to give each of the identified facilities a different color
            'circle-stroke-color': 'hsl(60, 68%, 57%)',
            //gold rim to points
            'circle-stroke-width': 0.5
        }
    })
    

    map.addLayer({
        //temp polygons NOT WORKING
        'id': 'temp-polygon',
        'type': 'fill',
        'source': 'temp-data',
        'paint': {
            'fill-color': 'hsl(143, 36%, 37%)',
            //green color
            'fill-opacity': 0.5
        }
    });

})
