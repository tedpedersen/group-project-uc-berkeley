var googlekey = config.googlekey;
var globalSummaryStats;

var surfaceCaseLoadData = function(mostRecentCaseLoad) {
    /**
     * Surfaces the caseload counts:
     *     1. Displays the total counts
     *     2. Uses the derivative data to determine the arrow direction and font color
     */ 
    var statNames = ["TotalActive", "TotalConfirmed", "TotalDeaths", "TotalRecovered"];
    for (let i = 0; i < statNames.length; i++){
        var statName = statNames[i];
        var statValue = mostRecentCaseLoad[statName].toLocaleString();
        if (statValue === 0) {
            statValue = "-";
        }
        $("#" + statName).text(statValue).css("color", "inherit");

        // add an arrow to denote the change in case load
        var newStatName = statName.replace("Total", "New");
        if (newStatName in mostRecentCaseLoad) {

            // create the arrow
            var trendArrow = $("<span>").addClass("uk-margin-left-small");
            if (mostRecentCaseLoad[newStatName] > 0) {
                trendArrow.attr("uk-icon", "icon: arrow-up;");
                $("#" + statName).css("color", "red");
            } else {
                trendArrow.attr("uk-icon", "icon: arrow-down;");
                $("#" + statName).css("color", "green");
            }

            // add the arrow
            $("#" + statName).append(trendArrow);
        }
    }
}

var confirmLocation = function(locationsArray) {
    /**
     * Handles situtations where there are multiple results by:
     *     1. Show a modal with the search results so that the user can choose a location
     *     2. Surfaces data in the dashboard once the user has confirmed their location
     */ 

    for (let i=0; i < locationsArray.length; i++) {

        // radio button
        var searchResultInput = $("<input>").attr({
            "type": "radio",
            "name": "search-result",
            "id": `search-result-${i}`,
            "data-address-components": JSON.stringify(locationsArray[i].address_components)
        });

        // label
        var searchResultLabel = $("<label>")
            .text(locationsArray[i].formatted_address)
            .attr("for", `search-result-${i}`)
            .addClass("uk-margin-small-left");
        
        $("#confirm-location-form-body")
            .append($("<div>")
                .addClass("search-result-item", "uk-form-controls", "uk-padding-bottom")
                .append([searchResultInput, searchResultLabel])
            );
    }

    // display the modal
    UIkit.modal("#confirm-location-modal").show();
}


// API CALLS
var getGlobalData = function() {
    /**
     * Gets global stats from the covid19 API. Docs: https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest
     **/

    // first get the summary stats for the world 
    var summaryApiUrl = "https://api.covid19api.com/summary";
    fetch(summaryApiUrl).then(function(res) {
        if(res.ok){
            res.json().then(function(data){
                globalSummaryStats = data;
            })
        }
    })

    // then get the world data 
    var worldApiUrl = "https://api.covid19api.com/world?from=" + yesterday + "&to=" + today;
    fetch(worldApiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                var mostRecentCaseLoad = summaryData[(summaryData.length - 1)];

                // record total active case stats
                var totalConfirmed = mostRecentCaseLoad.TotalConfirmed;
                var totalDeaths = mostRecentCaseLoad.TotalDeaths
                var totalRecovered = mostRecentCaseLoad.TotalRecovered;
                mostRecentCaseLoad.TotalActive = totalConfirmed - totalDeaths - totalRecovered;

                // record new active case stats
                var newConfirmed = mostRecentCaseLoad.NewConfirmed;
                var newDeaths = mostRecentCaseLoad.NewDeaths
                var newRecovered = mostRecentCaseLoad.TotalRecovered;
                mostRecentCaseLoad.NewActive = newConfirmed - newDeaths - newRecovered;

                // surface the stats
                surfaceCaseLoadData(mostRecentCaseLoad);
            })
        } else {
            surfaceData(globalSummaryStats);
        }
    }).then (function() {
        
    })
}

