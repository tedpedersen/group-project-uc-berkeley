// smooth scrolling for homepage link
function scrollToStats(div){
    $('html, body').animate({
        scrollTop: $("#stats-container").offset().top + -200
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
//close mobile nav when clicking link
$("#menu li a").click(function(){   
    $("#menuToggle input").prop("checked", false);
});


//change the stat layout if mobile
function checkMobile(){
    if (window.matchMedia("(max-width: 767px)").matches) 
    { 
        $("#left-column").removeClass("uk-width-1-3");
        $("#left-column").addClass("uk-width-12");
        $("#center-column").removeClass("uk-width-1-2");
        $("#center-column").addClass("uk-width-12");
        $("#country-case-table").removeClass("uk-table-responsive");
    } else {
        $("#left-column").removeClass("uk-width-12");
        $("#left-column").addClass("uk-width-1-3");
        $("#center-column").removeClass("uk-width-12");
        $("#center-column").addClass("uk-width-1-2");
    } 
}

checkMobile();
//change the layout if user adjusts the browser viewport
$(window).resize(function() {
    checkMobile();
});
