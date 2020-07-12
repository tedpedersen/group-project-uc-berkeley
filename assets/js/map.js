//no data available for South Dakota or Rhode Island
var statesArray = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new-hampshire",
  "new-jersey",
  "new-mexico",
  "new-york",
  "north-carolina",
  "north-dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "south-carolina",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west-virginia",
  "wisconsin",
  "wyoming",
];

function initMap() {
  var map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.09024, lng: -95.712891 },
    zoom: 4,
  });
  google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
    $(this.getDiv()).animate({
      opacity: 1
    })
    $("#pac-card").animate({
      opacity: 1
    })
  });
  var card = document.getElementById("pac-card");
  var input = document.getElementById("pac-input");
  var types = document.getElementById("type-selector");
  var strictBounds = document.getElementById("strict-bounds-selector");

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  var autocomplete = new google.maps.places.Autocomplete(input);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo("bounds", map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(["address_components", "geometry", "icon", "name"]);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener("place_changed", function () {
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
      map.setZoom(17); // Why 17? Because it looks good.
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(false);

    var address = "";
    if (place.address_components) {
      address = [
        (place.address_components[0] &&
          place.address_components[0].short_name) ||
        "",
        (place.address_components[1] &&
          place.address_components[1].short_name) ||
        "",
        (place.address_components[2] &&
          place.address_components[2].short_name) ||
        "",
      ].join(" ");
    }
  });

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener("click", function () {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener("changetype-all", []);
  setupClickListener("changetype-address", ["address"]);
  setupClickListener("changetype-establishment", ["establishment"]);
  setupClickListener("changetype-geocode", ["geocode"]);

  document
    .getElementById("use-strict-bounds")
    .addEventListener("click", function () {
      console.log("Checkbox clicked! New state=" + this.checked);
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
              //get location's data for info windows
              const locationName = data[i].name;
              const locationDescription = data[i].description;

              //check if phone number / address exist for location
              if (data[i].physical_address === undefined) {
                var phoneNumber = "Unknown";
              } else {
                if (data[i].physical_address[0] !== undefined) {
                  var readableStreetNameNumberCity =
                    data[i].physical_address[0].address_1 +
                    ", " +
                    data[i].physical_address[0].city;
                    if (data[i].phones[0] !== undefined) {
                      var phoneNumber = data[i].phones[0].number;
                    }

                  var makeMarkers = function () {
                    //get a latitude/longitude for each location in data array
                    //geocodeData was obtained from Google Maps API one time and then stored
                    //it was too expensive to fetch the data for hundreds of places on every load
                    var latLng = geocodeData[locationName];

                    //create info window and append to marker
                    var contentString =
                      '<div id="infoWindowContent">' +
                      '<div id="siteNotice">' +
                      "</div>" +
                      '<h1 id="firstHeading" class="firstHeading">' +
                      locationName +
                      "</h1>" +
                      '<div id="infoWindowBodyContent">' +
                      '<p class="infoWindowParagraph">' +
                      locationDescription +
                      "<br>" +
                      "<p/>" +
                      '<p class="infoWindowParagraph">' +
                      "Address: " +
                      readableStreetNameNumberCity +
                      "<br>" +
                      "Phone Number: " +
                      phoneNumber +
                      "</p>" +
                      "</div>" +
                      "</div>";
                    var infowindow = new google.maps.InfoWindow({
                      content: contentString,
                    });

                    //set marker using latLng
                    var marker = new google.maps.Marker({
                      position: latLng,
                      map: map,
                      title: locationName,
                      animation: google.maps.Animation.DROP,
                    });
                    marker.addListener("click", function () {
                      infowindow.open(map, marker);
                    });
                    map.addListener("click", function () {
                      infowindow.close();
                    });
                  }
                  makeMarkers();
                }
              }
            }
          });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        alert("Unable to connect to testing center database!");
      });
  }
}
