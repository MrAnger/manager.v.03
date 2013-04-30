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
	var hasClass = $(this).hasClass("active");
	$(".edit").removeClass("active");
	if(hasClass) $(this).removeClass("active");
	else $(this).addClass("active");
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
	manager.methods.loadTasks(manager.methods.folder.getParam(this, "id"));
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
$(document).keydown(function(e){
	if(e.keyCode == 27){
		$(".add-box-wrap, .confirm-box").each(function(key, el){
			if($(el).css("display") != "none") $(el).find(".close").click();
		});
	}else if(e.keyCode == 13){
		$(".confirm-box").each(function(key, el){
			if($(el).css("display") != "none"){
				$(el).find("[name=yes]").click();
			};
		});
	};
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
	var content = $(el).parents(".set-item").find(".spoiler-box-content");
	if($(el).hasClass("active")) $(content).show();
	else $(content).hide();
}).click(function(){
		var content = $(this).parents(".set-item").find(".spoiler-box-content");
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			$(content).hide("fast");
		}else{
			$(this).addClass("active");
			$(content).show("fast");
		};
});
$("[name=task-setting] input[name=use_mask]").change(function(e){
	var mask = $("[name=task-setting] [name=mask]"),
		afterClick = $("[name=task-setting] [name=afterClick]"),
		ignoreGU = $("[name=task-setting] [name=ignoreGU]")[0],
		container_mask_setting = $("[name=task-setting] [name=use-mask-setting]");

	if(this.checked){
		$(container_mask_setting).show("fast");
	}else{
		$(container_mask_setting).hide("fast");
		$(mask).val("");
		$(afterClick).val("");
		ignoreGU.checked = false;
	};
}).click().click();
$("[name=task-setting] input[name=use_profile]").change(function(e){
	if(this.checked){
		$("[name=task-setting] [name=use_profile_setting]").show("fast");
	}else{
		$("[name=task-setting] [name=use_profile_setting]").hide("fast");
		$("[name=task-setting] [name=profile]").val("");
	};
}).click().click();
$("[name=task-setting] input[name=use_listIp]").change(function(e){
	if(this.checked){
		$("[name=task-setting] [name=use_listIp_setting]").show("fast");
	}else{
		$("[name=task-setting] [name=use_listIp_setting]").hide("fast");
		$("[name=task-setting] [name=listId]").val(0).change();
	};
}).click().click();
$("[name=task-setting] [name=listId]").change(function(e){
	if($(this).val() == 0 || $(this).val() == ""){
		$("[name=task-setting] [name=listIp-option]").hide("fast");
		$("[name=task-setting] [name=listIp-type][value=true]")[0].checked = true;
	}else{
		$("[name=task-setting] [name=listIp-option]").show("fast");
	};
}).change();