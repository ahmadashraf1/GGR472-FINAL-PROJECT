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
        data: 'https://raw.githubusercontent.com/ahmadashraf1/GGR472-FINAL-PROJECT/main/github_LST_neighb_TO_3Y_2019.geojson',
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
                'Pool', '#1b79d1',
                'Shelter Services', '#795cbf',
                'Library', '#e3a92b',
                'Community Centre', '#1659cc',
                '#5c99b5'], // all other values 
            //using match to give each of the identified facilities a different color
            'circle-stroke-color': 'hsl(60, 68%, 57%)',
            //gold rim to points
            'circle-stroke-width': 0.5
        }
    })
    
    map.addLayer({
        //temp polygons 
        'id': 'temp-polygon',
        'type': 'fill',
        'source': 'temp-data',
        'paint': {
            'fill-color': [
                'step', // STEP expression produces stepped results based on value pairs
                ['get', 'mean_lst_3'], // 
                '#a64dff', // Colour assigned to any values < first step
                27.0, '#fee5d9',// Colours assigned to values >= each step
                28.0, '#fcbba1',
                29.0, '#fc9272',
                30.0, '#fb6a4a',
                31.0, '#de2d26', //30.90 and higher
                32.0, '#a50f15',
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': 'black'
        }

    });

    //Using Checked box to add and remove layers
    //For Park Polygon
    document.getElementById('parkcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'park-polygon',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });
    //For Points
    document.getElementById('pointcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'center-points',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });
    //For Temp
    document.getElementById('tempcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'temp-polygon',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

})
