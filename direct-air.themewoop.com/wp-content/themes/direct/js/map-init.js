/**
 * Get localize varaiable
 */
var siteurl = localize.siteurl;
var tempdir = localize.tempdir;
var maker_icon = localize.makericon;
var map_skin = localize.mapskin;
if (map_skin == '2') {
	map_style = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#0095d9"}]},{"featureType":"administrative.country","elementType":"labels.text.stroke","stylers":[{"weight":"4"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"administrative.province","elementType":"labels.text.stroke","stylers":[{"weight":"3"}]},{"featureType":"administrative.locality","elementType":"geometry.stroke","stylers":[{"weight":"1"}]},{"featureType":"administrative.locality","elementType":"labels.text.stroke","stylers":[{"weight":"3"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.stroke","stylers":[{"weight":"2"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.stroke","stylers":[{"weight":"3"}]},{"featureType":"landscape","elementType":"all","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#19a0d8"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100},{"weight":"3"}]},{"featureType":"water","elementType":"labels.icon","stylers":[{"visibility":"off"}]}];
} else{
	map_style = [{"featureType":"all","elementType":"all","stylers":[{"invert_lightness":true},{"saturation":10},{"lightness":30},{"gamma":0.5},{"hue":"#435158"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"color":"#192f2f"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"saturation":"-7"},{"hue":"#00ff6c"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"color":"#1e3233"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"color":"#07949b"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#06bcc6"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#005453"}]}];
};
/**
 * Multiple Markers
 */
// When the window has finished loading create our google map below
var mapElement = document.getElementById('pro-direct-map');
if (mapElement !== null){

  google.maps.event.addDomListener(window, 'load', init());

}
function init() {
    var bounds = new google.maps.LatLngBounds();
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var mapOptions = {

        // How zoomed in you want the map to start at (always required)
        zoom: 17,

        // Disable scrollwheel
        scrollwheel: false,

        // The latitude and longitude to center the map (always required)
        center: new google.maps.LatLng(51.502000,-0.119562),

        // How you would like to style the map.
        styles: map_style,
    };

    // Get the HTML DOM element that will contain your map
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('pro-direct-map');

    // Create the Google Map using our element and options defined above
    if (mapElement !== null){
      var map = new google.maps.Map(mapElement, mapOptions);
    }
    // Display multiple markers on a map
    var infoBubble = new InfoBubble({
      map: map,
      minWidth: 652,
      shadowStyle: 0,
      padding: 0,
      backgroundColor: 'transparent',
      borderRadius: 20,
      arrowSize: 10,
      borderWidth: 0,
      borderColor: '',
      disableAutoPan: true,
      hideCloseButton: false,
      arrowPosition: 30,
      backgroundClassName: 'transparent',
      arrowStyle: 0,
    });
    var marker, i;
    // Loop through our array of markers & place each one on the map
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new Marker({
            position: position,
            map: map,
            title: markers[i][0],
            icon: maker_icon,
            label: markers[i][3],
        });

        // Allow each marker to have an info window
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoBubble.setContent(infoWindowContent[i][0]);
                infoBubble.open(map, marker);
            };
        })(marker, i));
        //Automatically center the map fitting all markers on the screen
        if (mapElement !== null){
        	map.fitBounds(bounds);
    	}
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        if( i === 1){
          this.setZoom(17);
        }
        google.maps.event.removeListener(boundsListener);
    });

}

function initialize_search() {

  var input = document.getElementById('direct-location-autocompleted');

  var input_home = document.getElementById('home-filter-location');

  if (input !== null){
    var autocomplete = new google.maps.places.Autocomplete(input);
  }

  if (input_home !== null){
    var autocomplete_home = new google.maps.places.Autocomplete(input_home);
  }

}

google.maps.event.addDomListener(window, 'load', initialize_search);

