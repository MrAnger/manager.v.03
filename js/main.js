function setHeightTaskContent() {
    $(".tasks-content").css("height", $(window).height() - 30);
};
$(window).resize(setHeightTaskContent);
$(document).ready(setHeightTaskContent);
$(".switch-box").click(function () {
    $(this).toggleClass("status-off");
});
/*
 $(".auth-no-success").click(function () {
 $('.auth-no-success').hide();
 $('.auth-success').show();
 });
 $(".auth-success").click(function () {
 $('.auth-success').hide();
 $('.auth-no-success').show();
 }); */
$('.item-list li').click(function (event) {
    $(this).parent().children("li").removeClass('active');
    $(this).addClass('active');
    event.stopImmediatePropagation();
});
clickTabList = function (event) {
    $('.tab-list li').removeClass('active');
    //$('.set-task').hide(300);
    var item = $(this).attr('class');
    switch (item) {
        case 'general':
            $('.set-task[name=set-general]').fadeIn(300);
            break;
        case 'targeting':
            $('.set-task[name=set-targeting]').fadeIn(300);
            break;
        case 'audit':
            $('.set-task[name=set-audit]').fadeIn(300);
            break;
        case 'statistics':
            $('.set-task[name=set-stat]').fadeIn(300);
            break;
    }
    $(this).toggleClass('active');
};
$('.tab-list li').on('click', clickTabList);
$('.tab-list li').click(function () {
    $(this).addClass('active');
});
$('.edit').click(function () {
    $(this).toggleClass('active');
});
//  скроллинг
function setHeightContentScroll() {
    $('.setting-group').css("height", $(window).height() - 90);
    $('.content-height').css("height", $(window).height() - 60);
};
setHeightContentScroll();
$(window).resize(setHeightContentScroll);
$('.content-scroll').mousewheel(function (e, delta) {
    var scrollSize = 15;
    if (delta > 0) {
        if (parseInt($(this).css("top")) != 0) {
            $(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
        }
    } else {
        if ($(this).parent().height() + Math.abs(parseInt($(this).css("top"))) <= $(this).height()) {
            $(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
        }
    }
});
$(".spoiler").click(function () {
    $(this).toggleClass("active");
    if ($(this).hasClass("active")) {
        $(this).parents(".set-item").children(".graph-box").show()
    }
    else {
        $(this).parents(".set-item").children(".graph-box").hide()
    }
});
$(".add-box-wrap").click(function () {
    $(this).hide()
});

//MrAnger edit script
$(".lng-item").click(function(){
	if(!$(this).hasAttribute("disable")){
		$(".lng-item").removeClass("active");
		$(this).addClass("active");
	};
});
$(".show-box").disableSelection().click(function (event) {
	var el = $(this)
	el.toggleClass("true")
	var elValue = el.parents(".text-line").children("input").val(),
		name = el.parents(".text-line").children("input").attr("name"),
		placeholder = el.parents(".text-line").children("input").attr("placeholder");
	if (el.hasClass("true")) {
		el.parents(".text-line").children("input[type=password]").after("<input class='password' type='text' value placeholder>");
		el.parents(".text-line").children("input[type=password]").remove();
		el.parents(".text-line").children("input[type=text]").val(elValue);
		if(name) el.parents(".text-line").children("input[type=text]").attr("name", name);
		if(placeholder) el.parents(".text-line").children("input[type=text]").attr("placeholder", placeholder);
	}
	else {
		el.parents(".text-line").children("input[type=text]").after("<input class='password' type='password' value placeholder>");
		el.parents(".text-line").children("input[type=text]").remove();
		el.parents(".text-line").children("input[type=password]").val(elValue);
		if(name) el.parents(".text-line").children("input[type=password]").attr("name", name);
		if(placeholder) el.parents(".text-line").children("input[type=password]").attr("placeholder", placeholder);
	}
	event.stopImmediatePropagation();
});
$(document).on("click", ".msg-box .msg-content .close", function(e){
	$(this).parent().fadeOut("fast", function(){
		$(this).remove();
	});
});