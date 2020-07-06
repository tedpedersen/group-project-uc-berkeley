var globalStats;
var statsToHighlight;

var surfaceHighlightedData = function() {
    /**
     * Surfaces the caseload counts for the highlighted data variable:
     *     1. Displays the total counts
     *     2. Uses the derivative data to determine the arrow direction and font color
     */
    
    $("#highlighted-stat-value").removeClass(["uk-text-danger", "uk-text-success"]);
    
    var selectedStatType = $("#case-type-menu > li.uk-active > a").attr("id");

    // calculate active stats if active is selected
    if (selectedStatType == "Active") {
        statsToHighlight.TotalActive = statsToHighlight.TotalConfirmed - statsToHighlight.TotalDeaths - statsToHighlight.TotalRecovered;
        statsToHighlight.NewActive = statsToHighlight.NewConfirmed - statsToHighlight.NewDeaths - statsToHighlight.NewRecovered;
    }

    var statName = "Total" + selectedStatType;
    
    // find and update the stat value
    var statValue = statsToHighlight[statName].toLocaleString();
    if (statValue === 0) {
        statValue = "-";
    }

    // add an arrow to denote the change in case load
    var newStatName = statName.replace("Total", "New");
    if (newStatName in statsToHighlight) {

        // create the arrow
        var trendArrow = $("<span>").addClass("uk-margin-left-small");
        if (statsToHighlight[newStatName] > 0) {
            trendArrow.attr("uk-icon", "icon: arrow-up;");
            $("#highlighted-stat-value").addClass("uk-text-danger");
        } else {
            trendArrow.attr("uk-icon", "icon: arrow-down;");
            $("#highlighted-stat-value").addClass("uk-text-success");
        }

        // add the arrow and stat label
        $("#highlighted-stat-value").text(statValue).append(trendArrow);
        var displayStatName = statName.replace("Total", "Total ");
        $("#highlighted-stat-label").text(displayStatName);
    }
}

var surfaceCaseByCountryData = function() {
    /**
     * Placeholder function that surfaces case by country data. Eventually should consolidate this into the surfaceHighlightedData function since there's so much repetition
     */
    for (let i=0; i < globalStats.Countries.length; i++) {
        var countryStats = globalStats.Countries[i];
        var countryStatElement = $("<tr>").addClass(["case-by-country-row", "uk-text-nowrap"]).attr("id", countryStats.CountryCode + "-" + "case-load");

        // calculate active case stats
        countryStats.TotalActive = countryStats.TotalConfirmed - countryStats.TotalDeaths - countryStats.TotalRecovered;
        countryStats.NewActive = countryStats.NewConfirmed - countryStats.NewDeaths - countryStats.NewRecovered;

        // save the country name
        countryStatElement.append(
            $("<td>").text(countryStats.Country).attr("id", countryStats.CountryCode + "-label").addClass("uk-text-left")
        );

        var statNames = ["Active", "Recovered", "Deaths", "Confirmed"]
        for (let i=0; i < statNames.length; i++) {
            var statName = "Total" + statNames[i];
        
            // find and update the stat value
            var statValue = countryStats[statName].toLocaleString();
            if (statValue === 0) {
                statValue = "-";
            }
    
            // add it to the page if necessary
            var valueElementId = countryStats.CountryCode + "-" + statNames[i].toLowerCase() + "-value";
            var arrowElementId = countryStats.CountryCode + "-" + statNames[i].toLowerCase() + "-arrow";
            let valueElement = $("#" + valueElementId);
            if (valueElement.length === 0) {
                $("#case-by-country-data").append(countryStatElement.append(
                    $("<td>")
                        .text(statValue)
                        .addClass("uk-text-right")
                        .attr("id", valueElementId)
                        .append(
                            $("<span>").attr("id", arrowElementId)
                        )
                    )
                );
            } else {
                $("#" + valueElementId)
                    .text(statValue)
                    .removeClass(["uk-text-danger", "uk-text-success"])
                    .removeAttr("uk-icon")
                    .append(
                        $("<span>").attr("id", arrowElementId)
                    );
            }
    
            // create an arrow to denote the change in case load
            var newStatName = statName.replace("Total", "New");
            if (newStatName in countryStats) {
                if (countryStats[newStatName] > 0) {
                    $("#" + arrowElementId).attr("uk-icon", "icon: arrow-up;");
                    $("#" + valueElementId).addClass(["uk-text-danger", "uk-margin-right"]);
                } else {
                    $("#" + arrowElementId).attr("uk-icon", "icon: arrow-down;");
                    $("#" + valueElementId).addClass(["uk-text-success", "uk-margin-right"]);
                }
            }
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
                .addClass(["search-result-item", "uk-form-controls", "uk-padding-bottom"])
                .append([searchResultInput, searchResultLabel])
            );
    }

    // display the modal
    UIkit.modal("#confirm-location-modal").show();
}

var getCaseLoadData = function() {
    /**
     * Gets global stats from the covid19 API. Docs: https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest
     **/
    var summaryApiUrl = "https://api.covid19api.com/summary";
    fetch(summaryApiUrl).then(function(res) {
        if(res.ok){
            res.json().then(function(data){
                // store all response data in a variable and surface the relevant data
                globalStats = data;
                statsToHighlight = data.Global;
                surfaceHighlightedData();
                surfaceCaseByCountryData();

                // update the last updated date
                var dateLastUpdated = data.Countries[0].Date;
                dateLastUpdated = moment(dateLastUpdated).format("MMMM Do, YYYY [at] h:mm A");
                $("#date-last-updated").text(dateLastUpdated);
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
    var message = `Could not find a location named "${searchTerm}"`
    var messageElement = $("<p>").text(message).addClass("uk-text-meta").attr("id", "stat-search-message");
    $("#stat-search").append(messageElement);
}

var getSpecificLocation = function(searchTerm) {
    /**
     * Uses the Google Maps geocoding API to find a location based on the search term
     */ 
    searchTerm = searchTerm.split(" ").join("+");
    var geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + searchTerm + "&key=AIzaSyC5lO6ZjBp8Lwt5abqQ1GQBmVWxEerWGUY";
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

    console.log(addressComponents);

    // iterate through the address components to get the country
    for (let i=0; i < addressComponents.length; i++) {
        if (addressComponents[i].types.includes("country")) {
            countryName = addressComponents[i].long_name;
            countryCode = addressComponents[i].short_name;
        }
    }

    // update the stats
    for (let i=0; i < globalStats.Countries.length; i++) {
        if (globalStats.Countries[i].CountryCode === countryCode) {
            statsToHighlight = globalStats.Countries[i];
            surfaceHighlightedData();
            $("#location").text(countryName);
        }
    }
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
     * Event listener for the search input's icon click
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

$("#case-type-menu").click(function() {
    /**
     * Surfaces Confirmed, Active, Recovered, and Deaths based on the menu selection
     */
    surfaceHighlightedData();
    surfaceCaseByCountryData();
});

// ON LOAD
getCaseLoadData();
