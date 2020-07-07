// smooth scrolling for homepage link
function scrollToStats(div){
    $('html, body').animate({
        scrollTop: $("#stats-container").offset().top + -160
},500);
//dynamically add active style to nav links
$(".uk-navbar-container ul li").click(function(){   
    $(this).addClass('uk-active');
    $(this).siblings().removeClass('uk-active');
   });
}
var url = window.location.href;
var statNav = document.getElementById("statNav");
if (url.search("#stats") >= 0) {
    statNav.classList.add("uk-active");
} 