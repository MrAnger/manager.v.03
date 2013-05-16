(function($){
	var manager = window.WA_ManagerUi = {
		options: {
			params: {
				authStep: "authStep",
				authStepNumber: "authStepNumber",
				authStepToken: "authStepToken"
			}
		},
		data: {
			graphs: {},
			geoStorage: null
		},
		events: {
			onDomReady: []
		},
		utils: {
			noticeShow: NoticeShow,
			getParam: getParam,
			setParam: setParam
		},
		forms: {
			auth: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("form[name=auth] input[type=text], form[name=auth] input[type=password]").val("");
					$("form[name=auth] input[type=checkbox]").each(function(key, checkbox){checkbox.checked = false;});

					$(".main .auth-no-success").show();
					$("form[name=auth]").show();
					$("form[name=auth] [name=mail]").focus();

					data.callback({
						form: "form[name=auth]",
						mail: "form[name=auth] input[name=mail]",
						password: "form[name=auth] input[name=password]"
					});
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$(".main .auth-no-success").hide();
					$("form[name=auth]").hide();

					data.callback();
				}
			},
			reg: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("[name=reg] input[type=text], [name=reg] input[type=password]").val("");

					$(".main .auth-no-success").show();
					$("[name=reg]").show();
					$("[name=reg] [name=reg_login]").focus();

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$(".main .auth-no-success").hide();
					$("[name=reg]").hide();

					data.callback();
				}
			},
			forgot: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("form[name=auth] input[type=text]").val("");
					$("form[name=auth] input[type=password]").val("");
					$("form[name=auth] input[name=forgot_code], form[name=auth] input[name=forgot_password]").attr("disabled", "disabled");
					$("form[name=auth]").attr("wa_step", 0);

					$(".main .auth-no-success").show();
					$("form[name=forgot]").show();
					$("form[name=forgot] [name=forgot_mail]").focus();

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$(".main .auth-no-success").hide();
					$("form[name=forgot]").hide();

					data.callback();
				}
			},
			manager: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){},
						form: "default"
					}, data);

					$(".main .auth-success").show();
					$(".header .auth-success").show();

					$(".main .auth-success .manager").children().hide();
					//$(".main .auth-success .manager .not-content").hide();

					switch(data.form){
						case "task":
							$(".main .auth-success .tasks-content").show();

							//$(".main .auth-success .manager [name=not-setting] [name=add-category]").hide();
							//$(".main .auth-success .manager [name=not-setting] [name=add-task]").hide();
							break;
						case "iplist":
							$(".main .auth-success .iplists-content").show();
							break;
						case "account":
							$(".main .auth-success .account-content").show();
							break;
						default:
							manager.forms.manager.show($.extend(true, data, {form: "task"}));
					};

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){},
						form: "default"
					}, data);

					$(".main .auth-success").hide();
					$(".header .auth-success").hide();
					switch(data.form){
						case "default":
							$(".main .auth-success .manager").children().hide();
							break;
					};

					data.callback();
				}
			},
			folder: {
				addHtml: function(id){
					var layout = $("[wa_folder][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					//add param to html
					setParam(html, "id", id);

					this.setId(html, id);
					this.setName(html, WA_ManagerStorage.folders.getFolderById(id).getName());
					this.setTaskCount(html, WA_ManagerStorage.folders.getFolderById(id).getTaskCount());

					this.toggleNotContent();
				},
				setName: function(html, val){
					$(html).find("[name=view_folderName]").html(val);
				},
				setId: function(html, val){
					$(html).find("[name=view_folderId]").html(val);
				},
				setTaskCount: function(html, val){
					$(html).find("[name=view_taskCount]").html(val);
				},
				getFoldersHtml: function(){
					var out = [];

					$("[wa_folder]:not([default])").each(function(key, folder){out.push(folder)});

					return out;
				},
				getActiveHtml: function(){
					return $(".active[wa_folder]:not([default])")[0];
				},
				getHtmlById: function(id){
					var out = null;

					$.each(this.getFoldersHtml(), function(key, html){
						if(getParam(html, "id") == id) out = html;
					});

					return out;
				},
				toggleNotContent: function(){
					var not_content = $(".folders .not-content"),
						add_category = $(".main .auth-success .manager [name=not-setting] [name=add-category]"),
						not_content_tasks = $(".tasks .not-content"),
						not_setting = $(".main .auth-success .manager [name=not-setting]");

					if(manager.forms.folder.getFoldersHtml().length == 0){
						$(not_content).show();
						$(not_content_tasks).show();
						$(not_setting).show();
						$(add_category).show();
					}else{
						$(not_content).hide();
						$(add_category).hide();
					};
				},
				load: function(){
					//delete all folders
					$(this.getFoldersHtml()).remove();
					//add to html
					$.each(WA_ManagerStorage.folders.getFolderList(), function(key, folder){
						manager.forms.folder.addHtml(folder.getId());
					});
					$(this.getFoldersHtml()).eq(0).click();
					this.toggleNotContent();
				},
				clear: function(){
					//delete all folders
					$(this.getFoldersHtml()).remove();
					$(".folders .not-content").hide();
				}
			},
			task: {
				addHtml: function(folderId, taskId){
					var layout = $("[wa_task][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					//add param to html
					setParam(html, "taskId", taskId);
					setParam(html, "folderId", folderId);

					this.setTaskId(html, taskId);
					this.setName(html, WA_ManagerStorage.folders.getFolderById(folderId).getTaskById(taskId).getName());
					this.setStatus(html, WA_ManagerStorage.folders.getFolderById(folderId).getTaskById(taskId).isEnabled());
				},
				setStatus: function(html, val){
					var el = $(html).find("[name=view_taskStatus]");
					if(val){
						$(el).removeClass("on off").addClass("on").html(manager.lng.form.task.status.on);
					}else{
						$(el).removeClass("on off").addClass("off").html(manager.lng.form.task.status.off);
					};
				},
				setName: function(html, val){
					$(html).find("[name=view_taskName]").html(val);
				},
				setTaskId: function(html, val){
					$(html).find("[name=view_taskId]").html(val);
				},
				getTasksHtml: function(){
					var out = [];

					$("[wa_task]:not([default])").each(function(key, task){out.push(task)});

					return out;
				},
				getActiveHtml: function(){
					return $(".active[wa_task]:not([default])")[0];
				},
				toggleNotContent: function(){
					var not_content = $(".tasks .not-content"),
						add_task = $(".main .auth-success .manager [name=not-setting] [name=add-task]"),
						not_setting = $(".main .auth-success .manager [name=not-setting]");

					if(this.getTasksHtml().length == 0){
						$(not_content).show();
						$(not_setting).show();
						$(add_task).show();
					}else{
						$(not_content).hide();
						$(not_setting).hide();
						$(add_task).hide();
					};
				},
				load: function(folderId){
					//delete all tasks
					$(this.getTasksHtml()).remove();
					//add to html
					$.each(WA_ManagerStorage.getFolderById(folderId).getTaskList(), function(key, task){
						manager.forms.task.addHtml(folderId, task.getId());
					});
					$(this.getTasksHtml()).eq(0).click();
					this.toggleNotContent();
				},
				loadSetting: function(folderId, taskId){
					//clear form
					this.settingFormClear();

					var task = WA_ManagerStorage.folders.getFolderById(folderId).getTaskById(taskId),
						inputs = [
						{name: "folderId", value: folderId},//
						{name: "taskId", value: taskId},//
						{name: "name", value: task.getName()},//
						{name: "listId", value: task.getListId()},//
						{name: "afterClick", value: task.getAfterClick()},//
						{name: "beforeClick", value: task.getBeforeClick()},//
						{name: "allowProxy", value: task.getAllowProxy()},//
						{name: "ignoreGU", value: task.getIgnoreGU()},//
						{name: "growth", value: task.getGrowth()},//
						{name: "domain", value: task.getDomain()},//
						{name: "profile", value: task.getProfile()},//
						{name: "frozen", value: task.getFrozen()},
						{name: "listMode", value: task.getListMode()},//
						{name: "rangeSize", value: task.getRangeSize()},//
						{name: "uniquePeriod", value: task.getUniquePeriod()},//
						{name: "mask", value: task.getMask()},//
						{name: "days", value: task.getDays()},//
						{name: "extSource", value: task.getExtSource()}//
					];

					for(var i=0; i<=inputs.length-1; i++){
						var name = inputs[i].name,
							val = inputs[i].value;
						if(name == "listId"){
							if(val != 0){
								$("form[name=task-setting] [name='"+name+"']").val(val).change();
								$("form[name=task-setting] [name=use_listIp]").click();

								var listMode = task.getListMode();
								if(listMode) $("form[name=task-setting] [name=listIp-type][value=true]").prop("checked", true);
								else $("form[name=task-setting] [name=listIp-type][value=false]").prop("checked", true);
							};
						}else if(name == "listMode"){
							continue;
						}else if(name == "mask"){
							if(val != ""){
								$("form[name=task-setting] [name=use_mask]").click();
								$("form[name=task-setting] [name='"+name+"']").val(val);
								$("form[name=task-setting] [name=afterClick]").val(task.getAfterClick());

								$("form[name=task-setting] [name=ignoreGU]").prop("checked", task.getIgnoreGU());
							};
						}else if(name == "afterClick"){
							continue;
						}else if(name == "ignoreGU"){
							continue;
						}else if(name == "allowProxy"){
							$("form[name=task-setting] [name=allowProxy]").prop("checked", !task.getAllowProxy());
						}else if(name == "profile"){
							if(val != ""){
								$("form[name=task-setting] [name=use_profile]").click();
								$("form[name=task-setting] [name=profile]").val(val);
							};
						}else if(name == "frozen"){
							$("#task-status").removeClass("status-off").addClass((val) ? "status-off" : "");
						}else{
							$("form[name=task-setting] [name='"+name+"']").val(val);
						};
					};

					//DayTargeting
					(function(data){
						var lineMin = {
								name: "min",
								data: []
							},
							lineMax = {
								name: "max",
								data: []
							};

						data.sort(function(a,b){return a.id - b.id;});

						$.each(data, function(key, val){
							lineMin.data.push([val.id, val.min]);
							lineMax.data.push([val.id, val.max]);
						});

						manager.data.graphs.dayTargeting.setData([lineMin, lineMax]);
					})(task.getDayTargeting());

					//WeekTargeting
					(function(data){
						var lineMin = {
							name: "min",
							data: []
						};

						data.sort(function(a,b){return a.id - b.id;});

						$.each(data, function(key, val){
							lineMin.data.push([val.id, val.val]);
						});

						manager.data.graphs.weekTargeting.setData([lineMin]);
					})(task.getWeekTargeting());

					//TimeDistribution
					(function(data){
						var lineMin = {
							name: "min",
							data: []
						};

						data.sort(function(a,b){return a.id - b.id;});

						$.each(data, function(key, val){
							if(val.id%5 == 0) lineMin.data.push([val.id, val.val]);
						});

						manager.data.graphs.timeDistribution.setData([lineMin]);
					})(task.getTimeDistribution());

					//GeoTargeting
					(function(data){
						$.each(data, function(key, country){
							manager.data.geoStorage.setTarget(country.id, country.target);
							manager.data.geoStorage.setRecd(country.id, country.recd);
						});

						manager.forms.geo.printInSelectBox(manager.data.geoStorage.getNotSelected());

						//add selected countries
						$.each(manager.data.geoStorage.getSelected(), function(key, country){
							manager.forms.geo.addHtml(country);
						});
					})(task.getGeoTargeting());

					//DayStat
					(function(data){
						var lineMin = {
								name: "min",
								data: []
							},
							lineMax = {
								name: "max",
								data: []
							},
							lineGive = {
								name: "give",
								data: []
							},
							lineIncomplete = {
								name: "incomplete",
								data: []
							},
							lineOverload = {
								name: "overload",
								data: []
							};

						data.sort(function(a,b){return a.id - b.id;});

						$.each(data, function(key, val){
							lineMin.data.push([val.id, val.min]);
							lineMax.data.push([val.id, val.max]);
							lineGive.data.push([val.id, val.give]);
							lineIncomplete.data.push([val.id, val.incomplete]);
							lineOverload.data.push([val.id, val.overload]);
						});

						manager.data.graphs.dayStat.setData([lineMin, lineMax, lineGive, lineIncomplete, lineOverload]);
					})(task.getDayStat());
				},
				settingFormClear: function(){
					var inputs = [
						{name: "name", value: ""},
						{name: "domain", value: ""},
						{name: "extSource", value: ""},
						{name: "beforeClick", value: ""},
						{name: "rangeSize", value: ""},
						{name: "uniquePeriod", value: ""},
						{name: "growth", value: ""},
						{name: "days", value: ""}
					];
					for(var i=0; i<=inputs.length-1; i++) $("form[name=task-setting] [name='"+inputs[i].name+"']").val(inputs[i].value);

					var use_mask = $("form[name=task-setting] [name=use_mask]")[0];
					if(use_mask.checked) $(use_mask).click();

					$("form[name=task-setting] [name=allowProxy]")[0].checked = false;

					var use_profile = $("form[name=task-setting] [name=use_profile]")[0];
					if(use_profile.checked) $(use_profile).click();

					var use_listIp = $("form[name=task-setting] [name=use_listIp]")[0];
					if(use_listIp.checked) $(use_listIp).click();

					manager.data.graphs.dayTargeting.setDefaultState();
					manager.data.graphs.weekTargeting.setDefaultState();
					manager.data.graphs.timeDistribution.setDefaultState();
					manager.data.graphs.dayStat.setDefaultState();

					manager.data.geoStorage.clear();
					//delete all printed countries
					$(manager.forms.geo.getCountriesHtml()).remove();
					$("[name=task-setting] [name=selectBox_country]").html("");

					$("#task-status").removeClass("status-off");

					//check checkbox on graph day stat
					$("#dayStat_cb_max input[type=checkbox], #dayStat_cb_min input[type=checkbox], #dayStat_cb_give input[type=checkbox], #dayStat_cb_incomplete input[type=checkbox], #dayStat_cb_overload input[type=checkbox]").each(function(key, el){
						el.checked = true;
					});
				},
				setStatusFromSettingForm: function(state, switcher){
					var task = WA_ManagerStorage.folders.getFolderById(getParam(manager.forms.task.getActiveHtml(), "folderId")).getTaskById(getParam(manager.forms.task.getActiveHtml(), "taskId"));
					WA_ManagerStorage.api.methods.setTaskStatus({
						token: WA_ManagerStorage.getToken(),
						folderId: getParam(manager.forms.task.getActiveHtml(), "folderId"),
						taskId: getParam(manager.forms.task.getActiveHtml(), "taskId"),
						frozen: !task.getFrozen(),
						callback: function(){
							task.setFrozen(!task.getFrozen());
							manager.forms.task.setStatus(manager.forms.task.getActiveHtml(), task.isEnabled());
						},
						ge_callback: function(){
							if(state) $(switcher).addClass("status-off");
							else $(switcher).removeClass("status-off");
						}
					});
				},
				clear: function(){
					//delete all tasks
					$(this.getTasksHtml()).remove();
					$(".tasks .not-content").hide();
					$(".main .auth-success .manager [name=not-setting]").show();
					$(".main .auth-success .manager [name=not-setting] [name=add-task]").hide();
					$(".main .auth-success .manager [name=not-setting] [name=add-category]").hide();
				}
			},
			geo: {
				printInSelectBox: function(arr){
					var html = "";

					$.each(arr, function(key, country){
						html += '<option value="'+country.id+'">'+country.fullName+'</option>';
					});

					$("[name=task-setting] [name=selectBox_country]").html(html);
				},
				addHtml: function(param){
					var layout = $("[wa_geo_country][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					//add param to html
					$.each(param, function(key, val){setParam(html, key, val)});

					this.setNameHtml(html, getParam(html, "fullName"));
					this.setTargetHtml(html, getParam(html, "target"));
					this.setRecdHtml(html, getParam(html, "recd"));
				},
				setNameHtml: function(html, name){
					$(html).find("[name=view_countryName]").html(name);
				},
				setTargetHtml: function(html, target){
					$(html).find("[name=view_target]").val(target);
					$(html).find("[name=view_target_range]").css("width", target+"%");
				},
				setRecdHtml: function(html, recd){
					$(html).find("[name=view_recd]").val(recd);
					$(html).find("[name=view_recd_range]").css("width", recd+"%");
				},
				getCountriesHtml: function(){
					return $("[wa_geo_country]:not([default])");
				}
			},
			graphHint:{
				show: function(_text, _class, _top, _left){
					var hint = $("#gr-hint")[0];

					hint.className = "gr-hint";

					$(hint).addClass(_class).css({top: _top, left: _left}).fadeIn("fast").find("[name=text]").html(_text);
				},
				hide: function(){
					$("#gr-hint").hide();
				}
			},
			folder_add: {
				show: function(){
					var msg = $("#msg_addFolder").fadeIn("fast"),
						input = $(msg).find("[name=folder_name]");

					$(input).val("");
					$(input).focus();
				},
				hide: function(){
					$("#msg_addFolder .add-box .close").click();
				}
			},
			folder_rename: {
				show: function(el){
					var msg = $("#msg_renameFolder").fadeIn("fast"),
						input_name = $(msg).find("[name=folder_name]"),
						input_id = $(msg).find("[name=folder_id]"),
						folderId = getParam($(el).parents("[wa_folder]"), "id");

					$(input_name).val(WA_ManagerStorage.getFolderById(folderId).getName());
					$(input_name).focus();
					$(input_id).val(folderId);
				},
				hide: function(){
					$("#msg_renameFolder .add-box .close").click();
				}
			},
			folder_remove: {
				show: function(el){
					var msg = $("#confirm_deleteFolder").fadeIn("fast"),
						folderObj = WA_ManagerStorage.getFolderById(getParam($(el).parents("[wa_folder]"), "id"));

					$(msg).find("[name=id]").val(folderObj.getId());
				},
				hide: function(){
					$("#confirm_deleteFolder .close").click();
				}
			}
		},
		logOut: function(){
			WA_ManagerStorage.logOut();
		}
	};

	//datTargeting graph
	manager.events.onDomReady.push(function(){
		manager.data.graphs.dayTargeting = new DayTargeting({
			holder: $("#graph_dayTargeting"),
			onChange: function(data){
				var summ = {};
				$.each(data, function(name, line){
					if(!summ[name]) summ[name] = 0;
					$.each(line, function(key, arr){
						summ[name] += parseInt(arr[1]);
					});
				});

				$("#dayTargeting_cb_min [name=value]").html(summ.min);
				$("#dayTargeting_cb_max [name=value]").html(summ.max);
			}
		});
	});
	//weekTargeting graph
	manager.events.onDomReady.push(function(){
		manager.data.graphs.weekTargeting = new WeekTargeting({
			holder: $("#graph_weekTargeting")
		});
	});
	//dayStat graph
	manager.events.onDomReady.push(function(){
		manager.data.graphs.dayStat = new DayStat({
			holder: $("#graph_dayStat"),
			onChange: function(data){
				var summ = {};
				$.each(data, function(name, line){
					if(!summ[name]) summ[name] = 0;
					$.each(line, function(key, arr){
						summ[name] += parseInt(arr[1]);
					});
				});

				$("#dayStat_cb_min [name=value]").html(summ.min);
				$("#dayStat_cb_max [name=value]").html(summ.max);
				$("#dayStat_cb_give [name=value]").html(summ.give);
				$("#dayStat_cb_incomplete [name=value]").html(summ.incomplete);
				$("#dayStat_cb_overload [name=value]").html(summ.overload);
			}
		});
	});
	//timeDistribution graph
	manager.events.onDomReady.push(function(){
		manager.data.graphs.timeDistribution = new TimeDistribution({
			holder: $("#graph_timeDistribution")
		});
	});
	//change search country
	manager.events.onDomReady.push(function(){
		var input = $("[name=task-setting] [name=searchCountry]")[0],
			oldText = null,
			interval = new WA_ManagerStorage.api.utils.interval(function(){
				if(oldText != input.value){
					manager.forms.geo.printInSelectBox(manager.data.geoStorage.find(input.value));

					oldText = input.value;
				};
			}, 300);
		interval.start();
	});
	//calculate task cost
	manager.events.onDomReady.push(function(){
		var interval = new WA_ManagerStorage.api.utils.interval(function(){
			var beforeClick = $("form[name=task-setting] [name=beforeClick]").val(),
				afterClick = $("form[name=task-setting] [name=afterClick]").val(),
				rangeSize = $("form[name=task-setting] [name=rangeSize]").val(),
				uniquePeriod = $("form[name=task-setting] [name=uniquePeriod]").val();

			$("[name=holder-task-setting] [name=view_taskCost]").html(getTaskCost(
				(isInt(beforeClick)) ? parseInt(beforeClick) : 0,
				(isInt(afterClick)) ? parseInt(afterClick) : 0,
				(isInt(rangeSize)) ? parseInt(rangeSize) : 0,
				(isInt(uniquePeriod)) ? parseInt(uniquePeriod) : 0));
		}, 500);
		interval.start();
	});

	//SET CONSOLE FORM
	$(document).on("submit", "form[name=console_query]", function(e){
		var input = $(this).find("[name=query]"),
			text = $(input).val();

		$(input).val("");

		if(text.length > 0){
			try{
				if(JSON && JSON.parse)JSON.parse(text);
				else eval("v="+text);

				var defaultReceive = {};
				defaultReceive[WA_ManagerStorage.api.Constants.OperationItem.Status] = WA_ManagerStorage.api.Constants.ResponseStatus.GeneralError;
				defaultReceive[WA_ManagerStorage.api.Constants.OperationItem.Error] = WA_ManagerStorage.api.Constants.GeneralError.NoResponse;
				defaultReceive["_defaultReceive"] = true;
				defaultReceive = $.toJSON(defaultReceive);

				var request = new WA_ManagerStorage.api.utils.request(
					WA_ManagerStorage.api.options.server,//url
					text,//data
					null,//callback
					defaultReceive,//default receive data
					WA_ManagerStorage.api.options.timeout,//timeout
					null,//loader show callback
					null,//loader hide callback
					function(txt){
						console_appendText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "CONSOLE\nSend to server: \n-------------------\n" + txt);
					},//log send callback
					function(txt){
						console_appendText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "CONSOLE\nReceive from server: \n-------------------\n" + txt);
					}//log receive callback
				);
				request.send();
			}catch(e){};
		};
	});
	//SET CONSOLE FORM

	//SET AUTH FORM
	$(document).on("submit", "form[name='auth']", function(e){
		var form = this, inputs = {
			mail: this["mail"],
			password: this["password"],
			remember: this["remember"]
		};

		//check form auth data
		if($(form).attr("wa_auth") == 1) return true;

		//check input data
		if(!CheckType(inputs.mail.value, TYPE.MAIL)){
			NoticeShow(manager.lng.form.auth.mail.error, "error");
			$(inputs.mail).focus();
		}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
			NoticeShow(manager.lng.form.auth.password.error, "error");
			$(inputs.password).focus();
		}else{
			WA_ManagerStorage.auth({
				email: inputs.mail.value,
				password: inputs.password.value,
				remember: !inputs.remember.checked,
				exception: {
					NotMatch: function(){
						NoticeShow(manager.lng.exception.query.auth.NotMatch, "error");
						$(inputs.password).focus();
					},
					SessionLimit: function(){
						NoticeShow(manager.lng.exception.query.auth.SessionLimit, "error");
					}
				},
				callback: function(){
					//submit auth form
					$(form).attr("wa_auth", 1);

					DataStorage.set(manager.options.params.authStep, 1);
					DataStorage.set(manager.options.params.authStepNumber, 1);
					DataStorage.set(manager.options.params.authStepToken, WA_ManagerStorage.getToken());

					$(form).find("button[type=submit]").click();
				}
			});
		};

		return false;
	});
	//SET AUTH FORM

	//SET REG FORM
	$(document).on("submit", "form[name='reg']", function(e){
		var form = this, inputs = {
			mail: this["reg_mail"],
			password: this["reg_password"],
			login: this["reg_login"]
		};

		//check input data
		if(!CheckType(inputs.login.value, TYPE.LOGIN)){
			NoticeShow(manager.lng.form.reg.login.error, "error");
			$(inputs.login).focus();
		}else if(!CheckType(inputs.mail.value, TYPE.MAIL)){
			NoticeShow(manager.lng.form.reg.mail.error, "error");
			$(inputs.mail).focus();
		}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
			NoticeShow(manager.lng.form.reg.password.error, "error");
			$(inputs.password).focus();
		}else{
			WA_ManagerStorage.api.methods.register({
				mail: inputs.mail.value,
				password: inputs.password.value,
				login: inputs.login.value,
				exception: {
					MailExists: function(){
						NoticeShow(manager.lng.exception.query.reg.MailExists, "error");
						$(inputs.mail).focus();
					},
					LoginExists: function(){
						NoticeShow(manager.lng.exception.query.reg.LoginExists, "error");
						$(inputs.login).focus();
					},
					Forbidden: function(){
						NoticeShow(manager.lng.exception.query.reg.Forbidden, "error");
					}
				},
				callback: function(data){
					//NoticeShow(manager.lng.form.reg.success, "success");

					var mail = inputs.mail.value,
						pass = inputs.password.value;

					manager.forms.reg.hide({callback: function(){
						manager.forms.auth.show({callback: function(data){
							$(data.mail).val(mail);
							$(data.password).val(pass);
							$(data.form).submit();
						}});
					}});
				}
			});
		};

		return false;
	});
	//SET REG FORM

	//SET FORGOT FORM
	$(document).on("submit", "form[name='forgot']", function(e){
		var form = this, inputs = {
			mail: this["forgot_mail"],
			code: this["forgot_code"],
			password: this["forgot_password"]
		};

		if($(form).attr("wa_step") == 0){
			//check input data
			if(!CheckType(inputs.mail.value, TYPE.MAIL)){
				NoticeShow(manager.lng.form.forgot.mail.error, "error");
				$(inputs.mail).focus();
			}else{
				WA_ManagerStorage.api.methods.resetPassword({
					mail: inputs.mail.value,
					callback: function(){
						NoticeShow(manager.lng.form.forgot.success.step1, "success");
						$(inputs.mail).attr("disabled", "disabled");
						$(inputs.code).removeAttr("disabled");
						$(inputs.code).focus();
						$(inputs.password).removeAttr("disabled");
						$(form).attr("wa_step", 1);
					},
					exception: {
						NotFound: function(){
							NoticeShow(manager.lng.exception.query.resetPassword.NotFound, "error");
							$(inputs.mail).focus();
						}
					}
				});
			};
		}else if($(form).attr("wa_step") == 1){
			//check input data
			if(!CheckType(inputs.code.value, TYPE.CODE_CONFIRM)){
				NoticeShow(manager.lng.form.forgot.code.error, "error");
				$(inputs.code).focus();
			}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
				NoticeShow(manager.lng.form.forgot.password.error, "error");
				$(inputs.password).focus();
			}else{
				WA_ManagerStorage.api.methods.confirmResetPassword({
					mail: inputs.mail.value,
					code: inputs.code.value,
					password: inputs.password.value,
					callback: function(){
						NoticeShow(manager.lng.form.forgot.success.step2, "success");
						manager.methods.forgotFormHide({
							callback: function(){
								manager.forms.auth.show({
									callback: function(data){
										$(data.mail).val(inputs.mail.value);
										$(data.password).val(inputs.password.value);
										$(data.form).submit();
									}
								});
							}
						});
					},
					exception: {
						InvalidCode: function(){
							NoticeShow(manager.lng.exception.query.confirmResetPassword.InvalidCode, "error");
							$(inputs.code).focus();
						}
					}
				});
			};
		};

		return false;
	});
	//SET FORGOT FORM

	//SET ADD NEW FOLDER FORM
	$(document).on("submit","form[name=folder_add]", function(e){
		var form = this, inputs = {
			folder_name: this["folder_name"]
		};

		//check input data
		if(!CheckType(inputs.folder_name.value, TYPE.FOLDER_NAME)){
			NoticeShow(manager.lng.form.folder_add.folder_name.error, "error");
			$(inputs.folder_name).focus();
		}else{
			WA_ManagerStorage.addFolder({
				name: inputs.folder_name.value,
				exception: {
					LimitExceeded: function(){
						NoticeShow(manager.lng.exception.query.addFolder.LimitExceeded, "error");
					}
				},
				callback: function(folderObj){
					manager.forms.folder_add.hide()

					manager.forms.folder.addHtml(folderObj.getId());

					if(manager.forms.folder.getFoldersHtml().length == 1) $(manager.forms.folder.getFoldersHtml()).eq(0).click();
				}
			});
		};

		return false;
	});
	//SET ADD NEW FOLDER FORM

	//SET RENAME FOLDER FORM
	$(document).on("submit","form[name=folder_rename]", function(e){
		var form = this, inputs = {
			folder_name: this["folder_name"],
			id: this["folder_id"]
		};

		//check input data
		if(!CheckType(inputs.folder_name.value, TYPE.FOLDER_NAME)){
			NoticeShow(manager.lng.form.folder_rename.folder_name.error, "error");
			$(inputs.folder_name).focus();
		}else{
			WA_ManagerStorage.renameFolder({
				id: inputs.id.value,
				name: inputs.folder_name.value,
				callback: function(folderObj){
					manager.forms.folder_rename.hide();

					manager.forms.folder.setName(manager.forms.folder.getHtmlById(inputs.id.value), folderObj.getName());
				}
			});
		};

		return false;
	});
	//SET RENAME FOLDER FORM

	//SET CONFIRM DELETE FOLDER
	$(document).on("click","#confirm_deleteFolder [name=yes]", function(e){
		var Self = this,
			folderId = $(Self).parents("#confirm_deleteFolder").find("[name=id]").val();

		WA_ManagerStorage.removeFolder({
			ids: [folderId],
			callback: function(arrFolders){
				manager.forms.folder_remove.hide();

				var folderObj = arrFolders[0],
					folders = manager.forms.folder.getFoldersHtml(),
					folder = manager.forms.folder.getHtmlById(folderObj.getId()),
					isActive = (manager.forms.folder.getActiveHtml() == folder);

				$(folder).remove();

				if(folders.length > 1 && isActive) $(manager.forms.folder.getFoldersHtml()).eq(0).click();

				manager.forms.folder.toggleNotContent();
				manager.forms.task.toggleNotContent();
			}
		});
	});
	//SET CONFIRM DELETE FOLDER

	//SET TASK SETTING FORM
	$(document).on("submit","form[name=task-setting]", function(e){
		var folderId = $(this).find("[name=folderId]").val(),
			taskId = $(this).find("[name=taskId]").val();

		if(!CheckType($(this).find("[name=name]").val(), TYPE.TASK_NAME)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Max
			}), "error");
		}else if(!CheckType($(this).find("[name=domain]").val(), TYPE.TASK_DOMAIN)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.domain.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Max
			}), "error");
		}else if(!CheckType($(this).find("[name=extSource]").val(), TYPE.TASK_EXTSOURCE)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.extSource.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Max
			}), "error");
		}else if(!CheckType($(this).find("[name=beforeClick]").val(), TYPE.TASK_BEFORECLICK)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.beforeClick.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Max
			}), "error");
		}else if(!CheckType($(this).find("[name=afterClick]").val(), TYPE.TASK_AFTERCLICK)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.afterClick.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Max
			}), "error");
		}else if(!CheckType($(this).find("[name=mask]").val(), TYPE.TASK_MASK, true)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.mask.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Mask.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Mask.Length.Max
			}), "error");
		}else if(!CheckType($(this).find("[name=rangeSize]").val(), TYPE.TASK_RANGESIZE)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.rangeSize.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Max,
				"default" : api.Constants.Limit.Task.RangeSize.Value.Default
			}), "error");
		}else if(!CheckType($(this).find("[name=uniquePeriod]").val(), TYPE.TASK_UNIQUEPERIOD)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.uniquePeriod.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Max,
				"default" : api.Constants.Limit.Task.UniquePeriod.Value.Default
			}), "error");
		}else if(!CheckType($(this).find("[name=growth]").val(), TYPE.TASK_GROWTH)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.growth.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Max,
				"default" : api.Constants.Limit.Task.Growth.Value.Default
			}), "error");
		}else if(!CheckType($(this).find("[name=days]").val(), TYPE.TASK_DAYS)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.days.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Max,
				"default" : api.Constants.Limit.Task.Days.Value.Default
			}), "error");
		}else if(!CheckType($(this).find("[name=profile]").val(), TYPE.TASK_PROFILE, true)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.profile.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Profile.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Profile.Length.Max
			}), "error");
		}else{
			alert("GO GO GO блеать....");
		};
	});
	//SET TASK SETTING FORM

	//utils
	var Cookie = {
		get : function(name){
			var cookie = " " + document.cookie;
			var search = " " + name + "=";
			var setStr = null;
			var offset = 0;
			var end = 0;
			if (cookie.length > 0){
				offset = cookie.indexOf(search);
				if (offset != -1){
					offset += search.length;
					end = cookie.indexOf(";", offset);
					if (end == -1) {
						end = cookie.length;
					};
					setStr = unescape(cookie.substring(offset, end));
				};
			};
			return(setStr);
		},
		set : function(name, value, expires, path, domain, secure){
			document.cookie = name + "=" + escape(value) +
				((expires) ? "; expires=" + expires : "") +
				((path) ? "; path=" + path : "") +
				((domain) ? "; domain=" + domain : "") +
				((secure) ? "; secure" : "");
		},
		remove : function(name){
			var cookie_date = new Date ( );
			cookie_date.setTime ( cookie_date.getTime() - 1 );
			document.cookie = name += "=; expires=" + cookie_date.toGMTString();
		},
		getExpiresDataByDay : function(countDays){
			var exdate=new Date();
			exdate.setDate(exdate.getDate() + countDays);
			return exdate.toGMTString();
		}
	};
	var DataStorage = {
		get: function(name){
			if(window.localStorage){
				return window.localStorage[name];
			}else{
				return Cookie.get(name);
			};
		},
		set: function(name, value){
			if(window.localStorage){
				window.localStorage[name] = value;
			}else{
				Cookie.set(name, value, Cookie.getExpiresDataByDay(365));
			};
		},
		remove: function(name){
			if(window.localStorage){
				delete window.localStorage[name];
			}else{
				Cookie.remove(name);
			};
		}
	};
	var Language = manager.utils.language = {
		_lng: {
			"default": "ru-ru",
			ru: "ru-ru",
			en: "en-en",
			ua: "ua-ua"
		},
		_lngDataKey: "WA_MANAGER_UI_LANG",
		get: function(){
			var lang = DataStorage.get(this._lngDataKey);

			$.each(this._lng, function(key, val){
				if(val == lang) return lang;
			});

			return this._lng['default'];
		},
		set: function(lng){
			DataStorage.set(this._lngDataKey, lng);
			window.location.href = "";
		}
	};
	function TranslatePage(){
		$("[wa_lang]").each(function(key, el){
			try{
				var defOptions = {
					element: el,
					text: manager.lng,
					place: false,
					attr: false
				};
				$.each($(el).attr("wa_lang").match(/{[^{}]*}/g), function(key, lng_str){
					var opt = $.extend(true, {}, defOptions);
					lng_str = lng_str.slice(1, -1);
					//fetch lng string
					var endOfText = ((lng_str.indexOf("|") == -1) ? lng_str.length : lng_str.indexOf("|")),
						textPath = lng_str.substr(0,endOfText),
						lngOptions = lng_str.substr(endOfText+1);
					$.each(textPath.split("."), function(key, val){opt.text = opt.text[val];});
					$.each(lngOptions.split(";"),function(key, val){
						var param_arr = val.split(":");
						if(param_arr.length == 2){
							opt[param_arr[0]] = param_arr[1];
						}else{
							opt[param_arr[0]] = null;
						};
					});
					//translate element
					if(opt.attr){
						var text = (($(el).attr(opt.attr) !== undefined) ? $(el).attr(opt.attr) : "");

						if(opt.place){
							text = text.replace(new RegExp("{"+opt.place+"}",'ig'), opt.text);
						}else{
							text = opt.text;
						};

						$(el).attr(opt.attr, text);
					}else{
						var text = (($(el).html() !== undefined) ? $(el).html() : "");

						if(opt.place){
							text = text.replace(new RegExp("{"+opt.place+"}",'ig'), opt.text);
						}else{
							text = opt.text;
						};

						$(el).html(text);
					};
				});
				$(el).removeAttr("wa_lang");
			}catch(e){
				if(console && console.log){
					console.log("Error on translate element:");
					console.log(el);
				};
			};
		});
	};
	function formatDate(formatDate, formatString){
		var yyyy = formatDate.getFullYear();
		var yy = yyyy.toString().substring(2);
		var m = formatDate.getMonth() + 1;
		var mm = m < 10 ? "0" + m : m;
		var d = formatDate.getDate();
		var dd = d < 10 ? "0" + d : d;

		var h = formatDate.getHours();
		var hh = h < 10 ? "0" + h : h;
		var n = formatDate.getMinutes();
		var nn = n < 10 ? "0" + n : n;
		var s = formatDate.getSeconds();
		var ss = s < 10 ? "0" + s : s;

		formatString = formatString.replace(/yyyy/i, yyyy);
		formatString = formatString.replace(/yy/i, yy);
		formatString = formatString.replace(/mm/i, mm);
		formatString = formatString.replace(/m/i, m);
		formatString = formatString.replace(/dd/i, dd);
		formatString = formatString.replace(/d/i, d);
		formatString = formatString.replace(/hh/i, hh);
		formatString = formatString.replace(/h/i, h);
		formatString = formatString.replace(/nn/i, nn);
		formatString = formatString.replace(/n/i, n);
		formatString = formatString.replace(/ss/i, ss);
		formatString = formatString.replace(/s/i, s);

		return formatString;
	};
	function console_appendText(text){
		$(".console-box .console-text .content").append($("<p>"+text.replace(new RegExp("\n",'ig'), "<br>")+"</p>"));
	};
	function NoticeShow(text, type){
		var types = {
				error: "false",
				success: "true"
			},
			timeout_destroy = true,
			selector = ".msg-content[default]",
			parent = $(selector).parent(),
			msg = $(selector).clone().addClass(types[type]).removeAttr("default").appendTo(parent).hide();

		$(msg).find("[name=text]").html(text);
		$(msg).effect("drop", {
			"direction": "down",
			"mode": "show"
		}, function(){
			setTimeout(function(){
				if(timeout_destroy) $(msg).find("[name=close]").click();
			}, 5 * 1000);
		});
		$(msg).hover(function(){
			timeout_destroy = false;
		}, function(){
			timeout_destroy = true;
			setTimeout(function(){
				if(timeout_destroy) $(msg).find("[name=close]").click();
			}, 5 * 1000);
		});
	};
	var TYPE = {
		LOGIN: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Account.Login.Regexp,
			min: WA_ManagerStorage.api.Constants.Limit.Account.Login.Length.Min,
			max: WA_ManagerStorage.api.Constants.Limit.Account.Login.Length.Max
		},
		MAIL: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Account.Mail.Regexp,
			min: WA_ManagerStorage.api.Constants.Limit.Account.Mail.Length.Min,
			max: WA_ManagerStorage.api.Constants.Limit.Account.Mail.Length.Max
		},
		PASSWORD: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Account.Password.Regexp,
			min: WA_ManagerStorage.api.Constants.Limit.Account.Password.Length.Min,
			max: WA_ManagerStorage.api.Constants.Limit.Account.Password.Length.Max
		},
		CODE_CONFIRM: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Max
		},
		FOLDER_NAME: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Folder.Name.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Folder.Name.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Folder.Name.Length.Max
		},
		TASK_NAME: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.Name.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Max
		},
		TASK_DOMAIN: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Max
		},
		TASK_EXTSOURCE: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Max
		},
		TASK_BEFORECLICK: {
			dataType: "int",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Max
		},
		TASK_AFTERCLICK: {
			dataType: "int",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Max
		},
		TASK_MASK: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.Mask.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.Mask.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.Mask.Length.Max
		},
		TASK_RANGESIZE: {
			dataType: "int",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Max
		},
		TASK_UNIQUEPERIOD: {
			dataType: "int",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Max
		},
		TASK_GROWTH: {
			dataType: "int",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.Growth.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Max
		},
		TASK_DAYS: {
			dataType: "int",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.Days.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Max
		},
		TASK_PROFILE: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.Task.Profile.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.Task.Profile.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.Task.Profile.Length.Max
		}
	};
	function CheckType(_data, _type, _allowEmpty){
		var out = true;

		switch(_type.dataType){
			case "text":
				if(_allowEmpty && _data.length == 0) out = true;
				else if(_data.search(_type.regexp) == 0 && _data.length >= _type.min && _data.length <= _type.max) out = true;
				else out = false;
				break;
			case "int":
				if(_allowEmpty && _data.toString().length == 0) out = true;
				else if(!_allowEmpty && _data.toString().length == 0) out = false;
				else if(_data.toString().search(_type.regexp) == 0 && _data >= _type.min && _data <= _type.max) out = true;
				else out = false;
				break;
			default:
				out = false;
		};

		return out;
	};
	function getParam(html, param){
		return $(html).find("input[name='"+param+"']").val();
	};
	function setParam(html, param, val){
		var el = $(html).find("input[name='"+param+"']");
		if(el.length == 0){
			$('<input type="hidden" name="'+param+'" value="'+val+'">').appendTo(html);
		}else{
			$(el).val(val);
		};
	};
	function DayTargeting(_opt){
		var defPoints = []; for(var i=0; i<=23; i++) defPoints.push([i, 0]);
		var def_lines = [
			{
				name: "min",
				show: true,
				data: defPoints,
				color: "rgba(64,153,255,1)", //цвет линии графика
				shadowSize: 3,
				lines: {
					show: true,
					fill: false,
					fillColor: "rgba(255,255,255,0)",
					lineWidth: 1.5//толщина линий
				},
				points:{
					show: true,
					fill: true,
					fillColor: 'rgba(255,255,255,1)',
					lineWidth: 1.2, //толщина линии точки
					radius: 2.5, //радиус точки
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			},
			{
				name: "max",
				show: true,
				data : defPoints,
				color: "rgba(255,95,45,1)", //цвет линии графика
				shadowSize: 3,
				lines: {
					show: true,
					fill: false,
					fillColor: 'rgba(255,255,255,0)', //цвет заливки области графика
					lineWidth: 1.5//толщина линий
				},
				points:{
					show: true,
					fill: true,
					fillColor: 'rgba(255,255,255,1)',
					lineWidth: 1.2, //толщина линии точки
					radius: 2.5, //радиус точки
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			}
		];

		var SelfObj = this,
			options = $.extend(true, {
				holder: document.body,
				onChange: function(data){},
				graphOptions: {
					xaxis: {
						showValue: true,
						min: 0,
						max: 23,
						tickSize: 1
					},
					yaxis: {
						showValue: true,
						min:0,
						max: 50,
						maxDefault: 50,
						maxValue: 100000,
						tickSize: 5,
						tickFormatter: function (v) { return DataFormat.int(v); }
					},
					grid: {
						hoverable:true,
						clickable:true,
						color:"#222",
						backgroundColor: {
							colors:["rgba(50,50,50,1)", "rgba(35,35,35,1)"]
						},
						tickColor:"rgba(70,70,70,1)",
						labelMargin:5,
						borderWidth:0,
						mouseActiveRadius:8
					}
				},
				lines: [],
				events: [
					function(){
						$(options.holder).mousedown(function(e){
							return false;
						});
					},
					//show tooltip
					function(){
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(item){
								var x = item.datapoint[0].toFixed(0),
									y = item.datapoint[1].toFixed(0),
									name = item.series.name,
									itemsCount = 1,
									hint_text = manager.lng.form.task_setting.dayTargeting[name] + ": " + y;

								$.each(SelfObj.graph.getData(), function(key, series){
									if(series.name == name) return;

									//search matches items
									$.each(series.data, function(key, arr){
										if(arr[0] == x && arr[1] == y){
											itemsCount++;

											hint_text += "<br />" + manager.lng.form.task_setting.dayTargeting[series.name] + ": " + y;
										};
									});
								});

								manager.forms.graphHint.show(x + ":00 - " + ((x == 23) ? "0" : (parseInt(x)+1)) + ":00" + "<br />" + hint_text, ((itemsCount == 1) ? item.series.name : ""), item.pageY - 15, item.pageX + 15);
							}else{
								manager.forms.graphHint.hide();
							};
						});
					},
					//redraw
					function(){
						var reDraw = false, graphMax = false, graphMin = false;
						$(options.holder).mousedown(function(e) {
							reDraw = true;
							if(e.shiftKey) graphMax = true;
							else if(e.ctrlKey) graphMin = true;
						});
						$(window).mouseup(function(e) {
							reDraw = false;
							graphMax = false;
							graphMin = false;
						});
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(reDraw && (graphMax || graphMin)){
								var x = parseInt(pos.x),
									y = parseInt(pos.y),
									data = SelfObj.graph.getData(),
									idGraphMin = getIdGraph(data, "min"),
									idGraphMax = getIdGraph(data, "max"),
									xMax = data[0].xaxis.max,
									xMin = data[0].xaxis.min,
									yMax = data[0].yaxis.max,
									yMin = data[0].yaxis.min;

								if(x < xMin) x = xMin;
								else if(x > xMax) x = xMax;
								if(y > yMax) y = yMax;
								if(y < yMin) y = yMin;

								if(graphMax){
									data[idGraphMax].data[x][1] = y;

									if(idGraphMin == -1){
										if(y < searchLineInOption("min").data[x][1]) searchLineInOption("min").data[x][1] = y;
									}else{
										if(y < data[idGraphMin].data[x][1]) data[idGraphMin].data[x][1] = y;
									};
								}else if(graphMin){
									if(idGraphMax == -1){
										if(y > searchLineInOption("max").data[x][1]) data[idGraphMin].data[x][1] = searchLineInOption("max").data[x][1];
										else data[idGraphMin].data[x][1] = y;
									}else{
										if(y > data[idGraphMax].data[x][1]) data[idGraphMin].data[x][1] = data[idGraphMax].data[x][1];
										else data[idGraphMin].data[x][1] = y;
									};
								};

								SelfObj.graph.setData(data);
								SelfObj.graph.draw();
								options.onChange(SelfObj.getData());
							};
						});

						function getIdGraph(data, graphName){
							for(var i=0;i<data.length;i++){
								if(graphName == data[i].name) return i;
							};

							return -1;
						};
					},
					//change yTickSize
					function(){
						$(options.holder).mousewheel(function(e, delta){
							var curData = SelfObj.graph.getData(),
								tickSize = curData[0].yaxis.tickSize,
								yAxisMax = curData[0].yaxis.max,
								yAxisDefault = curData[0].yaxis.options.maxDefault,
								yAxisMaxValue = curData[0].yaxis.options.maxValue,
								yMax = yAxisMax;

							if(yAxisMax + delta * tickSize > yAxisDefault){
								yMax = yAxisMax + delta * tickSize;
								if(yMax > yAxisMaxValue) yMax = yAxisMaxValue;
							}else{
								yMax = yAxisDefault;
							};

							SelfObj.setMaxYAxis(yMax, Math.floor(yMax/10));
						});
					}
				]
			}, {lines: def_lines}, _opt);

		function constructor(){
			SelfObj.initGraph(true);
		};

		//PROPERTIES
		this.graph = false;

		//METHODS
		this.initGraph = function(bindEvents){
			var lines = [];
			$.each(options.lines, function(key, line){
				if(line.show) lines.push(line);
			});
			$(options.holder).hide();
			SelfObj.graph = $.plot(options.holder, lines, options.graphOptions);
			$(options.holder).show();
			if(bindEvents) $.each(options.events, function(key, func){
				func();
			});
		};
		this.setData = function(arr){
			var curData = SelfObj.graph.getData(),
				maxY = 0;

			for(var i=0; i<=arr.length-1; i++) searchGraphInData(arr[i].name, curData).data = arr[i].data;

			var _y = getMaxY(curData);
			maxY = ((_y < options.graphOptions.yaxis.maxDefault) ? options.graphOptions.yaxis.maxDefault : _y);

			SelfObj.graph.setData(curData);
			SelfObj.graph.draw(maxY);

			SelfObj.setMaxYAxis(maxY, Math.floor(maxY/10));
			options.onChange(SelfObj.getData());

			function searchGraphInData(name, data){
				for(var i=0; i<=data.length-1; i++)if(data[i].name == name) return data[i];
			};
			function getMaxY(data){
				var arr = [];

				$.each(data, function(key, line){
					$.each(line.data, function(key, val){
						arr.push(val[1]);
					});
				});

				arr.sort(function(a,b){return a-b;});

				return arr[arr.length-1];
			};
		};
		this.setMaxYAxis = function(maxYAxis, YAxisTickSize, XAxisTickSize){
			var curData = SelfObj.graph.getData();

			$.each(curData, function(key, line){
				searchLineInOption(line.name).data = line.data;
			});

			if(maxYAxis) options.graphOptions.yaxis.max = maxYAxis;
			if(YAxisTickSize) options.graphOptions.yaxis.tickSize = YAxisTickSize;
			if(XAxisTickSize) options.graphOptions.xaxis.tickSize = XAxisTickSize;

			SelfObj.graph.shutdown();
			SelfObj.initGraph();
		};
		this.getData = function(){
			var data = SelfObj.graph.getData(), output = {};

			$.each(data, function(key, val){
				output[val.name] = val.data;
			});

			//проверяем на присутствие всех графиков, если какой то отсутствует, берем значения из стандартных опций
			$.each(options.lines, function(key, line){
				if(!output[line.name]) output[line.name] = line.data;
			});

			return output;
		};
		this.lineVisibility = function(lineName, state){
			searchLineInOption(lineName).show = state;
			SelfObj.initGraph();
		};
		this.setDefaultState = function(){
			$.each(getListLineNames(), function(key, name){
				SelfObj.lineVisibility(name, true);
			});
			SelfObj.setData(def_lines);
		};

		//functions
		function searchLineInOption(lineName){
			for(var i=0; i<= options.lines.length-1; i++) if(options.lines[i].name == lineName) return options.lines[i];
		};
		function getListLineNames(){
			var out = [];

			$.each(options.lines, function(key, line){
				out.push(line.name);
			});

			return out;
		};

		//INIT
		constructor();
	};
	function WeekTargeting(_opt){
		var defPoints = []; for(var i=0; i<=6; i++) defPoints.push([i, 100]);
		var def_lines = [
			{
				name: "min",
				show: true,
				data: defPoints,
				color : "rgba(0,79,163,0.7)",//цвет линии графика
				shadowSize : 0,//размер тени
				lines : {
					show : true,//вкл/выкл линию графика
					fill : true,//вкл/выкл заливку области графика
					fillColor : 'rgba(0,79,163,0.07)',//цвет заливки области графика
					lineWidth : 1//толщина линий
				},
				points: {
					show : true,//вкл/выкл точки на линиях графиков
					fill : true,//вкл/выкл заливку
					fillColor : 'rgba(255,255,255,1)',//цвет заливки точки
					lineWidth : 1,//толщина линии точки
					radius : 2,//радиус точки
					color: 'rgba(255,255,255,1)',//цвет точки
					values: {
						show: false,//вкл/выкл отображение значений в точках
						font : "normal 11px arial",//шрифт текста значений
						color: 'rgba(71,1,2,1)',//цвет текста значений
						margin: 5//расстояние от точки до значения
					}
				}
			}
		];

		var SelfObj = this,
			options = $.extend(true, {
				holder: document.body,
				onChange: function(data){},
				graphOptions: {
					xaxis : {
						showValue : true, //показывать или нет значения
						min : 0,
						max : 6,
						tickSize : 1,//шаг
						tickFormatter: function (v) { return manager.lng.form.task_setting.weekTargeting.days[v].short; }
					},
					yaxis : {
						showValue : true, //показывать или нет значения
						min : 0,
						max : 100,
						maxDefault: 100,
						tickSize : 25,//шаг
						tickFormatter: function (v) { return v+"%"; }
					},
					grid : {
						hoverable : true,
						clickable : true,
						color : '#000',//цвет меток(числа 1 2 3 4 5 6 и т.д.)
						backgroundColor : {
							colors : ["rgba(255,255,255,1)", "rgba(233,233,233,1)"]
						},//цвет заливки сетки
						tickColor : 'rgba(0,0,0,.1)',//цвет самой сетки
						labelMargin : 5,//растояние от метки до сетки
						borderWidth : 4,//ширина рамки по краю сетки
						mouseActiveRadius : 8//радиус активной точки
					}
				},
				lines: [],
				events: [
					function(){
						$(options.holder).mousedown(function(e){
							return false;
						});
					},
					//show tooltip
					function(){
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(item){
								var x = item.datapoint[0].toFixed(0),
									y = item.datapoint[1].toFixed(2),
									hint_text = manager.lng.form.task_setting.weekTargeting.tooltip.title + "<br>" + manager.lng.form.task_setting.weekTargeting.days[x].full + ": " + y + "%";

								manager.forms.graphHint.show(hint_text, item.series.name, item.pageY - 15, item.pageX + 15);
							}else{
								manager.forms.graphHint.hide();
							};
						});
					},
					//redraw
					function(){
						var reDraw = false, graphMax = false, graphMin = false;
						$(options.holder).mousedown(function(e) {
							reDraw = true;
						});
						$(window).mouseup(function(e) {
							reDraw = false;
						});
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(reDraw){
								var x = Math.round(pos.x),
									y = parseFloat(pos.y).toFixed(2),
									data = SelfObj.graph.getData(),
									idGraphMin = getIdGraph(data, "min"),
									xMax = data[0].xaxis.max,
									xMin = data[0].xaxis.min,
									yMax = data[0].yaxis.max,
									yMin = data[0].yaxis.min;

								if(x < xMin) x = xMin;
								else if(x > xMax) x = xMax;
								if(y > yMax) y = yMax;
								if(y < yMin) y = yMin;

								data[idGraphMin].data[x][1] = y;

								SelfObj.graph.setData(data);
								SelfObj.graph.draw();
								options.onChange(SelfObj.getData());
							};
						});

						function getIdGraph(data, graphName){
							for(var i=0;i<data.length;i++){
								if(graphName == data[i].name) return i;
							};

							return -1;
						};
					},
					//change yTickSize
					function(){
						$(options.holder).mousewheel(function(e, delta){
							var curData = SelfObj.graph.getData(),
								tickSize = curData[0].yaxis.tickSize,
								yAxisMax = curData[0].yaxis.max,
								yAxisMin = curData[0].yaxis.min,
								yAxisDefault = curData[0].yaxis.options.maxDefault,
								yMax = yAxisMax;

							if(yAxisMax + delta * tickSize > yAxisDefault){
								yMax = yAxisDefault;
							}else if(yAxisMax + delta * tickSize < yAxisDefault && yAxisMax + delta * tickSize > yAxisMin){
								yMax = yAxisMax + delta * tickSize;
							}else{
								yMax = 1;
							};

							SelfObj.setMaxYAxis(yMax, ((Math.floor(yMax/4)) >= 1) ? Math.floor(yMax/4) : 1);
						});
					}
				]
			}, {lines: def_lines}, _opt);

		function constructor(){
			SelfObj.initGraph(true);
		};

		//PROPERTIES
		this.graph = false;

		//METHODS
		this.initGraph = function(bindEvents){
			var lines = [];
			$.each(options.lines, function(key, line){
				if(line.show) lines.push(line);
			});
			$(options.holder).hide();
			SelfObj.graph = $.plot(options.holder, lines, options.graphOptions);
			$(options.holder).show();
			if(bindEvents) $.each(options.events, function(key, func){
				func();
			});
		};
		this.setData = function(arr){
			var curData = SelfObj.graph.getData();

			for(var i=0; i<=arr.length-1; i++) searchGraphInData(arr[i].name, curData).data = arr[i].data;

			SelfObj.graph.setData(curData);
			SelfObj.graph.draw();

			options.onChange(SelfObj.getData());

			function searchGraphInData(name, data){
				for(var i=0; i<=data.length-1; i++)if(data[i].name == name) return data[i];
			};
		};
		this.setMaxYAxis = function(maxYAxis, YAxisTickSize, XAxisTickSize){
			var curData = SelfObj.graph.getData();

			$.each(curData, function(key, line){
				searchLineInOption(line.name).data = line.data;
			});

			if(maxYAxis) options.graphOptions.yaxis.max = maxYAxis;
			if(YAxisTickSize) options.graphOptions.yaxis.tickSize = YAxisTickSize;
			if(XAxisTickSize) options.graphOptions.xaxis.tickSize = XAxisTickSize;

			SelfObj.graph.shutdown();
			SelfObj.initGraph();
		};
		this.getData = function(){
			var data = SelfObj.graph.getData(), output = {};

			$.each(data, function(key, val){
				output[val.name] = val.data;
			});

			//проверяем на присутствие всех графиков, если какой то отсутствует, берем значения из стандартных опций
			$.each(options.lines, function(key, line){
				if(!output[line.name]) output[line.name] = line.data;
			});

			return output;
		};
		this.lineVisibility = function(lineName, state){
			searchLineInOption(lineName).show = state;
			SelfObj.initGraph();
		};
		this.setDefaultState = function(){
			$.each(getListLineNames(), function(key, name){
				SelfObj.lineVisibility(name, true);
			});
			SelfObj.setData(def_lines);
		};

		//functions
		function searchLineInOption(lineName){
			for(var i=0; i<= options.lines.length-1; i++) if(options.lines[i].name == lineName) return options.lines[i];
		};
		function getListLineNames(){
			var out = [];

			$.each(options.lines, function(key, line){
				out.push(line.name);
			});

			return out;
		};

		//INIT
		constructor();
	};
	function DayStat(_opt){
		var defPoints = []; for(var i=0; i<=23; i++) defPoints.push([i, 0]);
		var def_lines = [
			{
				name: "give",
				show: true,
				data: defPoints,
				color: "rgba(120,255,0,1)",
				shadowSize: 3,
				tooltipOrder: 3,
				lines: {
					show: true,
					fill: true,
					fillColor: "rgba(120,255,0,0.15)",
					lineWidth: 2
				},
				points: {
					show: true,
					fill: true,
					fillColor: "rgba(0,90,0,1)",
					lineWidth: 2,
					radius: 3,
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			},
			{
				name: "incomplete",
				show: true,
				data : defPoints,
				color: "rgba(255,0,208,1)", //цвет линии графика
				shadowSize: 3,
				tooltipOrder: 4,
				lines: {
					show: true,
					fill: true,
					fillColor: "rgba(255,0,208,0.3)", //цвет заливки области графика
					lineWidth: 1.5//толщина линий
				},
				points:{
					show: true,
					fill: true,
					fillColor: "rgba(95,0,33,1)",
					lineWidth: 1.2, //толщина линии точки
					radius: 2.5, //радиус точки
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			},
			{
				name: "overload",
				show: true,
				data : defPoints,
				color: "rgba(255,200,0,1)", //цвет линии графика
				shadowSize: 3,
				tooltipOrder: 5,
				lines:{
					show: true,
					fill: true,
					fillColor: "rgba(255,200,0,0.1)", //цвет заливки области графика
					lineWidth: 1.5//толщина линий
				},
				points:{
					show: true,
					fill: true,
					fillColor: "rgba(167,118,0,1)",
					lineWidth: 1.2, //толщина линии точки
					radius: 2.5, //радиус точки
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			},
			{
				name: "min",
				show: true,
				data: defPoints,
				color: "rgba(64,153,255,1)", //цвет линии графика
				shadowSize: 3,
				tooltipOrder: 1,
				lines: {
					show: true,
					fill: false,
					fillColor: "rgba(255,255,255,0)",
					lineWidth: 1.5//толщина линий
				},
				points:{
					show: true,
					fill: true,
					fillColor: 'rgba(255,255,255,1)',
					lineWidth: 1.2, //толщина линии точки
					radius: 2.5, //радиус точки
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			},
			{
				name: "max",
				show: true,
				data : defPoints,
				color: "rgba(255,95,45,1)", //цвет линии графика
				shadowSize: 3,
				tooltipOrder: 2,
				lines: {
					show: true,
					fill: false,
					fillColor: 'rgba(255,255,255,0)', //цвет заливки области графика
					lineWidth: 1.5//толщина линий
				},
				points:{
					show: true,
					fill: true,
					fillColor: 'rgba(255,255,255,1)',
					lineWidth: 1.2, //толщина линии точки
					radius: 2.5, //радиус точки
					color: "rgba(255,255,255,1)",
					values: {
						show: false,
						font: "normal 11px arial",
						color: "rgba(1,1,1,1)",
						margin: 5
					}
				}
			}
		];

		var SelfObj = this,
			options = $.extend(true, {
				holder: document.body,
				onChange: function(data){},
				graphOptions: {
					xaxis: {
						showValue: true,
						min: 0,
						max: 23,
						tickSize: 1
					},
					yaxis: {
						showValue: true,
						min:0,
						max: 50,
						maxDefault: 50,
						maxValue: 100000,
						tickSize: 5,
						tickFormatter: function (v) { return DataFormat.int(v); }
					},
					grid: {
						hoverable:true,
						clickable:true,
						color:"#222",
						backgroundColor: {
							colors:["rgba(50,50,50,1)", "rgba(35,35,35,1)"]
						},
						tickColor:"rgba(70,70,70,1)",
						labelMargin:5,
						borderWidth:0,
						mouseActiveRadius:8
					}
				},
				lines: [],
				events: [
					function(){
						$(options.holder).mousedown(function(e){
							return false;
						});
					},
					//show tooltip
					function(){
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(item){
								var x = item.datapoint[0].toFixed(0),
									y = item.datapoint[1].toFixed(0),
									name = item.series.name,
									itemsCount = 1,
									texts = [],
									text = "";
								texts.push({
									text: manager.lng.form.task_setting.dayStat[name] + ": " + y,
									order: item.series.tooltipOrder
								});

								$.each(SelfObj.graph.getData(), function(key, series){
									if(series.name == name) return;

									//search matches items
									$.each(series.data, function(key, arr){
										if(arr[0] == x && arr[1] == y){
											itemsCount++;

											texts.push({
												text: manager.lng.form.task_setting.dayStat[series.name] + ": " + y,
												order: series.tooltipOrder
											});
										};
									});
								});

								texts.sort(function(a,b){return a.order- b.order;});
								$.each(texts, function(key, val){
									text += val.text + "<br>";
								});

								manager.forms.graphHint.show(x + ":00 - " + ((x == 23) ? "0" : (parseInt(x)+1)) + ":00" + "<br />" + text, ((itemsCount == 1) ? item.series.name : ""), item.pageY - 15, item.pageX + 15);
							}else{
								manager.forms.graphHint.hide();
							};
						});
					},
					//change yTickSize
					function(){
						$(options.holder).mousewheel(function(e, delta){
							var curData = SelfObj.graph.getData(),
								tickSize = curData[0].yaxis.tickSize,
								yAxisMax = curData[0].yaxis.max,
								yAxisDefault = curData[0].yaxis.options.maxDefault,
								yAxisMaxValue = (getMaxY(curData) <= options.graphOptions.yaxis.maxDefault) ? options.graphOptions.yaxis.maxDefault : getMaxY(curData),
								yMax = yAxisMax;

							if(yAxisMax + delta * tickSize > yAxisDefault){
								yMax = yAxisMax + delta * tickSize;
								if(yMax > yAxisMaxValue) yMax = yAxisMaxValue;
							}else{
								yMax = yAxisDefault;
							};

							SelfObj.setMaxYAxis(yMax, Math.floor(yMax/10));
						});

						function getMaxY(data){
							var arr = [];

							$.each(data, function(key, line){
								$.each(line.data, function(key, val){
									arr.push(val[1]);
								});
							});

							arr.sort(function(a,b){return a-b;});

							return arr[arr.length-1];
						};
					}
				]
			}, {lines: def_lines}, _opt);

		function constructor(){
			SelfObj.initGraph(true);
		};

		//PROPERTIES
		this.graph = false;

		//METHODS
		this.initGraph = function(bindEvents){
			var lines = [];
			$.each(options.lines, function(key, line){
				if(line.show) lines.push(line);
			});
			$(options.holder).hide();
			SelfObj.graph = $.plot(options.holder, lines, options.graphOptions);
			$(options.holder).show();
			if(bindEvents) $.each(options.events, function(key, func){
				func();
			});
		};
		this.setData = function(arr){
			var curData = SelfObj.graph.getData(),
				maxY = 0;

			for(var i=0; i<=arr.length-1; i++) searchGraphInData(arr[i].name, curData).data = arr[i].data;

			var _y = getMaxY(curData);
			maxY = ((_y < options.graphOptions.yaxis.maxDefault) ? options.graphOptions.yaxis.maxDefault : _y);

			SelfObj.graph.setData(curData);
			SelfObj.graph.draw(maxY);

			SelfObj.setMaxYAxis(maxY, Math.floor(maxY/10));
			options.onChange(SelfObj.getData());

			function searchGraphInData(name, data){
				for(var i=0; i<=data.length-1; i++)if(data[i].name == name) return data[i];
			};
			function getMaxY(data){
				var arr = [];

				$.each(data, function(key, line){
					$.each(line.data, function(key, val){
						arr.push(val[1]);
					});
				});

				arr.sort(function(a,b){return a-b;});

				return arr[arr.length-1];
			};
		};
		this.setMaxYAxis = function(maxYAxis, YAxisTickSize, XAxisTickSize){
			var curData = SelfObj.graph.getData();

			$.each(curData, function(key, line){
				searchLineInOption(line.name).data = line.data;
			});

			if(maxYAxis) options.graphOptions.yaxis.max = maxYAxis;
			if(YAxisTickSize) options.graphOptions.yaxis.tickSize = YAxisTickSize;
			if(XAxisTickSize) options.graphOptions.xaxis.tickSize = XAxisTickSize;

			SelfObj.graph.shutdown();
			SelfObj.initGraph();
		};
		this.getData = function(){
			var data = SelfObj.graph.getData(), output = {};

			$.each(data, function(key, val){
				output[val.name] = val.data;
			});

			//проверяем на присутствие всех графиков, если какой то отсутствует, берем значения из стандартных опций
			$.each(options.lines, function(key, line){
				if(!output[line.name]) output[line.name] = line.data;
			});

			return output;
		};
		this.lineVisibility = function(lineName, state){
			searchLineInOption(lineName).show = state;
			SelfObj.initGraph();
		};
		this.setDefaultState = function(){
			$.each(getListLineNames(), function(key, name){
				SelfObj.lineVisibility(name, true);
			});
			SelfObj.setData(def_lines);
		};

		//functions
		function searchLineInOption(lineName){
			for(var i=0; i<= options.lines.length-1; i++) if(options.lines[i].name == lineName) return options.lines[i];
		};
		function getListLineNames(){
			var out = [];

			$.each(options.lines, function(key, line){
				out.push(line.name);
			});

			return out;
		};

		//INIT
		constructor();
	};
	function TimeDistribution(_opt){
		var defPoints = []; for(var i=5; i<=100; i+=5) defPoints.push([i, 0]);
		var def_lines = [
			{
				name: "min",
				show: true,
				data: defPoints,
				color : "rgba(0,79,163,0.7)",//цвет линии графика
				shadowSize : 0,//размер тени
				lines : {
					show : true,//вкл/выкл линию графика
					fill : true,//вкл/выкл заливку области графика
					fillColor : 'rgba(0,79,163,0.07)',//цвет заливки области графика
					lineWidth : 1//толщина линий
				},
				points: {
					show : true,//вкл/выкл точки на линиях графиков
					fill : true,//вкл/выкл заливку
					fillColor : 'rgba(255,255,255,1)',//цвет заливки точки
					lineWidth : 1,//толщина линии точки
					radius : 2,//радиус точки
					color: 'rgba(255,255,255,1)',//цвет точки
					values: {
						show: false,//вкл/выкл отображение значений в точках
						font : "normal 11px arial",//шрифт текста значений
						color: 'rgba(71,1,2,1)',//цвет текста значений
						margin: 5//расстояние от точки до значения
					}
				}
			}
		];

		var SelfObj = this,
			options = $.extend(true, {
				holder: document.body,
				onChange: function(data){},
				graphOptions: {
					xaxis : {
						showValue : true, //показывать или нет значения
						min : 5,
						max : 100,
						tickSize : 5,//шаг
						tickFormatter: function (v) { return v + "%"; }
					},
					yaxis : {
						showValue : true, //показывать или нет значения
						min : 0,
						max : 50,
						maxDefault: 50,
						maxValue: 999,
						tickSize : 5,//шаг
						tickFormatter: function (v) { return v; }
					},
					grid : {
						hoverable : true,
						clickable : true,
						color : '#000',//цвет меток(числа 1 2 3 4 5 6 и т.д.)
						backgroundColor : {
							colors : ["rgba(255,255,255,1)", "rgba(233,233,233,1)"]
						},//цвет заливки сетки
						tickColor : 'rgba(0,0,0,.1)',//цвет самой сетки
						labelMargin : 5,//растояние от метки до сетки
						borderWidth : 4,//ширина рамки по краю сетки
						mouseActiveRadius : 8//радиус активной точки
					}
				},
				lines: [],
				events: [
					function(){
						$(options.holder).mousedown(function(e){
							return false;
						});
					},
					//show tooltip
					function(){
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(item){
								var x = item.datapoint[0].toFixed(0),
									y = item.datapoint[1].toFixed(0),
									hint_text = manager.lng.form.task_setting.timeDistribution.priority + " " + y + "<br>" + manager.lng.form.task_setting.timeDistribution.percent + " " + x + "%";

								manager.forms.graphHint.show(hint_text, item.series.name, item.pageY - 15, item.pageX + 15);
							}else{
								manager.forms.graphHint.hide();
							};
						});
					},
					//redraw
					function(){
						var reDraw = false, graphMax = false, graphMin = false;
						$(options.holder).mousedown(function(e) {
							reDraw = true;
						});
						$(window).mouseup(function(e) {
							reDraw = false;
						});
						$(options.holder).bind("plothover", function(event, pos, item) {
							if(reDraw){
								var x = Math.round(pos.x),
									y = parseFloat(pos.y).toFixed(0),
									data = SelfObj.graph.getData(),
									idGraphMin = getIdGraph(data, "min"),
									xMax = data[0].xaxis.max,
									xMin = data[0].xaxis.min,
									yMax = data[0].yaxis.max,
									yMin = data[0].yaxis.min;

								if(x < xMin) x = xMin;
								else if(x > xMax) x = xMax;
								if(y > yMax) y = yMax;
								if(y < yMin) y = yMin;

								if(x%5 == 0){
									data[idGraphMin].data[x/5-1][1] = y;

									SelfObj.graph.setData(data);
									SelfObj.graph.draw();
									options.onChange(SelfObj.getData());
								};
							};
						});

						function getIdGraph(data, graphName){
							for(var i=0;i<data.length;i++){
								if(graphName == data[i].name) return i;
							};

							return -1;
						};
					},
					//change yTickSize
					function(){
						$(options.holder).mousewheel(function(e, delta){
							var curData = SelfObj.graph.getData(),
								tickSize = curData[0].yaxis.tickSize,
								yAxisMax = curData[0].yaxis.max,
								yAxisDefault = curData[0].yaxis.options.maxDefault,
								yAxisMaxValue = curData[0].yaxis.options.maxValue,
								yMax = yAxisMax;

							if(yAxisMax + delta * tickSize > yAxisDefault){
								yMax = yAxisMax + delta * tickSize;
								if(yMax > yAxisMaxValue) yMax = yAxisMaxValue;
							}else{
								yMax = yAxisDefault;
							};

							SelfObj.setMaxYAxis(yMax, Math.floor(yMax/10));
						});
					}
				]
			}, {lines: def_lines}, _opt);

		function constructor(){
			SelfObj.initGraph(true);
		};

		//PROPERTIES
		this.graph = false;

		//METHODS
		this.initGraph = function(bindEvents){
			var lines = [];
			$.each(options.lines, function(key, line){
				if(line.show) lines.push(line);
			});
			$(options.holder).hide();
			SelfObj.graph = $.plot(options.holder, lines, options.graphOptions);
			$(options.holder).show();
			if(bindEvents) $.each(options.events, function(key, func){
				func();
			});
		};
		this.setData = function(arr){
			var curData = SelfObj.graph.getData(),
				maxY = 0;

			for(var i=0; i<=arr.length-1; i++) searchGraphInData(arr[i].name, curData).data = arr[i].data;

			var _y = getMaxY(curData);
			maxY = ((_y < options.graphOptions.yaxis.maxDefault) ? options.graphOptions.yaxis.maxDefault : _y);

			SelfObj.graph.setData(curData);
			SelfObj.graph.draw();

			SelfObj.setMaxYAxis(maxY, Math.floor(maxY/10));
			options.onChange(SelfObj.getData());

			function searchGraphInData(name, data){
				for(var i=0; i<=data.length-1; i++)if(data[i].name == name) return data[i];
			};
			function getMaxY(data){
				var arr = [];

				$.each(data, function(key, line){
					$.each(line.data, function(key, val){
						arr.push(val[1]);
					});
				});

				arr.sort(function(a,b){return a-b;});

				return arr[arr.length-1];
			};
		};
		this.setMaxYAxis = function(maxYAxis, YAxisTickSize, XAxisTickSize){
			var curData = SelfObj.graph.getData();

			$.each(curData, function(key, line){
				searchLineInOption(line.name).data = line.data;
			});

			if(maxYAxis) options.graphOptions.yaxis.max = maxYAxis;
			if(YAxisTickSize) options.graphOptions.yaxis.tickSize = YAxisTickSize;
			if(XAxisTickSize) options.graphOptions.xaxis.tickSize = XAxisTickSize;

			SelfObj.graph.shutdown();
			SelfObj.initGraph();
		};
		this.getData = function(){
			var data = SelfObj.graph.getData(), output = {};

			$.each(data, function(key, val){
				output[val.name] = val.data;
			});

			//проверяем на присутствие всех графиков, если какой то отсутствует, берем значения из стандартных опций
			$.each(options.lines, function(key, line){
				if(!output[line.name]) output[line.name] = line.data;
			});

			return output;
		};
		this.lineVisibility = function(lineName, state){
			searchLineInOption(lineName).show = state;
			SelfObj.initGraph();
		};
		this.setDefaultState = function(){
			$.each(getListLineNames(), function(key, name){
				SelfObj.lineVisibility(name, true);
			});
			SelfObj.setData(def_lines);
		};

		//functions
		function searchLineInOption(lineName){
			for(var i=0; i<= options.lines.length-1; i++) if(options.lines[i].name == lineName) return options.lines[i];
		};
		function getListLineNames(){
			var out = [];

			$.each(options.lines, function(key, line){
				out.push(line.name);
			});

			return out;
		};

		//INIT
		constructor();
	};
	function GeoStorage(){
		var countries = {},
			SelfObj = this;

		this.add = function(id, shortname, target, recd){
			countries[id] = {
				id: id,
				shortName: shortname,
				fullName: manager.lng.zoneName[shortname],
				target: target,
				recd: recd
			};
		};
		this.clear = function(){
			$.each(SelfObj.getAll(), function(key, country){
				country.recd = 0;
				country.target = 0;
			});
		};
		this.getSelected = function(){
			var output = [];

			$.each(countries, function(key, cntry){
				if(cntry.target != 0) output.push(cntry);
			});

			output.sort(function(a, b) {
				return (a.fullName.toUpperCase() < b.fullName.toUpperCase()) ? -1 : (a.fullName.toUpperCase() > b.fullName.toUpperCase()) ? 1 : 0;
			})

			return output;
		};
		this.getNotSelected = function(){
			var output = [];

			$.each(countries, function(key, cntry){
				if(cntry.target == 0) output.push(cntry);
			});

			output.sort(function(a, b) {
				return (a.fullName.toUpperCase() < b.fullName.toUpperCase()) ? -1 : (a.fullName.toUpperCase() > b.fullName.toUpperCase()) ? 1 : 0;
			})

			return output;
		};
		this.getAll = function(){
			var output = [];

			$.each(countries, function(key, cntry){
				output.push(cntry);
			});

			output.sort(function(a, b) {
				return (a.fullName.toUpperCase() < b.fullName.toUpperCase()) ? -1 : (a.fullName.toUpperCase() > b.fullName.toUpperCase()) ? 1 : 0;
			})

			return output;
		};
		this.setTarget = function(countryId, target){
			countries[countryId].target = target;
		};
		this.setRecd = function(countryId, recd){
			countries[countryId].recd = recd;
		};
		this.unSelect = function(countryId){
			countries[countryId].target = 0;
		};
		this.find = function(text){
			var output = [];

			if(text != ""){
				$.each(SelfObj.getNotSelected(), function(key, cntry){
					if((cntry.shortName.toUpperCase().indexOf(text.toUpperCase()) != -1 || cntry.fullName.toUpperCase().indexOf(text.toUpperCase()) != -1) ) output.push(cntry);
				});
			}else{
				return SelfObj.getNotSelected();
			};

			output.sort(function(a, b) {
				return (a.fullName.toUpperCase() < b.fullName.toUpperCase()) ? -1 : (a.fullName.toUpperCase() > b.fullName.toUpperCase()) ? 1 : 0;
			})

			return output;
		};
		this.getById = function(id){
			return countries[id];
		};
	};
	function isInt(string){
		return (string == parseInt(string).toString());
	};
	function insertLoc(string, data){
		$.each(data, function(key, text){
			string = string.replace(new RegExp("%"+key+"%",'ig'), text);
		});
		return string;
	};
	function getTaskCost(beforeClick, afterClick, rangeSize, uniquePeriod){
		var _const = WA_ManagerStorage.const.system;
		return ((_const.taskSecondCost * (beforeClick + afterClick)) + (_const.ipRangeFactor * rangeSize) + (_const.uniqueTimeFactor * uniquePeriod) + _const.taskMinCost).toFixed(2);
	};
	var DataFormat = {
		int: function(int){
			return int.toString().replace(/(?=(\d\d\d)+$)/g, ' ');
		}
	}

	//set events on WA_ManagerStorage
	WA_ManagerStorage.events.onLogin.push(function(){
		manager.forms.auth.hide();
		manager.forms.manager.show();
		$(".header [name=login]").html(WA_ManagerStorage.getUserLogin());
		//load geo zones
		$.each(WA_ManagerStorage.geoZones.getGeoZoneList(), function(key, geoZone){
			manager.data.geoStorage.add(geoZone.getId(), geoZone.getName(), 0, 0);
		});
		//load folders
		manager.forms.folder.load();
	});
	WA_ManagerStorage.events.onLogOut.push(function(){
		manager.forms.manager.hide();
		manager.forms.auth.show();
	});
	WA_ManagerStorage.events.onClearData.push(function(){
		manager.forms.folder.clear();
		manager.forms.task.clear();
	});

	//set language
	WA_ManagerApi.utils.addScript('js/lng/'+Language.get()+'.js');

	//init
	$(document).ready(function(e){
		//set ui active language
		$(".lang .lng-item[lng='"+Language.get()+"']").addClass("active");
		//print userAgent to console
		console_appendText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" +navigator.userAgent);
		//Translate document
		TranslatePage();
		$(document).bind("DOMNodeInserted", TranslatePage);
		//set api options
		$.extend(true, WA_ManagerStorage.api.options, {
			server: "http://node0.waspace-run.net:80/",
			/*timeout: 1000,*/
			log: {
				enable: true,
				callback: {
					send: function(txt){
						console_appendText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "Send to server: \n-------------------\n" + txt);
					},
					receive: function(txt){
						console_appendText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "Receive from server: \n------------------------\n" + txt);
					}
				}
			},
			loader: {
				enable: true,
				show: function(txt){
					$(".loader").fadeIn("fast");
				},
				hide: function(txt){
					$(".loader").fadeOut("fast");
				}
			}
		});
		//set api Exception
		$.each(WA_ManagerStorage.apiUserException, function(key){
			switch(key){
				case "WrongSessionId":
					WA_ManagerStorage.apiUserException[key] = function(){
						NoticeShow(manager.lng.exception.general[key], "error");
					};
					break;
				default:
					WA_ManagerStorage.apiUserException[key] = function(){
						NoticeShow(manager.lng.exception.general[key], "error");
					};
			};
		});
		//init geo storage
		manager.data.geoStorage = new GeoStorage();
		//execute events
		WA_ManagerStorage.executeEvents(manager.events.onDomReady);
		//check start program
		if(DataStorage.get(manager.options.params.authStep) == 1){
			if(DataStorage.get(manager.options.params.authStepNumber) == 1){
				DataStorage.set(manager.options.params.authStepNumber, 2);
				window.location.href = "";
			}else if(DataStorage.get(manager.options.params.authStepNumber) == 2){
				WA_ManagerStorage.setToken(DataStorage.get(manager.options.params.authStepToken));

				DataStorage.remove(manager.options.params.authStep);
				DataStorage.remove(manager.options.params.authStepToken);
				DataStorage.remove(manager.options.params.authStepNumber);

				//run manager
				WA_ManagerStorage.run({
					checkDataStorage: false,
					onErrorInLogin: function(data, gErrorName){
						if(gErrorName != "WrongSessionId"){
							manager.forms.manager.show();
							$(".header [name=login]").html("User Login");
							manager.forms.folder.load();
						}
					}
				});
			};
		}else{
			//run manager
			WA_ManagerStorage.run({
				onErrorInLogin: function(data, gErrorName){
					if(gErrorName != "WrongSessionId"){
						manager.forms.manager.show();
						$(".header [name=login]").html("User Login");
						manager.forms.folder.load();
					};
				},
				onNeedAuth: function(){
					manager.forms.auth.show();
				}
			});
		};
	});
})(jQuery);