// smooth scrolling for homepage link
function scrollToStats(div){
    $('html, body').animate({
        scrollTop: $("#stats-container").offset().top + -160
},500);
}