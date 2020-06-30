// clicking intro buttons scrolls to stats and map
function scrollToStats(div){
    $('html, body').animate({
        scrollTop: $("#stats").offset().top
},500);
}
function scrollToMap(div){
    $('html, body').animate({
        scrollTop: $("#pac-card").offset().top
},500);
}