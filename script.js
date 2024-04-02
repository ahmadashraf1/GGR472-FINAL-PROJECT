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
                'Pool', '#2e3ac1',
                'Shelter Services', '#640b89',
                'Library', '#00c1bd',
                'Community Centre', '#CA6F1E',
                '#2E4053'], // all other values 
            //using match to give each of the identified facilities a different color
            'circle-stroke-color': 'hsl(60, 68%, 57%)',
            //gold rim to points
            'circle-stroke-width': 0.5
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

    // Assume global scope for heatjson to be accessible inside the event listener
    var heatjson;

    // Fetch GeoJSON from URL and store response
    fetch('https://raw.githubusercontent.com/ahmadashraf1/GGR472-FINAL-PROJECT/main/HeatReliefNetwork.geojson')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Check response in console
            heatjson = data; // Store geojson as variable
        });

    document.getElementById('buffcheck').addEventListener('change', (e) => {
        // Check if the map already has the source and layer
        const sourceExists = map.getSource('buffgeojson');
        const layerExists = map.getLayer('inputpointbuff');

        // If the source or layer doesn't exist, create them
        if (!sourceExists || !layerExists) {
            // Create empty feature collection for buffers only if it doesn't exist
            let buffresult = {
                "type": "FeatureCollection",
                "features": []
            };

            // Assuming heatjson is loaded and contains features
            if (heatjson && heatjson.features) {
                // Loop through each point in the GeoJSON and create buffers
                heatjson.features.forEach((feature) => {
                    let buffer = turf.buffer(feature, 1, { units: 'kilometers' });
                    buffresult.features.push(buffer);
                });
            }

            // Add or define the source only if it doesn't exist
            if (!sourceExists) {
                map.addSource('buffgeojson', {
                    "type": "geojson",
                    "data": buffresult
                });
            }

            // Add or define the layer only if it doesn't exist
            if (!layerExists) {
                map.addLayer({
                    "id": "inputpointbuff",
                    "type": "fill",
                    "source": "buffgeojson",
                    "paint": {
                        'fill-color': [
                            'match',
                            ['get', 'NewLocation'],
                            'Pool', '#2e3ac1',
                            'Shelter Services', '#640b89',
                            'Library', '#00c1bd',
                            'Community Centre', '#CA6F1E',
                            '#2E4053'],
                        'fill-opacity': 0.3,
                        'fill-outline-color': "black"
                    }
                });
            }
        }

        // Toggle visibility based on the checkbox's state
        map.setLayoutProperty(
            'inputpointbuff',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    // Adding pop up for heat relief center points showing what type of facility it is
    map.on('click', 'center-points', (e) => {
        //event listener for clicking on point
       const coordinates = e.features[0].geometry.coordinates.slice();
       // Retrieves properties
       const properties = e.features[0].properties;
       // Generating text including multiple properties
       let display = '<h6>Location Details</h6>';
       display += '<strong>Name:</strong> ' + properties.locationName + '<br>';
       display += '<strong>Address:</strong> ' + properties.address + '<br>';

       new mapboxgl.Popup()
           // Creating the popup display
           .setLngLat(coordinates)
           // Makes the popup appear at the point features coordinates
           .setHTML(display)
           // Retrieves the display property which has been set above
           .addTo(map);
       // Adds popup to map
   });
    
})
