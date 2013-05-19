(function($){
	var clip_console = null,
		clip_btn_readonlyKey = null;

	function setHeightTaskContent() {
		$(".tasks-content").css("height", $(window).height() - 30);
	};
	$(window).resize(setHeightTaskContent);
	$(document).ready(setHeightTaskContent);
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
				var top = parseInt($(this).css("top")) + scrollSize * delta;
				$(this).css("top", parseInt(((top > 0) ? 0 : top)));
			}
		} else {
			if ($(this).parent().height() + Math.abs(parseInt($(this).css("top"))) <= $(this).height()) {
				$(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
			}
		}
	});

	//MrAnger edit script

	//language
	$(".lng-item").click(function(){
		if(!this.hasAttribute("disable")){
			$(".lng-item").removeClass("active");
			$(this).addClass("active");
		};
	});
	//input showBox
	$(".show-box").click(function (event) {
		var el = $(this)
		el.toggleClass("true")
		var elValue = el.parents(".text-line").children("input").val(),
			name = el.parents(".text-line").children("input").attr("name"),
			placeholder = el.parents(".text-line").children("input").attr("placeholder"),
			disabled = el.parents(".text-line").children("input")[0].hasAttribute("disabled");
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
	//switchBox
	$(".switch-box").click(function () {
		$(this).toggleClass("status-off");

		if(this.hasAttribute("onchange")){
			var func = $(this).attr("onchange");

			if($(this).hasClass("status-off")) eval(func + "(false, this)");
			else eval(func + "(true, this)");
		};
	});
	//msgBox(Notice)
	$(document).on("click", ".msg-box .msg-content .close", function(e){
		$(this).parents(".msg-content").fadeOut("fast", function(){
			$(this).remove();
		});
	});
	//console
	$(document).ready(function(){
		var consoleBox = $(".console-box .open-box"),
			clip = clip_console = new ZeroClipboard.Client();

		$(consoleBox).show();
		clip.glue("console_button_copy");
		$(consoleBox).hide();
		clip.hide();
		$("#"+$(clip.getHTML()).attr('id')).parent().css("z-index" ,"10000");

		clip.addEventListener('onMouseUp', function(client){
			var html = $(".console-box .console-text .content").html();
			html = html.replace(new RegExp("<br>",'ig'), "\n").replace(new RegExp("<p>",'ig'), "").replace(new RegExp("</p>",'ig'), "\n\n");
			clip.setText(html);
		});
		clip.addEventListener('onComplete', function(client){
			WA_ManagerUi.utils.noticeShow(WA_ManagerUi.lng.form.console.copy.complete, "success");
		});
		$(window).resize(function(e){
			if($(consoleBox).css("display") != "none"){
				clip.reposition();
			};
		});
	});
	$(".console-box .console-title").click(function(e){
		var box = $(this).parents(".console-box").find(".open-box"),
			input = $(this).parents(".console-box").find(".console-send input[type=text]");

		if($(box).css("display") == "none"){
			$(box).show("fast", function(){
				clip_console.show();
				clip_console.reposition();
				$(input).focus();
			});
		}else{
			$(box).hide("fast", function(){
				clip_console.hide();
			});
		};
	});
	//button copy readonlyKey
	$(document).ready(function(e){
		var clip = WA_ManagerUi.data.clip_btn_readoblyKey = clip_btn_readonlyKey = new ZeroClipboard.Client(),
			clipHtml = null,
			cy4ki = $(".main .auth-success, .main .manager .account-content");
		$(cy4ki).show();
		clip.glue("btn_copy_readonlyKey");
		$(cy4ki).hide();
		clipHtml = $("#"+$(clip.getHTML()).attr('id')).parent()[0];
		clip.addEventListener('onMouseUp', function(client){
			clip.setText($("[name=form_account] [name=readonlyKey] [name=value]").html());
		});
		clip.addEventListener('onComplete', function(client){
			WA_ManagerUi.utils.noticeShow(WA_ManagerUi.lng.form.account.readonlyKey.copy_success, "success");
		});
		clip.hide();
		$(window).resize(function(e){
			if($(".main .manager .account-content").css("display") != "none"){
				clip.reposition();
			};
		});
	});
	//top  menu
	$(".top-menu .item").click(function(e){
		$(this).parents(".top-menu").find(".item").removeClass("active");
		$(this).addClass("active");
	});
	$(".account [name=login]").click(function(e){
		$(".top-menu .item").removeClass("active");
	});
	//splash menu edit
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
	//lists of folder, task, ipList
	$(document).on("click", ".item-list li", function(e){
		$(this).parent().children("li").removeClass('active');
		$(this).addClass('active');
	});
	//folder
	$(document).on("click", "[wa_folder]", function(e){
		WA_ManagerUi.forms.task.load(WA_ManagerUi.utils.getParam(this, "id"));
	});
	//task
	$(document).on("click", "[wa_task]", function(e){
		WA_ManagerUi.forms.task.loadSetting(WA_ManagerUi.utils.getParam(this, "folderId"), WA_ManagerUi.utils.getParam(this, "taskId"));
	});
	//close events on messages
	$(".add-box-wrap .close").click(function(e){
		$(this).parents(".add-box-wrap").fadeOut("fast");
	});
	$(".confirm-box .close").click(function(e){
		$(this).parents(".confirm-box").fadeOut("fast");
	});
	$(".confirm-box [name=yes]").click(function(e){
		if($(this).parents(".confirm-box")[0].hasAttribute("autoclose")) $(this).parents(".confirm-box").find(".close").click();
	});
	$(".confirm-box [name=no]").click(function(e){
		$(this).parents(".confirm-box").find(".close").click();
	});
	//key down trigger for messages
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
	//tabList
	$(".tab-list li").each(function(key, el){
		var tab_content = $(this).parents(".tab-box").find(".tab-box-content [name='"+$(this).attr("name")+"']");
		if($(this).hasClass("active")) $(tab_content).show();
		else $(tab_content).hide();
	}).click(function(e){
			$(this).parents(".tab-box").find(".content-scroll").css("top", 0);
			var name = $(this).attr("name");
			$(this).parents(".tab-list").children("li").removeClass("active").each(function(key, el){
				$(this).parents(".tab-box").find(".tab-box-content [name='"+$(this).attr("name")+"']").hide();
			});
			$(this).addClass('active');

			$(this).parents(".tab-box").find(".tab-box-content [name='"+name+"']").show();
		});
	//spoiler
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
	//form task settings
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
			$(afterClick).val(WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Min);
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
	$("#dayTargeting_cb_min input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayTargeting.lineVisibility("min", true);
		}else{
			WA_ManagerUi.data.graphs.dayTargeting.lineVisibility("min", false);
		};
	});
	$("#dayTargeting_cb_max input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayTargeting.lineVisibility("max", true);
		}else{
			WA_ManagerUi.data.graphs.dayTargeting.lineVisibility("max", false);
		};
	});
	$("#dayStat_cb_max input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("max", true);
		}else{
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("max", false);
		};
	});
	$("#dayStat_cb_min input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("min", true);
		}else{
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("min", false);
		};
	});
	$("#dayStat_cb_give input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("give", true);
		}else{
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("give", false);
		};
	});
	$("#dayStat_cb_incomplete input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("incomplete", true);
		}else{
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("incomplete", false);
		};
	});
	$("#dayStat_cb_overload input[type=checkbox]").change(function(e){
		if($(this)[0].checked){
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("overload", true);
		}else{
			WA_ManagerUi.data.graphs.dayStat.lineVisibility("overload", false);
		};
	});
	//geo elements
	$(document).on("click", "[wa_geo_country] [name=delete]", function(e){
		var layout = $(this).parents("[wa_geo_country]"),
			inputSearch = $("[name=task-setting] [name=searchCountry]")[0],
			oldValue = inputSearch.value;

		WA_ManagerUi.data.geoStorage.unSelect($(layout).find("[name=id]").val());

		$(inputSearch).val("  ");
		setTimeout(function(){
			$(inputSearch).val(oldValue);
		},350);

		$(layout).remove();
	});
	$(document).on("change", "[wa_geo_country] [name=view_target]", function(e){
		var layout = $(this).parents("[wa_geo_country]"),
			value = 100;

		if(parseFloat(this.value) > 0 && parseFloat(this.value) <= 100){
			value = parseFloat(this.value);
		};

		WA_ManagerUi.data.geoStorage.setTarget(WA_ManagerUi.utils.getParam(layout, "id"), value);
		WA_ManagerUi.forms.geo.setTargetHtml(layout, value);
	});
	$(document).on("dblclick", "[name=task-setting] [name=selectBox_country] option[value]", function(e){
		WA_ManagerUi.data.geoStorage.setTarget(this.value, 100);
		WA_ManagerUi.forms.geo.addHtml(WA_ManagerUi.data.geoStorage.getById(this.value));
		$(this).remove();
	});
})(jQuery);