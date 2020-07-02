// helper functions
var addStatArrow = function(parentElementId) {
    var arrowElement = $("<span>").addClass("uk-margin-left-small");
    arrowElement.attr("uk-icon", "arrow-down");  // down arrow, up arrow is arrow-up
    $(parentElementId).append(arrowElement);
}

// api calls
var getGlobalStats = function() {
    /**
     * Surfaces global stats
     **/
    var apiUrl = "https://api.covid19api.com/summary";
    fetch(apiUrl).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                // converts the Global Data object into an array
                var globalData = Object.entries(data['Global']);
                for (let i=0; i<globalData.length; i++) {
                    var stat = globalData[i][1].toLocaleString();
                    var elementId = "#" + globalData[i][0];
                    $(elementId).text(stat);
                    addStatArrow(elementId);
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

