//no data for South Dakota or Rhode Island :(
var statesArray = ['alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey', 'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'south-carolina', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming']

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 37.09024, lng: -95.712891 },
    zoom: 4
  });
  var card = document.getElementById('pac-card');
  var input = document.getElementById('pac-input');
  var types = document.getElementById('type-selector');
  var strictBounds = document.getElementById('strict-bounds-selector');

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  var autocomplete = new google.maps.places.Autocomplete(input);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
    ['address_components', 'geometry', 'icon', 'name']);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocomplete.addListener('place_changed', function () {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;
    infowindow.open(map, marker);
  });

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function () {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-address', ['address']);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);

  document.getElementById('use-strict-bounds')
    .addEventListener('click', function () {
      console.log('Checkbox clicked! New state=' + this.checked);
      autocomplete.setOptions({ strictBounds: this.checked });
    });

  //Loop over states array and fetch API for each
  for (var i = 0; i < statesArray.length; i++) {
    fetch("https://covid-19-testing.github.io/locations/" + statesArray[i] + "/complete.json")
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            
            //loop over each state's data array
            for (var i = 0; i < data.length; i++) {
              //get a latitude/longitude for each location in data array
              var streetNameAndNumber = data[i].physical_address[0].address_1.split(' ').join('+');
              var mapquestUrl = "https://www.mapquestapi.com/geocoding/v1/address?key=CGM5S6mK5h8rGeCXOD165GEL39leUoI7&location=" + streetNameAndNumber + "+" + data[i].physical_address[0].city + "+"
              fetch(mapquestUrl)
                .then(function (response) {
                  if (response.ok) {
                    response.json().then(function (data) {
                      var currentLat = data.results[0].locations[0].latLng.lat;
                      var currentLng = data.results[0].locations[0].latLng.lng;
                      var latLng = {lat: currentLat, lng: currentLng}
                      //set marker using latLng
                      var marker = new google.maps.Marker({
                        position: latLng,
                        title:"Hello World!"
                    });
                    marker.setMap(map);
                    })
                  } else {
                    alert("Error: " + response.statusText);
                  }
                })
                .catch(function (error) {
                  alert("Unable to connect to MapQuest!")
                  
                })
            }
          })
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        alert("Unable to connect to testing center database!")
      })
  }

}