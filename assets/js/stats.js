// api calls
var getGlobalStats = function() {
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
    
    // fetch data from the last two days
    var apiUrl = "https://api.covid19api.com/world?from=" + yesterday + "&to=" + today;
    console.log(apiUrl);
    fetch(apiUrl).then(function(res) {
        if(res.ok) {
            res.json().then(function(summaryData) {
                // get yesterday's data
                var yesterdayData = summaryData[0];
                yesterdayData = Object.entries(yesterdayData);

                // get today's data
                var todayData = summaryData[1];
                todayData = Object.entries(todayData);
                
                // iterate through today's stats
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
                    $("#" + statName).text(todayStatValue);
                    $("#" + statName).append(arrowElement);
                }
            })
        } else {
            console.log(res.text);
        }
    })
}

// update current date on load
var currentDate = moment().format("dddd, MMMM Do, YYYY");
$("#current-date").text(currentDate);

// surface US stats on load
getGlobalStats();

