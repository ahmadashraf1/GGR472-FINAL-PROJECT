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

    // ADDING SOURCES

    map.addSource('park-data', {
        //adding green space geojson file
        type: 'geojson',
        data: 'https://ahmadashraf1.github.io/GGR472-FINAL-PROJECT/Data/GreenSpaces.geojson',
    });

    map.addSource('heatrelief', {
        //adding heat relief geojson file
        type: 'geojson',
        data: 'https://ahmadashraf1.github.io/GGR472-FINAL-PROJECT/Data/HeatReliefNetwork.geojson',
    });

    map.addSource('temp-data', {
        //adding temp
        type: 'geojson',
        data: 'https://ahmadashraf1.github.io/GGR472-FINAL-PROJECT/Data/LSTNeighborhood.geojson',
    });


    //ADDING LAYERS

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
            'circle-radius': [
                "interpolate", ["linear"], ["zoom"],
                // zoom is 10 or less -> circle radius 3px
                10, 3,
                // zoom is 13 or more -> circle radius 6px
                13, 7
            ],
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


    //CHECKED BOXES FOR LAYERS

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



//ISOCHRONE

// Initialize a variable to cache the heat relief data
let cachedHeatData = null;

// Function to fetch heat relief network
function fetchHeatData() {
    if (!cachedHeatData) {
        // If the data hasn't been fetched yet, fetch it
        return fetch('https://ahmadashraf1.github.io/GGR472-FINAL-PROJECT/Data/HeatReliefNetwork.geojson')
            .then(response => response.json())
            .then(heatData => {
                cachedHeatData = heatData; // save data to heatData
                // Ensure the heat data source is added to the map
                if (!map.getSource('heat')) {
                    map.addSource('heat', {
                        type: 'geojson',
                        data: heatData
                    });
                }
                return heatData; // Return the fetched data
            })
            .catch(error => console.error('Error fetching heat data:', error)); //catch in cosole if it doesn't work
    } else {
        // If the data has already been fetched, use the cached data
        return Promise.resolve(cachedHeatData);
    }
}

// Fetch the heat relief network data immediately to cache it and add it to the map
fetchHeatData();

// Parameters for Isochrone API request
function fetchIsochroneData(coordinates) {
    const params = {
        contours_minutes: [10], //10 minute walk
        polygons: true,  //return it as a polygon
        access_token: mapboxgl.accessToken
    };
//Getting Isochrone api
    const apiUrl = 'https://api.mapbox.com/isochrone/v1/mapbox/walking/';
    const urlParams = new URLSearchParams(params).toString();
    const url = `${apiUrl}${coordinates[0]},${coordinates[1]}.json?${urlParams}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const isoSourceId = `isochrone-${coordinates.join('-')}`;
            const isoLayerId = `isochrone-layer-${coordinates.join('-')}`;
            if (!map.getSource(isoSourceId)) {
                map.addSource(isoSourceId, {
                    type: 'geojson',
                    data: data
                });
            }
            //Display of isochrone
            if (!map.getLayer(isoLayerId)) {
                map.addLayer({
                    id: isoLayerId,
                    type: 'fill',
                    source: isoSourceId,
                    paint: {
                        'fill-color': '#214273',
                        'fill-opacity': 0.3
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching Isochrone data:', error)); //catch in console if it doesn't work
}

// Toggle visibility of isochrone layers based on checkbox state
document.getElementById('isochroneCheck').addEventListener('change', (event) => {
    const checked = event.target.checked;
    if (checked) {
        // Ensure the cached data is used to display
        if (cachedHeatData) {
            cachedHeatData.features.forEach(feature => {
                const coordinates = feature.geometry.coordinates;
                const isoLayerId = `isochrone-layer-${coordinates.join('-')}`;
                if (map.getLayer(isoLayerId)) {
                    // Set existing layer visibility to visible
                    map.setLayoutProperty(isoLayerId, 'visibility', 'visible');
                } else {
                    // Fetch and create new isochrone data and layer
                    fetchIsochroneData(coordinates);
                }
            });
        } else {
            console.error('Cached heat data is not there.'); //catch error in console
        }
    } else {
        // Hide all isochrone layers when not checked
        const isochroneLayers = map.getStyle().layers
            .filter(layer => layer.id.startsWith('isochrone-layer-'))
            .map(layer => layer.id);
        isochroneLayers.forEach(layerId => {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        });
    }
});

    //POP UPS

    // Adding pop up for heat relief center points showing what type of facility it is
    map.on('click', 'center-points', (e) => {
        //event listener for clicking on point
        const coordinates = e.features[0].geometry.coordinates.slice();
        // Retrieves properties
        const properties = e.features[0].properties;
        // Generating text
        let display = '<strong>Location Details</strong>' + '<br>';
        display += '<strong>Name:</strong> ' + properties.locationName + '<br>';
        display += '<strong>Address:</strong> ' + properties.address + '<br>';

        //Changing mouse to pointer when ver points 
        map.on('mouseenter', 'center-points', () => {
            map.getCanvas().style.cursor = 'pointer'; //changing to pointer

        });
        map.on('mouseleave', 'center-points', () => {
            map.getCanvas().style.cursor = ''; //changing back when not over points

        });

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
