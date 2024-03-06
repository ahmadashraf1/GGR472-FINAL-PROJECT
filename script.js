mapboxgl.accessToken = 'pk.eyJ1IjoibmF0a2VjIiwiYSI6ImNscjZudnpsdjJhcm8ya21jMXJuY29iYWwifQ.KonIboWryT9OOwjzC-0GTg';
//access token for my mapbox style
const map = new mapboxgl.Map({
    container: 'my-map',
    // map container ID
    style: 'mapbox://styles/natkec/clsjxnbd403qe01qq47879wiq',
    //my style URL
    center: [-79.335115, 43.729266],
    // starting position (Toronto) [lng, lat] 
    zoom: 10.5,
    // starting zoom, Toronto fits onto screen 
});

//Map Controls 
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());
//declaring geocoder variable and seeting search to only Canada 
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//Event listener for returning viewer to original map extent
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.335115, 43.729266],
        zoom: 10.5,
        essential: true
    });
});



// Adding data source from 2 GeoJSON files
map.on('load', () => {
    //after the map has loaded, the below data points will load
    map.addSource('park-data', {
        //adding green space geojson file
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/natalikec/Lab2/main/green_spaces.geojson',
        'generateId': true //Create a unique ID for each feature
    });

    map.addSource('heatrelief-data', {
        //adding heat relief geojson file
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/natalikec/Lab3/main/Data_Lab3/Air%20Conditioned%20and%20Cool%20Spaces%20copy.geojson',
    });

    map.addLayer({
        //adding a layer with the green space polygons
        'id': 'park-polygon',
        //unique id for green space polygons
        'type': 'fill',
        //filling in polygons
        'source': 'park-data',
        //link to data id above
        'paint': {
            'fill-color': 'hsl(143, 36%, 37%)',
            //green color
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.5]
            //Creating an event 
        }
    });

//HOVER EVENT Over Parks Plygons - USING setFeatureState() METHOD

let parkID = null; //Declare initial ID as null

map.on('mousemove', 'park-polygon', (e) => {
    if (e.features.length > 0) { //If there are features in array enter conditional

        if (parkID !== null) { //If parkID is not null, set hover feature state back to false to remove opacity from previous highlighted polygon
            map.setFeatureState(
                { source: 'park-data', id: parkID },
                { hover: false }
            );
        }

        parkID = e.features[0].id; //Update parkID to featureID
        map.setFeatureState(
            { source: 'park-data', id: parkID },
            { hover: true } //Update hover feature state to TRUE to change opacity of layer to 1
        );
    }
});


map.on('mouseleave', 'park-polygon', () => { //If mouse leaves the geojson layer, set all hover states to false and parkID variable back to null
    if (parkID !== null) {
        map.setFeatureState(
            { source: 'park-data', id: parkID },
            { hover: false }
        );
    }
    parkID = null;
});



    map.addLayer({
        //adding a layer with the heat relief netowork
        'id': 'center-points',
        //unique id for heat relief points
        'type': 'circle',
        //points shown as circles
        'source': 'heatrelief-data',
        //linking to data id above
        'paint': {
            'circle-radius': 5.5,
            //size of circles
            'circle-color': [
                'match',
                ['get', 'locationCode'],
                'SPLASHPAD', '#5c99b5',
                'POOL', '#1b79d1',
                'INDOOR POOL', '#1b79d1',
                'OUTDOOR POOL', '#1b79d1',
                'WADING POOL', '#1b79d1',
                //all the pools have the same color and will be placed into the same category
                'LIBRARY', '#e3a92b',
                'COMM_CNTR', '#1659cc',
                'SSHA_SHELTER', '#795cbf',
                '#3b3b40'], // all other values 
            //using match to give each of the identified facilities a different color
            'circle-stroke-color': 'hsl(60, 68%, 57%)',
            //gold rim to points
            'circle-stroke-width': 0.5
            // size of rim

        }
    })
    map.on('load', () => {
        // Add event listener for mouseenter
        map.on('mouseenter', 'center-points', (e) => {
            // Change marker color when mouse enters
            const hoveredFeatureId = e.features[0].id;
            map.setPaintProperty('center-points', 'circle-color', [
                'case',
                ['==', ['id'], hoveredFeatureId], 'red', // Turn hovered marker red
                ['match',
                    ['get', 'locationCode'],
                    'SPLASHPAD', '#5c99b5',
                    'POOL', '#1b79d1',
                    'INDOOR POOL', '#1b79d1',
                    'OUTDOOR POOL', '#1b79d1',
                    'WADING POOL', '#1b79d1',
                    'LIBRARY', '#e3a92b',
                    'COMM_CNTR', '#1659cc',
                    'SSHA_SHELTER', '#795cbf',
                    '#3b3b40'
                ] // Keep other markers as their original colors
            ]);
        });

        // Add event listener for mouseleave
        map.on('mouseleave', 'center-points', () => {
            // Revert marker color when mouse leaves
            map.setPaintProperty('center-points', 'circle-color', [
                'match',
                ['get', 'locationCode'],
                'SPLASHPAD', '#5c99b5',
                'POOL', '#1b79d1',
                'INDOOR POOL', '#1b79d1',
                'OUTDOOR POOL', '#1b79d1',
                'WADING POOL', '#1b79d1',
                'LIBRARY', '#e3a92b',
                'COMM_CNTR', '#1659cc',
                'SSHA_SHELTER', '#795cbf',
                '#3b3b40'
            ]); // Define your color logic here
        });
    });

    //Using Checked box to add and remove layers
    //For Park Polygon
    document.getElementById('polygoncheck').addEventListener('change', (e) => {
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

    // Adding pop up for heat relief center points showing what type of facility it is
    map.on('click', 'center-points', (e) => {
        //event listener for clicking on center-points
        const coordinates = e.features[0].geometry.coordinates.slice();
        //gets the coordinates of the point feature clicked, the slice makes a copy of the coordinates so the original isn't changed
        const location = e.features[0].properties.locationName;
        //gets the locationName property in the geojson, which has attribute information for facility type


        new mapboxgl.Popup()
            //creating the popup display
            .setLngLat(coordinates)
            //makes the popup appear at the point features coordinates
            .setHTML(location)
            //retreives the location name property which has been set above
            .addTo(map);
        // adds popup tp map 
    });
});


//Legend
//Declare arrayy variables for labels and colours
const legendlabels = [
    'Splashpad',
    'Pool',
    'Library',
    'Community Centre',
    'SSHA Shelter',
    'Other',
    'Green Space',
    '(Click on dot to find location name)'
];

const legendcolours = [
    '#5c99b5',
    '#1b79d1',
    '#e3a92b',
    '#1659cc',
    '#795cbf',
    '#3b3b40',
    'hsl(143, 36%, 37%)'

];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

//For each layer create a block to put the colour and label in
legendlabels.forEach((label, i) => {
    const color = legendcolours[i];

    const item = document.createElement('div'); //each layer gets a 'row' - this isn't in the legend yet, we do this later
    const key = document.createElement('span'); //add a 'key' to the row. A key will be the color circle

    key.className = 'legend-key'; //the key will take on the shape and style properties defined in css
    key.style.backgroundColor = color; // the background color is retreived from teh layers array

    const value = document.createElement('span'); //add a value variable to the 'row' in the legend
    value.innerHTML = `${label}`; //give the value variable text based on the label

    item.appendChild(key); //add the key (color cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});
