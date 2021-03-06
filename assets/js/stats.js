var globalStats;
var statsToHighlight;


var addTrendIcon = function(stats, statName, statSection) {
    /**
     * Helper function to create trend icons
     */
    
    var newStatName = statName.replace("Total", "New");
    if (newStatName in stats) {
        var trendIcon = $("<span>").addClass("uk-margin-small-left");
        var statValueElementId = "#" + statSection + "-" + statName + "-value"
        if (stats[newStatName] > 0) {
            trendIcon.attr("uk-icon", "icon: chevron-up;");
            $(statValueElementId).addClass("uk-text-danger");
        } else if (stats[statName] === 0) {
            trendIcon.attr("uk-icon", "icon: minus;");
            $(statValueElementId).addClass("uk-text-success");
        } else {
            trendIcon.attr("uk-icon", "icon: minus;");
            $(statValueElementId).addClass("uk-text-warning");
        }
        $(statValueElementId).append(trendIcon);
    }
}

var surfaceHighlightedData = function() {
    /**
     * Surfaces the caseload counts for the highlighted data variable:
     *     1. Displays the total counts
     *     2. Uses the derivative data to determine the icon direction and font color
     */

    var statNames = ["TotalActive", "TotalConfirmed", "TotalDeaths", "TotalRecovered"];
    for (let i = 0; i < statNames.length; i++) {
        var statName = statNames[i];
        
        // clear existing classes
        $("#highlighted-" + statName + "-value").removeClass(["uk-text-danger", "uk-text-success"]);

        // calculate active stats
        statsToHighlight.TotalActive = statsToHighlight.TotalConfirmed - statsToHighlight.TotalDeaths - statsToHighlight.TotalRecovered;
        statsToHighlight.NewActive = statsToHighlight.NewConfirmed - statsToHighlight.NewDeaths - statsToHighlight.NewRecovered;

        // update the location
        if (statsToHighlight.Country) {
            $(".highlighted-stat-location").text(statsToHighlight.Country);
        } else {
            $(".highlighted-stat-location").text("Worldwide");
        }

        // find and display the stat value
        var statValue = statsToHighlight[statName].toLocaleString();
        $("#highlighted-" + statName + "-value").text(statValue);
        
        // add the stat label
        var displayStatName = statName.replace("Total", "Total ");
        $("#highlighted-" + statName + "-label").text(displayStatName);
        
        // create the icon
        addTrendIcon(statsToHighlight, statName, "highlighted");
    }
}

var surfaceCaseByCountryData = function() {
    /**
     * Placeholder function that surfaces case by country data. Eventually should consolidate this into the surfaceHighlightedData function since there's so much repetition
     */

    for (let i=0; i < globalStats.Countries.length; i++) {
        var countryStats = globalStats.Countries[i];
        var countryStatElement = $("<tr>").addClass("uk-width-1-1").attr("id", countryStats.CountryCode + "-" + "case-load");

        // calculate active case stats
        countryStats.TotalActive = countryStats.TotalConfirmed - countryStats.TotalDeaths - countryStats.TotalRecovered;
        countryStats.NewActive = countryStats.NewConfirmed - countryStats.NewDeaths - countryStats.NewRecovered;

        // save the country name
        countryStatElement.append(
            $("<td>").text(countryStats.Country).attr("id", countryStats.CountryCode + "-label").addClass(["uk-text-left", "uk-width-auto"])
        );

        var statNames = ["Active", "Recovered", "Deaths", "Confirmed"]
        for (let i=0; i < statNames.length; i++) {
            var statName = "Total" + statNames[i];
        
            // find and update the stat value
            var statValue = countryStats[statName].toLocaleString();
    
            // add it to the page if necessary
            var valueElementId = countryStats.CountryCode + "-" + statName + "-value";
            var iconElementId = countryStats.CountryCode + "-" + statName + "-icon";
            let valueElement = $("#" + valueElementId);
            if (valueElement.length === 0) {
                $("#case-by-country-data").append(countryStatElement.append(
                    $("<td>")
                        .text(statValue)
                        .addClass(["uk-text-left", "uk-width-1-5", "uk-text-nowrap"])
                        .attr("id", valueElementId)
                    )
                );
            } else {
                $("#" + valueElementId)
                    .text(statValue)
                    .removeClass(["uk-text-danger", "uk-text-success"])
                    .removeAttr("uk-icon")
                    .append(
                        $("<span>").attr("id", iconElementId)
                    );
            }
    
            // add an icon to denote the change in case load
            addTrendIcon(countryStats, statName, countryStats.CountryCode);
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
                $("#date-last-updated").text("Last Updated " + dateLastUpdated);
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

            //Add searched country to history list and save to localStorage
            var listContents = [];
            
            if (!localStorage.getItem('savedSearches').includes(countryName)) {
                $(".searched-locations").append('<li class="list-group-item">' + countryName + '</li>')
                $(".searched-locations").each(function(){
                listContents.push(this.innerHTML);
                })
                localStorage.setItem('savedSearches', JSON.stringify(listContents));
            }
        }
    }
}

//load localStorage
function loadStorage() {
    if (localStorage.getItem('savedSearches')){
        var listContents = JSON.parse(localStorage.getItem('savedSearches'));
        $(".searched-locations").each(function(i){
          this.innerHTML = listContents [i];
        })
    }
}
loadStorage();

//search for country from history
$("#search-history ul").click(function (event) {
    event.preventDefault();
    UIkit.modal("#search-history").hide();
    countryName = $(event.target).text();
    getSpecificLocation(countryName)
    $("#location").text(countryName);
});

$("#delete-search-history").click(function (event) {
    localStorage.clear();
    $(".list-group-item").remove();
})

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

// ON LOAD
getCaseLoadData();
