// helper functions
var surfaceGlobalData = function(summaryData) {

    console.log(summaryData);

    // get yesterday's data
    var yesterdayData = summaryData[0];
    yesterdayData = Object.entries(yesterdayData);

    // get today's data and iterate through it
    var todayData = summaryData[1];
    todayData = Object.entries(todayData);

    for (let i=0; i < todayData.length; i++) {

        // define the stat name and value
        var statName = todayData[i][0];
        var todayStatValue = todayData[i][1];

        // add the arrow
        if (yesterdayData) {
            var arrowElement = $("<span>").addClass("uk-margin-left-small");
            var yesterdayStatValue = yesterdayData[i][1];
            
            // if there are more cases today, add an up arrow
            if (todayStatValue > yesterdayStatValue) {
                arrowElement.attr("uk-icon", "arrow-up");
            }  // if there are fewer cases today, add a down arrow
            else if (todayStatValue < yesterdayStatValue) {
                arrowElement.attr("uk-icon", "arrow-down");
            }  // if they're the same, add a horizontal line
            else {
                arrowElement.attr("uk-icon", "minus");
            }
        }

        // add the data to the DOM 
        todayStatValue = todayStatValue.toLocaleString();  // adds commas
        $("#" + statName).text(todayStatValue).append(arrowElement);
    }
}

// api calls
var getGlobalData = function() {
    /**
     * Surfaces global stats
     **/

    // fetch data from the last 48h
    var apiUrl = "https://api.covid19api.com/world?from=" + yesterday + "T00:00:00.000Z&to=" + today + "T23:59:59.999Z";
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                surfaceGlobalData(summaryData, location);
            })
        } else {
            console.log(res.text);
        }
    })
}
var getLocalData = function(country) {
    /**
     * Surfaces global stats
     **/

    // fetch totals from the last 48h
    var apiUrl = "https://api.covid19api.com/total/country/" + country + "?from=" + yesterday + "T00:00:00.000Z&to=" + today + "T23:59:59.999Z";
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(data) {
                for (let i=0; i < data.length; i++) {

                    // format the response data so that it aligns with our dom element IDs
                    var statObject = {
                        TotalConfirmed: data[i].Confirmed.toLocaleString(),
                        TotalDeaths: data[i].Deaths.toLocaleString(),
                        TotalRecovered: data[i].Recovered.toLocaleString()
                    };

                    // add the data to the dom
                    var statNames = Object.entries(statObject);
                    console.log(statNames);
                    for (let j=0; j < statNames.length; j++) {
                        var statName = statNames[j][0]
                        var statValue = statNames[j][1]
                        $("#" + statName).text(statValue)
                    }
                }
            })
        } else {
            console.log(res.text);
        }
    })
}

// add google search functionality to stat search field
var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-33.8902, 151.1759),
    new google.maps.LatLng(-33.8474, 151.2631)
);
var input = document.getElementById('stat-search-input');
var searchBox = new google.maps.places.SearchBox(input, {
    bounds: defaultBounds
});

// event listeners
searchBox.addListener('places_changed', function() {
    // get the data from the search box
    var places = searchBox.getPlaces();
    var addressComponents = places[0].address_components;
    var countryName;
    var countryCode;

    // iterate through the address components to get the country
    for (let i=0; i < addressComponents.length; i++) {
        if (addressComponents[i].types.includes("country")) {
            countryName = addressComponents[i].long_name;
            countryCode = addressComponents[i].short_name;
        }
    }

    // update the stats
    getLocalData(countryCode);
    // update the stats title
    $("#location").text(countryName);
})

$("#stat-search-icon").click(function(event){
    event.preventDefault();
});

$("form").submit(function(event){
    event.preventDefault();
});

// update current date on load
var currentDate = moment().format("dddd, MMMM Do, YYYY");
$("#current-date").text(currentDate);

// surface global stats on load
var today = moment().format("YYYY-MM-DD");
var yesterday = moment().subtract(1,"d").format("YYYY-MM-DD");
var dayBeforeYesterday = moment().subtract(2,"d").format("YYYY-MM-DD");
getGlobalData();
