// helper functions
var surfaceData = function(summaryData) {
    /**
     * Surfaces global data
     */

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
     * Gets global stats from the covid19 API. Docs: https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest
     **/

    var apiUrl = "https://api.covid19api.com/world?from=" + yesterday + "T00:00:00Z&to=" + today + "T23:59:59Z";
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                surfaceData(summaryData);
            })
        } else {
            console.log(res.text);
        }
    })
}

var getLocalData = function(country) {
    /**
     * Gets local stats from the covid19 API. Docs: https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest
     **/

    var apiUrl = "https://api.covid19api.com/total/country/" + country + "?from=" + yesterday + "T00:00:00Z&to=" + today + "T23:59:59Z";
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                for (let i = 0; i < summaryData.length; i++) {

                    // fix keys to match the global stats response
                    summaryData[i].NewConfirmed = summaryData[i].Confirmed;
                    delete summaryData[i].Confirmed;
                    
                    summaryData[i].NewDeaths = summaryData[i].Deaths;
                    delete summaryData[i].Deaths;

                    summaryData[i].NewRecovered = summaryData[i].Recovered;
                    delete summaryData[i].Recovered;
                }
                surfaceData(summaryData);
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
    /* Google Maps autocomplete location selection handler */
    
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