var getLocalData = function(country) {
    /**
     * Gets local stats from the covid19 API. Docs: https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest
     **/
    var threeDaysAgo = moment().subtract(2,"d").hour(0).minute(0).second(0).format();

    var apiUrl = "https://api.covid19api.com/total/country/" + country + "?from=" + threeDaysAgo + "&to=" + today;
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                var mostRecentCaseLoad = summaryData[(summaryData.length - 1)];

                // aggregate totals
                var confirmedCount = mostRecentCaseLoad.Confirmed;
                var deathCount = mostRecentCaseLoad.Deaths;
                var recoveredCount = mostRecentCaseLoad.Recovered;

                mostRecentCaseLoad["TotalConfirmed"] = confirmedCount;
                mostRecentCaseLoad["TotalRecovered"] = recoveredCount;
                mostRecentCaseLoad["TotalDeaths"] = deathCount;
                mostRecentCaseLoad["TotalActive"] = confirmedCount - deathCount - recoveredCount; 

                // aggregate derivative data if possible
                if (summaryData.length > 1) {
                    var dayPriorCaseLoad = summaryData[(summaryData.length - 2)];
                    var confirmedCount = dayPriorCaseLoad.Confirmed;
                    var deathCount = dayPriorCaseLoad.Deaths;
                    var recoveredCount = dayPriorCaseLoad.Recovered;
    
                    mostRecentCaseLoad["NewConfirmed"] = confirmedCount;
                    mostRecentCaseLoad["NewRecovered"] = recoveredCount;
                    mostRecentCaseLoad["NewDeaths"] = deathCount;
                    mostRecentCaseLoad["NewActive"] = confirmedCount - deathCount - recoveredCount;
                }

                // surface the data
                surfaceCaseLoadData(mostRecentCaseLoad);
            })
        } else {
            console.log(res.text);
        }
    })
}

var surfaceNoLocationFound = function(searchTerm) {
    /**
     * Helper function that tells the user that their search yielded no results
     */
    searchTerm = searchTerm.split("+").join(" ");
    var message = `Could not find the location "${searchTerm}"!`
    var messageElement = $("<p>").text(message).addClass("uk-text-meta").attr("id", "stat-search-message");
    $("#stat-search").append(messageElement);
}

var getSpecificLocation = function(searchTerm) {
    /**
     * Uses the Google Maps geocoding API to find a location based on the search term
     */ 
    searchTerm = searchTerm.split(" ").join("+");
    var geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + searchTerm + "&key=" + `${googlekey}`;
    fetch(geocodeUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                if (data.results.length === 0) {  // if there are no results, let the user know
                    surfaceNoLocationFound(searchTerm);
                } else if (data.results.length === 1) {  // if there's one result, surface the stats for that location
                    var addressComponents = data.results[0].address_components;
                    surfaceSpecificLocation(addressComponents);
                } else {  // if there are multiple results, make the user choose one, then surface the stats on submit
                    confirmLocation(data.results);
                }
            })
        } else {
            surfaceNoLocationFound(searchTerm);
        }
    })
}

var surfaceSpecificLocation = function(addressComponents) {
    /**
     * Pulls the relevant address data from a google maps api call
     */
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
    $("#location").text(countryName);
}


// EVENT LISTENERS
var statSearchInput = $('#stat-search-input')[0];
var statSearchAutocomplete = new google.maps.places.Autocomplete(statSearchInput);
statSearchAutocomplete.setFields(['address_components']);  // include address components in the response
statSearchAutocomplete.setTypes(['(regions)']);  // exclude business names from the autocomplete list
statSearchAutocomplete.addListener('place_changed', function() {
    /**
     * Event listener for the search input submission (choosing from autocomplete or hitting enter)
     */
    var place = statSearchAutocomplete.getPlace();
    var addressComponents = place.address_components;
    if (!addressComponents){
        var searchTerm = $("#stat-search-input").val();
        getSpecificLocation(searchTerm);
    } else {
        surfaceSpecificLocation(addressComponents);
    }
    $("#stat-search-input").empty();
})

$("#stat-search-input").keypress(function() {
    /**
     * Clear the stat search message once you start typing
     */
    $("#stat-search-message").remove();
})

$("#stat-search-icon").click(function(event){
    /**
     * Event listener for the searchf input's icon click
     */
    event.preventDefault();
    var searchTerm = $("#stat-search-input").val();
    getSpecificLocation(searchTerm);
    $("#stat-search-input").empty();
});

$("#confirm-location-form").submit(function(event) {
    /**
     * Event listener for the confirm location modal submission
     */
    event.preventDefault();
    $("#stat-search-input").empty();

    // figure out whether the user has chosen a location
    var confirmedLocation = $('input[name="search-result"]:checked').attr("data-address-components");

    // if they chose a location, display the weather
    if (confirmedLocation) {
        $("#confirm-location-form-message").removeClass("uk-text-danger");
        $("#confirm-location-form-body").empty();
        UIkit.modal("#confirm-location-modal").hide();
        confirmedLocation = JSON.parse(confirmedLocation);
        surfaceSpecificLocation(confirmedLocation);
    }
    else {  // otherwise, let the user know they're missing a response.
        $("#confirm-location-form-message").addClass("uk-text-danger");
    }
})

// ON LOAD
var today = moment().utc().hour(0).minute(0).second(0).format();  // used in API calls
var yesterday = moment().subtract(1,"d").utc().hour(0).minute(0).second(0).format();  // used in API calls
var displayYesterday = moment().subtract(1,"d").format("MMMM Do, YYYY");
$("#date-last-updated").text(displayYesterday);
getGlobalData();
