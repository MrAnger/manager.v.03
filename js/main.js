function setHeightTaskContent() {
    $(".tasks-content").css("height", $(window).height() - 30);
};
$(window).resize(setHeightTaskContent);
$(document).ready(setHeightTaskContent);
$(".switch-box").click(function () {
    $(this).toggleClass("status-off");
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
		placeholder = el.parents(".text-line").children("input").attr("placeholder"),
		disabled = el.parents(".text-line").children("input").hasAttribute("disabled");
	if (el.hasClass("true")) {
		el.parents(".text-line").children("input[type=password]").after("<input class='password' type='text' value placeholder>");
		el.parents(".text-line").children("input[type=password]").remove();
		el.parents(".text-line").children("input[type=text]").val(elValue);
		if(name) el.parents(".text-line").children("input[type=text]").attr("name", name);
		if(placeholder) el.parents(".text-line").children("input[type=text]").attr("placeholder", placeholder);
		if(disabled) el.parents(".text-line").children("input[type=text]").attr("disabled", "disabled");
	}
	else {
		el.parents(".text-line").children("input[type=text]").after("<input class='password' type='password' value placeholder>");
		el.parents(".text-line").children("input[type=text]").remove();
		el.parents(".text-line").children("input[type=password]").val(elValue);
		if(name) el.parents(".text-line").children("input[type=password]").attr("name", name);
		if(placeholder) el.parents(".text-line").children("input[type=password]").attr("placeholder", placeholder);
		if(disabled) el.parents(".text-line").children("input[type=password]").attr("disabled", "disabled");
	}
	event.stopImmediatePropagation();
});
$(document).on("click", ".msg-box .msg-content .close", function(e){
	$(this).parent().fadeOut("fast", function(){
		$(this).remove();
	});
});
$(".console-box .console-title").click(function(e){
	var box = $(this).parents(".console-box").find(".open-box"),
		input = $(this).parents(".console-box").find(".console-send input[type=text]");

	if($(box).css("display") == "none"){
		$(box).show("fast", function(){
			manager.data.elem.console_clip.show();
			manager.data.elem.console_clip.reposition();
			$(input).focus();
		});
	}else{
		$(box).hide("fast", function(){
			manager.data.elem.console_clip.hide();
		});
	};
});
$(".top-menu .item").click(function(e){
	$(this).parents(".top-menu").find(".item").removeClass("active");
	$(this).addClass("active");
});
$(".account [name=login]").click(function(e){
	$(".top-menu .item").removeClass("active");
});
$(document).on("click", ".edit", function(e){
	$(".edit").removeClass("active");
	$(this).toggleClass('active');
	e.stopImmediatePropagation();
});
$(document).click(function(e){
	$(".edit").removeClass("active");
});
$(document).on("click", ".item-list li", function(e){
	$(this).parent().children("li").removeClass('active');
	$(this).addClass('active');
});
$(document).on("click", "[wa_folder]", function(e){
	manager.methods.loadTasks($(this).find("[name=view_folderId]").html());
});
$(".add-box-wrap .close").click(function(e){
	$(this).parents(".add-box-wrap").fadeOut("fast");
});
$(".confirm-box .close").click(function(e){
	$(this).parents(".confirm-box").fadeOut("fast");
});
$(".confirm-box [name=yes]").click(function(e){
	$(this).parents(".confirm-box").find(".close").click();
});
$(".confirm-box [name=no]").click(function(e){
	$(this).parents(".confirm-box").find(".close").click();
});
$(".tab-list li").each(function(key, el){
	var tab_content = $(this).parents(".tab-box").find(".tab-box-content [name='"+$(this).attr("name")+"']");
	if($(this).hasClass("active")) $(tab_content).show();
	else $(tab_content).hide();
}).click(function(e){
	var name = $(this).attr("name");
	$(this).parents(".tab-list").children("li").removeClass("active").each(function(key, el){
		$(this).parents(".tab-box").find(".tab-box-content [name='"+$(this).attr("name")+"']").hide();
	});
	$(this).addClass('active');

	$(this).parents(".tab-box").find(".tab-box-content [name='"+name+"']").show();
});
$(".spoiler").each(function(key, el){
	//if($(this).hasClass("active")) $(this);
}).click(function(){
	/*$(this).toggleClass("active");
	if ($(this).hasClass("active")) {
		$(this).parents(".set-item").children(".graph-box").show()
	}
	else {
		$(this).parents(".set-item").children(".graph-box").hide()
	}*/
	//spoiler-box-content

});