// helper functions
var updateStatsSection = function(summaryData) {
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

    // define yesterday and today
    var today = moment()
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .toJSON();

    var yesterday = moment().subtract(1, "d")
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .toJSON();

    // fetch data from the last 24h
    var apiUrl = "https://api.covid19api.com/world?from=" + yesterday + "&to=" + today;
    console.log(apiUrl);
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                updateStatsSection(summaryData, location);
            })
        } else {
            console.log(res.text);
        }
    })
}

// event handlers
var searchFormHandler = function(event){
    event.preventDefault();
    var searchValue = $("#stat-search-input").val();
    if (searchValue) {
        console.log(searchValue);
    }
}

// event listeners
$("#stat-search-icon").click(searchFormHandler)
$("form").submit(searchFormHandler);

// update current date on load
var currentDate = moment().format("dddd, MMMM Do, YYYY");
$("#current-date").text(currentDate);

// surface global stats on load
getGlobalData();

