

// api calls
var getGlobalStats = function() {
    /**
     * Gets the global summary stats to surface on load
     **/
    var apiUrl = "https://api.covid19api.com/summary";
    fetch(apiUrl).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                // converts the Global Data object into an array
                var globalData = Object.entries(data['Global']);
                for (let i=0; i<globalData.length; i++) {
                    var stat = toString(globalData[i][1]);
                    $("#" + globalData[i][0]).text(globalData[i][1]);
                }
            })
        } else {
            console.log("something went wrong");
        }
    })
}

// update current date on load
var currentDate = moment().format("dddd, MMMM Do, YYYY");
$("#current-date").text(currentDate);

// surface US stats on load
getGlobalStats();

