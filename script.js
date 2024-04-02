mapboxgl.accessToken = 'pk.eyJ1IjoibmF0a2VjIiwiYSI6ImNscjZudnpsdjJhcm8ya21jMXJuY29iYWwifQ.KonIboWryT9OOwjzC-0GTg';
//access token for my mapbox style
const map = new mapboxgl.Map({
    container: 'my-map',
    // map container ID
    style: 'mapbox://styles/mapbox/light-v11', //  mapbox://styles/mapbox/standard
    //my style URL
    center: [-79.3832, 43.6992],
    // starting position (Toronto) [lng, lat] 
    zoom: 10.1,
    // starting zoom, Toronto fits onto screen 
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Add full-screen control to the map.
map.addControl(new mapboxgl.FullscreenControl());

map.on('load', () => {
    // Adding data
    map.addSource('park-data', {
        //adding green space geojson file
        type: 'geojson',
        data: 'https://natalikec.github.io/Lab_3/Data_Lab3/green_spaces.geojson',
    });

    map.addSource('heatrelief', {
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
        'source': 'heatrelief',
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
        //temp polygons NOT WORKING
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
    })

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


    //Buffers
    // Fetch GeoJSON from URL and store response
    fetch('https://raw.githubusercontent.com/ahmadashraf1/GGR472-FINAL-PROJECT/main/HeatReliefNetwork.geojson')
        .then(response => response.json())
        .then(response => {
            console.log(response); //Check response in console
            heatjson = response; // Store geojson as variable using URL from fetch response
        });

    document.getElementById('buffbutton').addEventListener('click', () => {

        // Create empty feature collection for buffers
        let buffresult = {
            "type": "FeatureCollection",
            "features": []
        };

        // Loop through each point in the GeoJSON and create buffers
        heatjson.features.forEach((feature) => {

            // 1. Create variable for buffer and use turf.buffer function
            let buffer = turf.buffer(feature, 1, { units: 'kilometers' }); // Adjust buffer distance and units as needed

            // 2. Use features.push to add the buffer feature to the empty feature collection
            buffresult.features.push(buffer);

        });

        // Use addSource mapbox method with buffer GeoJSON variable (buffresult) as data source
        map.addSource('buffgeojson', {
            "type": "geojson",
            "data": buffresult // Use buffer GeoJSON variable as data source
        });

        // Show buffers on map using styling
        map.addLayer({
            "id": "inputpointbuff",
            "type": "fill",
            "source": "buffgeojson",
            "paint": {
                'fill-color': "blue",
                'fill-opacity': 0.5,
                'fill-outline-color': "black"
            }
        });

        // Optionally disable the button after click
        document.getElementById('buffbutton').disabled = true;
    });
})
