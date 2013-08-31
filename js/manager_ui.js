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
			geoStorage: null,
			interval_updateTaskStat: null
		},
		events: {
			onDomReady: []
		},
		utils: {
			noticeShow: NoticeShow,
			getParam: getParam,
			setParam: setParam,
			dateDiff: dateDiff
		},
		forms: {
			auth: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					setTitle([manager.lng.pageTitle, manager.lng.form.auth.pageTitle]);

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
                    var urlParams = parseUrl();

					setTitle([manager.lng.pageTitle, manager.lng.form.reg.pageTitle]);

					$("[name=reg] input[type=text], [name=reg] input[type=password]").val("");
                    if(urlParams.ref && urlParams.ref.toString().length > 0){
                        $("[name=reg] [name=reg_referer]").val(urlParams.ref);
                        $("[name=reg] [name=reg_referer]").attr("disabled", "disabled");
                    }else $("[name=reg] [name=reg_referer]").removeAttr("disabled");

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

					setTitle([manager.lng.pageTitle, manager.lng.form.forgot.pageTitle]);

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
					manager.data.clip_btn_readoblyKey.hide();
                    manager.data.clip_btn_referralUrl.hide();

					switch(data.form){
						case "task":
							$(".main .auth-success .tasks-content").show();

							//$(".main .auth-success .manager [name=not-setting] [name=add-category]").hide();
							//$(".main .auth-success .manager [name=not-setting] [name=add-task]").hide();
							setTitle([manager.lng.pageTitle, manager.lng.form.task.pageTitle]);
							manager.forms.task.updateListIdAll();
							$(manager.forms.task.getActiveHtml()).click();
							break;
						case "iplist":
							$(".main .auth-success .iplists-content").show();
							setTitle([manager.lng.pageTitle, manager.lng.form.ipList.pageTitle]);
							manager.forms.ipList.updateStatusAll();
							break;
						case "account":
							$(".main .auth-success .account-content").show();
							manager.data.clip_btn_readoblyKey.show();
							manager.data.clip_btn_readoblyKey.reposition();
                            manager.data.clip_btn_referralUrl.show();
                            manager.data.clip_btn_referralUrl.reposition();
							setTitle([manager.lng.pageTitle, manager.lng.form.account.pageTitle]);
							break;
                        case "referrals":
                            $(".main .auth-success .referals-content").show();
                            setTitle([manager.lng.pageTitle, manager.lng.form.referrals.pageTitle]);
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
					manager.data.clip_btn_readoblyKey.hide();
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
						not_setting = $(".main .auth-success .manager [name=not-setting]"),
						btn_add_task = $("#btn_add_task");

					if(manager.forms.folder.getFoldersHtml().length == 0){
						$(not_content).show();
						$(not_content_tasks).show();
						$(not_setting).show();
						$(add_category).show();
						$(btn_add_task).hide();
					}else{
						$(not_content).hide();
						$(add_category).hide();
						$(btn_add_task).show();
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
				getHtmlById: function(folderId, taskId){
					var out = null;

					$.each(this.getTasksHtml(), function(key, html){
						if(getParam(html, "folderId") == folderId && getParam(html, "taskId") == taskId) out = html;
					});

					return out;
				},
				toggleNotContent: function(){
					var not_content = $(".tasks .not-content"),
						add_task = $(".main .auth-success .manager [name=not-setting] [name=add-task]"),
						not_setting = $(".main .auth-success .manager [name=not-setting]");

					if(this.getTasksHtml().length == 0){
						$(not_content).show();
						$(not_setting).show();
						if(manager.forms.folder.getFoldersHtml().length > 0){
							$(add_task).show();
						}else{
							$(add_task).hide();
						};
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
					manager.forms.task.printDayStat(task.getDayStat());
				},
				settingFormClear: function(){
					this.notify.hide();

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

					var html = "<option value='0'></option>";
					$.each(WA_ManagerStorage.getIPListList(), function(key, ipList){html += '<option value="'+ipList.getId()+'">'+ipList.getName()+'</option>'});
					$("form[name=task-setting] [name=listId]").html(html);

					var use_listIp = $("form[name=task-setting] [name=use_listIp]")[0];
					if(use_listIp.checked) $(use_listIp).click();

					manager.data.graphs.dayTargeting.setDefaultState();
					manager.data.graphs.weekTargeting.setDefaultState();
					manager.data.graphs.timeDistribution.setDefaultState();
					manager.data.graphs.dayStat.setDefaultValue();

					manager.data.geoStorage.clear();
					//delete all printed countries
					$(manager.forms.geo.getCountriesHtml()).remove();
					$("[name=task-setting] [name=selectBox_country]").html("");

					$("#task-status").removeClass("status-off");
				},
				setStatusFromSettingForm: function(state, switcher){
					var task = WA_ManagerStorage.folders.getFolderById(getParam(manager.forms.task.getActiveHtml(), "folderId")).getTaskById(getParam(manager.forms.task.getActiveHtml(), "taskId"));

					WA_ManagerStorage.api_setTasksParameters({
						folderId: parseInt(getParam(manager.forms.task.getActiveHtml(), "folderId")),
						ids: [parseInt(getParam(manager.forms.task.getActiveHtml(), "taskId"))],
						taskParameters: {
							frozen: !task.getFrozen()
						},
						callback: function(taskObj){
							taskObj = taskObj[0];
							manager.forms.task.setStatus(manager.forms.task.getActiveHtml(), taskObj.isEnabled());
						},
						exception: {
							FolderNotFound: function(){
								NoticeShow(manager.lng.exception.query.setTask.FolderNotFound, "error");
							},
							TaskNotFound: function(){
								NoticeShow(manager.lng.exception.query.setTask.TaskNotFound, "error");
							}
						},
						onError: function(){
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
				},
				notify: {
					show: function(type){
						$("#task_setting_notify_"+type).show();
					},
					hide: function(){
						$("#task_setting_notify_incomplete, #task_setting_notify_overload").hide();
					}
				},
				updateListIdAll: function(){
					$.each(WA_ManagerStorage.getFolderList(), function(key, folder){
						$.each(folder.getTaskList(), function(key, task){
							if(task.getListId() !=0 && !WA_ManagerStorage.getIPListById(task.getListId())) task.setListId(0);
						});
					});
				},
				printDayStat: function(stat){
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
						},
						onePercent = 0,
						summ_incomplete = 0,
						summ_overload = 0,
						percentControl = 5;

					stat.sort(function(a,b){return a.id - b.id;});

					$.each(stat, function(key, val){
						lineMin.data.push([val.id, val.min]);
						lineMax.data.push([val.id, val.max]);
						lineGive.data.push([val.id, val.give]);
						lineIncomplete.data.push([val.id, val.incomplete]);
						lineOverload.data.push([val.id, val.overload]);

						onePercent += (val.min + val.max);
						summ_incomplete += val.incomplete;
						summ_overload += val.overload;
					});
					onePercent = (onePercent/2)/100;
                    manager.forms.task.notify.hide();
					if(onePercent > 0){
						if(summ_incomplete/onePercent > percentControl) manager.forms.task.notify.show("incomplete");
						if(summ_overload/onePercent > percentControl) manager.forms.task.notify.show("overload");
					};

					manager.data.graphs.dayStat.setData([lineMin, lineMax, lineGive, lineIncomplete, lineOverload]);
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
			},
			task_add: {
				show: function(){
					var msg = $("#msg_addTask").fadeIn("fast"),
						input_taskName = $(msg).find("[name=task_name]"),
						input_taskDomain = $(msg).find("[name=task_domain]"),
						input_taskExtSource = $(msg).find("[name=task_extSource]");

					$(input_taskName).val("");
					$(input_taskDomain).val("");
					$(input_taskExtSource).val("");
					$(input_taskName).focus();
				},
				hide: function(){
					$("#msg_addTask .add-box .close").click();
				}
			},
			task_remove: {
				show: function(el){
					var msg = $("#confirm_deleteTask").fadeIn("fast"),
						taskHtml = $(el).parents("[wa_task]"),
						folderId = getParam(taskHtml, "folderId"),
						taskId = getParam(taskHtml, "taskId");

					$(msg).find("[name=folderId]").val(folderId);
					$(msg).find("[name=taskId]").val(taskId);
				},
				hide: function(){
					$("#confirm_deleteTask .close").click();
				}
			},
			task_move: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){},
						taskId: 0,
						folderId: 0
					}, data);
					var html = "",
						msg = $("#msg_moveTask")[0];

					$.each(manager.forms.folder.getFoldersHtml(), function(key, folderHtml){
						if(getParam(folderHtml, "id") != data.folderId) html += '<option value="'+getParam(folderHtml, "id")+'">'+WA_ManagerStorage.getFolderById(getParam(folderHtml, "id")).getName()+'</option>';
					});

					$(msg).find("[name=folderId]").val(data.folderId);
					$(msg).find("[name=taskId]").val(data.taskId);

					$(msg).fadeIn("fast").find("[name=selectBox_folder]").html(html);

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("#msg_moveTask").hide();

					data.callback();
				}
			},
			task_clone: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){},
						taskId: 0,
						folderId: 0
					}, data);
					var html = "",
						msg = $("#msg_cloneTask")[0];

					$.each(WA_ManagerStorage.getFolderList(), function(key, folderObj){
						html += '<option value="'+folderObj.getId()+'">'+folderObj.getName()+'</option>';
					});

					$(msg).fadeIn("fast").find("[name=selectBox_folder]").html(html);

					$(msg).find("[name=folderId]").val(data.folderId);
					$(msg).find("[name=taskId]").val(data.taskId);
					$(msg).find("[name=task_name]").focus().val("");

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("#msg_cloneTask").hide();

					data.callback();
				}
			},
			task_copy_settings: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){},
						sourceFolderId: 0,
						sourceTaskId: 0,
						targetFolderId: 0,
						targetTaskId: 0,
						copy_out: false,
						copy_in: false
					}, data);

					var html = "",
						msg = $("#msg_copyTaskSettings")[0];

					if(data.copy_in){
						$(msg).find("[name=helper_text]").html(manager.lng.form.task_copy_settings.title.copy_in);
						$(msg).find("form").attr("copy", "in");
						$(msg).find("[name=selectBox_taskId]").attr("multiple", "true");
					}else if(data.copy_out){
						$(msg).find("[name=helper_text]").html(manager.lng.form.task_copy_settings.title.copy_out);
						$(msg).find("form").attr("copy", "out");
						$(msg).find("[name=selectBox_taskId]").removeAttr("multiple");
					}else{
						$(msg).find("[name=helper_text]").html("");
						$(msg).find("form").removeAttr("copy");
						$(msg).find("[name=selectBox_taskId]").removeAttr("multiple");
					};

					$.each(WA_ManagerStorage.getFolderList(), function(key, folderObj){
						html += '<option value="'+folderObj.getId()+'">'+folderObj.getName()+'</option>';
					});

					$(msg).find("[name=settings]").find("input[type=checkbox]").prop("checked", false);
					$(msg).find("[name=selectBox_taskId]").html("");

					$(msg).fadeIn("fast").find("[name=selectBox_folderId]").html(html);

					$(msg).find("[name=folderId]").val((data.copy_in) ? data.sourceFolderId : data.targetFolderId);
					$(msg).find("[name=taskId]").val((data.copy_in) ? data.sourceTaskId : data.targetTaskId);

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("#msg_copyTaskSettings").hide();

					data.callback();
				}
			},
			account: {
				load: function(){
					$("[name=form_account] [name=balance] [name=value]").html(DataFormat.int(WA_ManagerStorage.getUserBalance()));
					$("[name=form_account] [name=login] [name=value]").html(WA_ManagerStorage.getUserLogin());
					$("[name=form_account] [name=email] [name=value]").html(WA_ManagerStorage.getUserEmail());
					$("[name=form_account] [name=readonlyKey] [name=value]").html(WA_ManagerStorage.getUserReadonlyKey());
                    $("[name=form_account] [name=referralUrl] [name=value]").html(WA_ManagerStorage.getUserReferralUrl());
				},
				resetReadonlyKey: function(){
					WA_ManagerStorage.api_resetReadonlyKey({
						callback: function(key){
							$("[name=form_account] [name=readonlyKey] [name=value]").html(key);
						}
					});
				},
				clear: function(){
					$("[name=form_account] [name=balance] [name=value]").html("");
					$("[name=form_account] [name=login] [name=value]").html("");
					$("[name=form_account] [name=email] [name=value]").html("");
					$("[name=form_account] [name=readonlyKey] [name=value]").html("");
                    $("[name=form_account] [name=referralUrl] [name=value]").html("");
				}
			},
			pay: {
				show: function(data){
					$("#msg_pay").fadeIn("fast").find("[name=credits]").val(DataFormat.int(250000)).focus();
				},
				hide: function(data){
					$("#msg_pay .close").click();
				}
			},
			setAccountPassword: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);
					var html = "",
						msg = $("#msg_setAccountPassword")[0];

					$(msg).fadeIn("fast").find("form").attr("wa_step", 0);

					$(msg).find("[name=password]").removeAttr("disabled").focus().val("");
					$(msg).find("[name=code]").attr("disabled", "disabled").val("");

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("#msg_setAccountPassword").find(".close").click();

					data.callback();
				}
			},
			sendCredits: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);
					var html = "",
						msg = $("#msg_sendCredits")[0];

					$(msg).fadeIn("fast").find("form").attr("wa_step", 0);

					$(msg).find("[name=recipient]").removeAttr("disabled").focus().val("");
					$(msg).find("[name=credits]").removeAttr("disabled").val(DataFormat.int(10000));
					$(msg).find("[name=code]").attr("disabled", "disabled").val("");

					data.callback();
				},
				hide: function(data){
					data = $.extend(true, {
						callback: function(){}
					}, data);

					$("#msg_sendCredits").find(".close").click();

					data.callback();
				}
			},
			ipList: {
				addHtml: function(id){
					var layout = $("[wa_ipList][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					//add param to html
					setParam(html, "id", id);

					this.setName(html, WA_ManagerStorage.getIPListById(id).getName());
					this.setStatus(html, WA_ManagerStorage.isUsedIPList(id));

					this.toggleNotContent();
				},
				setName: function(html, val){
					$(html).find("[name=view_name]").html(val);
				},
				setStatus: function(html, status){
					$(html).find("[name=view_status]").removeClass("on off").addClass((status) ? "on" : "off").html((status) ? manager.lng.form.ipList.used : manager.lng.form.ipList.not_used);
				},
				getIPListsHtml: function(){
					var out = [];

					$("[wa_ipList]:not([default])").each(function(key, ipList){out.push(ipList)});

					return out;
				},
				getActiveHtml: function(){
					return $(".active[wa_ipList]:not([default])")[0];
				},
				getHtmlById: function(id){
					var out = null;

					$.each(this.getIPListsHtml(), function(key, html){
						if(getParam(html, "id") == id) out = html;
					});

					return out;
				},
				toggleNotContent: function(){
					var not_content = $(".iplists .not-content"),
						not_content_ipRanges = $(".set-iplist .not-content"),
						btn_add_range = $("#btn_add_ipRange"),
						btn_save_ranges = $("#btn_save_ipRanges");

					if(manager.forms.ipList.getIPListsHtml().length == 0){
						$(not_content).show();
						$(not_content_ipRanges).show();
						$(btn_add_range).hide();
						$(btn_save_ranges).hide();
					}else{
						$(not_content).hide();
						//$(not_content_ipRanges).hide();
						$(btn_add_range).show();
					};
				},
				load: function(){
					//delete all ipLists
					$(this.getIPListsHtml()).remove();
					//add to html
					$.each(WA_ManagerStorage.getIPListList(), function(key, ipList){
						manager.forms.ipList.addHtml(ipList.getId());
					});
					this.toggleNotContent();
					$(this.getIPListsHtml()).eq(0).click();
				},
				clear: function(){
					//delete all ipLists
					$(this.getIPListsHtml()).remove();
					$(".iplists .not-content").hide();
				},
				updateStatusAll: function(){
					var used = WA_ManagerStorage.getUsedIPList();
					$.each(this.getIPListsHtml(), function(key, html){
						if(used.indexOf(parseInt(getParam(html, "id"))) == -1) manager.forms.ipList.setStatus(html, false);
						else  manager.forms.ipList.setStatus(html, true);
					});
				}
			},
			ipRange: {
				addHtml: function(ipListId, ipRangeId){
					var layout = $("[wa_ipRange][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent),
						ipRange = WA_ManagerStorage.getIPRangeById(ipListId, ipRangeId);

					//add param to html
					setParam(html, "listId", ipListId);
					setParam(html, "rangeId", ipRangeId);

					this.setValue(html, ipRange.getStart(), ipRange.getEnd());
				},
				setValue: function(html, start, end){
					$(html).find("[name=value]").val(start + " - " + end);
				},
				getRangesHtml: function(){
					var out = [];

					$("[wa_ipRange]:not([default])").each(function(key, range){out.push(range);});

					return out;
				},
				getHtmlById: function(ipListId, ipRangeId){
					var out = null;

					$.each(this.getRangesHtml(), function(key, html){
						if(getParam(html, "listId") == ipListId && getParam(html, "rangeId") == ipRangeId) out = html;
					});

					return out;
				},
				toggleNotContent: function(){
					var not_content = $(".set-iplist .not-content"),
						btn_save = $("#btn_save_ipRanges");

					if(manager.forms.ipRange.getRangesHtml().length == 0){
						$(not_content).show();
						$(btn_save).hide();
					}else{
						$(not_content).hide();
						$(btn_save).show();
					};
				},
				load: function(ipListId){
					//delete all ranges
					$(this.getRangesHtml()).remove();
					//add to html
					$.each(WA_ManagerStorage.getIPRangeList(ipListId), function(key, range){
						manager.forms.ipRange.addHtml(ipListId, range.getId());
					});
					this.toggleNotContent();
				},
				clear: function(){
					//delete all ranges
					$(this.getRangesHtml()).remove();
					$("#btn_save_ipRanges").hide();
				}
			},
			ipList_add: {
				show: function(){
					var msg = $("#msg_addIPList").fadeIn("fast"),
						input = $(msg).find("[name=ipList_name]");

					$(input).val("");
					$(input).focus();
				},
				hide: function(){
					$("#msg_addIPList .add-box .close").click();
				}
			},
			ipList_clone: {
				show: function(el){
					var msg = $("#msg_cloneIPList").fadeIn("fast"),
						input_name = $(msg).find("[name=ipList_name]"),
						input_id = $(msg).find("[name=ipList_id]"),
						ipListId = getParam($(el).parents("[wa_ipList]"), "id");

					$(input_name).val("");
					$(input_name).focus();
					$(input_id).val(ipListId);
				},
				hide: function(){
					$("#msg_cloneIPList .add-box .close").click();
				}
			},
			ipList_rename: {
				show: function(el){
					var msg = $("#msg_renameIPList").fadeIn("fast"),
						input_name = $(msg).find("[name=ipList_name]"),
						input_id = $(msg).find("[name=ipList_id]"),
						ipListId = getParam($(el).parents("[wa_ipList]"), "id");

					$(input_name).val(WA_ManagerStorage.getIPListById(ipListId).getName());
					$(input_name).focus();
					$(input_id).val(ipListId);
				},
				hide: function(){
					$("#msg_renameIPList .add-box .close").click();
				}
			},
			ipList_remove: {
				show: function(el){
					var msg = $("#confirm_deleteIPList").fadeIn("fast"),
						ipListObj = WA_ManagerStorage.getIPListById(getParam($(el).parents("[wa_ipList]"), "id"));

					$(msg).find("[name=id]").val(ipListObj.getId());
				},
				hide: function(){
					$("#confirm_deleteIPList .close").click();
				}
			},
			ipRange_add: {
				show: function(){
					var msg = $("#msg_addIPRange").fadeIn("fast"),
						input = $(msg).find("[name=ipRange]");

					$(input).val("");
					$(input).focus();
				},
				hide: function(){
					$("#msg_addIPRange .add-box .close").click();
				}
			},
			ipRange_remove: {
				show: function(el){
					var msg = $("#confirm_deleteIPRange").fadeIn("fast"),
						rangeHtml = $(el).parents("[wa_ipRange]"),
						ipListId = getParam(rangeHtml, "listId"),
						rangeId = getParam(rangeHtml, "rangeId");

					$(msg).find("[name=ipListId]").val(ipListId);
					$(msg).find("[name=ipRangeId]").val(rangeId);
				},
				hide: function(){
					$("#confirm_deleteIPRange .close").click();
				}
			},
			account_activate: {
				show: function(data){
					data = $.extend(true, {
						callback: function(){},
						email: ""
					}, data);

					var msg = $("#msg_accountActivation").fadeIn("fast"),
						input_mail = $(msg).find("[name=email]")[0],
						input_code = $(msg).find("[name=code]")[0];

					$(input_mail).val("").focus();
					$(input_code).val("");

					if(data.email.length > 0){
						$(input_mail).val(data.email);
						$(input_code).focus();
					};

					data.callback();
				},
				hide: function(){
					$("#msg_accountActivation .add-box .close").click();
				}
			},
            referrals: {
                setRefererNick: function(nick){
                    if(nick && nick.toString().length > 0){
                        $("[name=refererContainer]").show();
                        $("[name=nickReferer]").html(nick);
                    }else{
                        $("[name=refererContainer]").hide();
                    };
                },
                addHtml: function(login){
                    var layout = $("[wa_referral][default]"),
                        parent = $(layout).parent(),
                        html = $(layout).clone().removeAttr("default").appendTo(parent);

                    this.setLogin(html, login);
                    this.setInactivity(html, WA_ManagerStorage.referrals.getReferralByLogin(login).getInactivity());
                    this.setDeductions(html, WA_ManagerStorage.referrals.getReferralByLogin(login).getDeductions());

                    this.toggleNotContent();
                },
                setLogin: function(html, val){
                    $(html).find("[name=view_login]").html(val);
                },
                setInactivity: function(html, val){
                    $(html).find("[name=view_inactivity]").html(DataFormat.int(val));
                },
                setDeductions: function(html, val){
                    $(html).find("[name=view_income]").html(DataFormat.int(parseInt(val)));
                },
                getReferralsHtml: function(){
                    var out = [];

                    $("[wa_referral]:not([default])").each(function(key, referral){out.push(referral);});

                    return out;
                },
                getHtmlByLogin: function(login){
                    var out = null;

                    $.each(this.getReferralsHtml(), function(key, html){
                        if(getParam(html, "view_login") == login) out = html;
                    });

                    return out;
                },
                toggleNotContent: function(){
                    var not_content = $(".referals-content .not-content");

                    if(manager.forms.referrals.getReferralsHtml().length == 0) $(not_content).show();
                    else $(not_content).hide();
                },
                load: function(){
                    //delete all ipLists
                    $(this.getReferralsHtml()).remove();
                    //set referrer nick
                    this.setRefererNick(WA_ManagerStorage.getUserReferer());
                    //add to html
                    $.each(WA_ManagerStorage.getReferralList(), function(key, referral){
                        manager.forms.referrals.addHtml(referral.getLogin());
                    });
                    $("[name=referral_income_total]").html(DataFormat.int(parseInt(WA_ManagerStorage.referrals.getTotalDeduction())));
                    this.toggleNotContent();
                },
                clear: function(){
                    //delete all ipLists
                    $(this.getReferralsHtml()).remove();
                    $(".referals-content .not-content").hide();
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
	//change summ for pay
	manager.events.onDomReady.push(function(){
		var input = $("#msg_pay [name=credits]")[0],
			oldText = null,
			interval = new WA_ManagerStorage.api.utils.interval(function(){
				if(oldText != input.value){
					if(isInt(getValue())){
						input.value = DataFormat.int(getValue());

						$("#msg_pay [name=summ]").html((parseInt(getValue()) / WA_ManagerStorage.getConstExchangeRate()).toFixed(2));
					};

					oldText = input.value;
				};
			}, 200);
		interval.start();

		function getValue(){
			return input.value.replace(new RegExp(" ",'ig'), "");
		};
	});
	//change summ for send credits
	manager.events.onDomReady.push(function(){
		var input = $("#msg_sendCredits [name=credits]")[0],
			oldText = null,
			interval = new WA_ManagerStorage.api.utils.interval(function(){
				if(oldText != input.value){
					if(isInt(getValue())){
						input.value = DataFormat.int(getValue());
						var val = parseInt(getValue());

						$("#msg_sendCredits [name=summ]").html(DataFormat.int(Math.round(val*WA_ManagerStorage.getConstTransferPercent()/100 + val)));
					};

					oldText = input.value;
				};
			}, 200);
		interval.start();

		function getValue(){
			return input.value.replace(new RegExp(" ",'ig'), "");
		};
	});
	//print copy task settings
	manager.events.onDomReady.push(function(){
		var OP_ITEM = WA_ManagerStorage.api.Constants.OperationItem,
			lng = manager.lng.form.task_copy_settings.settings,
			settings = [
				{value: OP_ITEM.Domain, name: lng.domain},
				{value: OP_ITEM.UniquePeriod, name: lng.uniquePeriod},
				{value: OP_ITEM.ExtSource, name: lng.extSource},
				{value: OP_ITEM.RangeSize, name: lng.rangeSize},
				{value: OP_ITEM.Mask, name: lng.mask},
				{value: OP_ITEM.BeforeClick, name: lng.beforeClick},
				{value: OP_ITEM.Profile, name: lng.profile},
				{value: OP_ITEM.AfterClick, name: lng.afterClick},
				{value: OP_ITEM.IgnoreGU, name: lng.ignoreGU},
				{value: OP_ITEM.IdList, name: lng.listId},
				{value: OP_ITEM.AllowProxy, name: lng.allowProxy},
				{value: OP_ITEM.ListMode, name: lng.listMode},
				{value: OP_ITEM.Frozen, name: lng.frozen},
				{value: OP_ITEM.DayTargeting, name: lng.dayTargeting},
				{value: OP_ITEM.Growth, name: lng.growth},
				{value: OP_ITEM.TimeDistribution, name: lng.timeDistribution},
				{value: OP_ITEM.Days, name: lng.days},
				{value: OP_ITEM.WeekTargeting, name: lng.weekTargeting},
				{value: OP_ITEM.GeoTargeting, name: lng.geoTargeting}
			],
			data = [],
			selector = "#msg_copyTaskSettings [name=two_settings][default]",
			parent = $(selector).parent();
		for(var i=0; i<settings.length; i++){
			var arr = [];
			arr.push(settings[i]);
			if(settings[i+1]){
				arr.push(settings[i+1]);
				i++;
			};
			data.push(arr);
		};
		//print settings
		$.each(data, function(key, arr){
			var twoSettingsHtml = $(selector).clone().removeAttr("default").appendTo(parent),
				firstSetting = $(twoSettingsHtml).find("[name=setting]").eq(0),
				secondSetting = $(twoSettingsHtml).find("[name=setting]").eq(1).hide();

			$(firstSetting).find("input[type=checkbox]").val(arr[0].value);
			$(firstSetting).find("[name=name]").html(arr[0].name);

			if(arr[1]){
				$(secondSetting).show().find("input[type=checkbox]").val(arr[1].value);
				$(secondSetting).find("[name=name]").html(arr[1].name);
			};
		});
	});
	//updater task stats
	manager.events.onDomReady.push(function(){
		manager.data.interval_updateTaskStat = new WA_ManagerStorage.api.utils.interval(function(){
			var form_task_settings = $("[name=task-setting]")[0],
				folderIdInput = $(form_task_settings).find("[name=folderId]")[0],
				taskIdInput = $(form_task_settings).find("[name=taskId]")[0],
				folderId = parseInt(folderIdInput.value),
				taskId = parseInt(taskIdInput.value),
				taskObj = WA_ManagerStorage.getTaskById(folderId, taskId);

			if(taskObj.isEnabled()) WA_ManagerStorage.api_updateTaskStat({
				folderId: folderId,
				taskId: taskId,
				silent: true,
				callback: function(stat){
					if(folderId == parseInt($(folderIdInput).val()) && taskId == parseInt($(taskIdInput).val())){
						manager.forms.task.printDayStat(stat);
					};
				}
			});
		}, 5*60*1000);
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
			login: this["reg_login"],
            referer: this["reg_referer"]
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
		}else if(!CheckType(inputs.referer.value, TYPE.LOGIN, true)){
            NoticeShow(manager.lng.form.reg.referer.error, "error");
            $(inputs.referer).focus();
        }else{
			WA_ManagerStorage.api.methods.register({
				mail: inputs.mail.value,
				password: inputs.password.value,
				login: inputs.login.value,
                referer: inputs.referer.value,
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

	//SET MSG PAY
	$(document).on("click","#msg_pay [name=yes]", function(e){
		var SelfObj = this,
			inputs = {
				credits: $(this).parents("#msg_pay").find("[name=credits]")[0]
			};

		if(isInt(getValue()) && getValue() >= 1000){
			var summ = parseInt(getValue()) / WA_ManagerStorage.getConstExchangeRate();
			var w = window.open('wmk:payto?Purse='+WA_ManagerStorage.getConstSystemWMR()+'&Amount='+summ+'&Desc='+WA_ManagerStorage.getUserEmail()+'&BringToFront=Y');
			$(w).ready(function(e){
				if(!w.closed) w.close();
			});
			manager.forms.pay.hide();
		}else{
			NoticeShow(manager.lng.form.pay.credits.error, "error");
			$(inputs.credits).focus();
		};

		function getValue(){
			return inputs.credits.value.replace(new RegExp(" ",'ig'), "");
		};
	});
	//SET MSG PAY

	//SET CHANGE ACCOUNT PASSWORD FORM
	$(document).on("submit","form[name=setAccountPassword]", function(e){
		var form = this, inputs = {
			password: this["password"],
			code: this["code"]
		};

		if($(form).attr("wa_step") == 0){
			if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
				NoticeShow(insertLoc(manager.lng.form.setAccountPassword.password.error, {
					min: WA_ManagerStorage.api.Constants.Limit.Account.Password.Length.Min,
					max: WA_ManagerStorage.api.Constants.Limit.Account.Password.Length.Max
				}), "error");
				$(inputs.password).focus();
			}else{
				WA_ManagerStorage.api_setAccountPassword({
					step_setPassword: true,
					password: inputs.password.value,
					callback: function(){
						$(form).attr("wa_step", 1);
						$(inputs.password).attr("disabled", "disabled");
						$(inputs.code).removeAttr("disabled").focus();
						NoticeShow(manager.lng.form.setAccountPassword.success_step1, "success");
					}
				});
			};
		}else if($(form).attr("wa_step") == 1){
			if(!CheckType(inputs.code.value, TYPE.CODE_CONFIRM)){
				NoticeShow(insertLoc(manager.lng.form.setAccountPassword.code.error, {
					min: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Min,
					max: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Max
				}), "error");
				$(inputs.code).focus();
			}else{
				WA_ManagerStorage.api_setAccountPassword({
					step_confirmSetPassword: true,
					code: inputs.code.value,
					callback: function(){
						manager.forms.setAccountPassword.hide();
						manager.logOut();
						NoticeShow(manager.lng.form.setAccountPassword.success_step2, "success");
					},
					exception: {
						InvalidCode: function(){
							NoticeShow(manager.lng.exception.query.confirmSetAccountPassword.InvalidCode, "error");
							$(inputs.code).focus();
						}
					}
				});
			};
		};
	});
	//SET CHANGE ACCOUNT PASSWORD FORM

	//SET ACCOUNT ACTIVATION FORM
	$(document).on("submit","form[name=account_activation]", function(e){
		var form = this, inputs = {
			email: this["email"],
			code: this["code"]
		};

		//check input data
		if(!CheckType(inputs.email.value, TYPE.MAIL)){
			NoticeShow(manager.lng.form.account_activation.email.error, "error");
			$(inputs.email).focus();
		}else if(!CheckType(inputs.code.value, TYPE.CODE_CONFIRM)){
			NoticeShow(insertLoc(manager.lng.form.account_activation.code.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Max
			}), "error");
			$(inputs.code).focus();
		}else{
			WA_ManagerStorage.api_accountActivate({
				email: inputs.email.value,
				code: inputs.code.value,
				callback: function(data){
					manager.forms.account_activate.hide();
					NoticeShow(manager.lng.form.account_activation.success, "success");
					WA_ManagerStorage.readData({
						callback: function(){
							initDataManager();
						}
					});
				},
				exception:{
					InvalidCode: function(){
						NoticeShow(manager.lng.exception.query.confirmRegister.InvalidCode, "error");
					}
				}
			});
		};

		return false;
	});
	//SET ACCOUNT ACTIVATION FORM

	//SET SEND CREDITS FORM
	$(document).on("submit","form[name=send_credits]", function(e){
		var form = this, inputs = {
			recipient: this["recipient"],
			amount: this["credits"],
			code: this["code"]
		};

		if($(form).attr("wa_step") == 0){
			if(!CheckType(inputs.recipient.value, TYPE.MAIL)){
				NoticeShow(insertLoc(manager.lng.form.send_credits.recipient.error, {
					min: WA_ManagerStorage.api.Constants.Limit.Account.Mail.Length.Min,
					max: WA_ManagerStorage.api.Constants.Limit.Account.Mail.Length.Max
				}), "error");
				$(inputs.recipient).focus();
			}else if(!isInt(getValue()) || parseInt(getValue()) < 10000){
				NoticeShow(manager.lng.form.send_credits.credits.error, "error");
				$(inputs.amount).focus();
			}else{
				WA_ManagerStorage.api_sendCredits({
					step_sendCredits: true,
					recipient: inputs.recipient.value,
					amount: getValue(),
					exception: {
						LowBalance: function(){
							NoticeShow(manager.lng.exception.query.sendCredits.LowBalance, "error");
							$(inputs.amount).focus();
						},
						InvalidRecipient: function(){
							NoticeShow(manager.lng.exception.query.sendCredits.InvalidRecipient, "error");
							$(inputs.recipient).focus();
						}
					},
					callback: function(data){
						$(form).attr("wa_step", 1);
						$(inputs.recipient).attr("disabled", "disabled");
						$(inputs.amount).attr("disabled", "disabled");
						$(inputs.code).removeAttr("disabled").focus();
						NoticeShow(manager.lng.form.send_credits.success_step1, "success");
					}
				});
			};
		}else if($(form).attr("wa_step") == 1){
			if(!CheckType(inputs.code.value, TYPE.CODE_CONFIRM)){
				NoticeShow(insertLoc(manager.lng.form.send_credits.code.error, {
					min: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Min,
					max: WA_ManagerStorage.api.Constants.Limit.Confirm.Code.Length.Max
				}), "error");
				$(inputs.code).focus();
			}else{
				WA_ManagerStorage.api_sendCredits({
					step_confirmSendCredits: true,
					code: inputs.code.value,
					exception: {
						LowBalance: function(){
							NoticeShow(manager.lng.exception.query.sendCredits.LowBalance, "error");
						},
						InvalidRecipient: function(){
							NoticeShow(manager.lng.exception.query.sendCredits.InvalidRecipient, "error");
						},
						InvalidCode: function(){
							NoticeShow(manager.lng.exception.query.confirmSendCredits.InvalidCode, "error");
							$(inputs.code).focus();
						}
					},
					callback: function(data){
						manager.forms.sendCredits.hide();
						$("[name=form_account] [name=balance] [name=value]").html(DataFormat.int(data.balance));
						NoticeShow(insertLoc(manager.lng.form.send_credits.success_step2, {summ: DataFormat.int(data.amount)}), "success");
					}
				});
			};
		};

		function getValue(){
			return inputs.amount.value.replace(new RegExp(" ",'ig'), "");
		};
	});
	//SET SEND CREDITS FORM

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
			WA_ManagerStorage.api_addFolder({
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
			WA_ManagerStorage.api_renameFolder({
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

		WA_ManagerStorage.api_removeFolder({
			ids: [folderId],
			callback: function(arrFolders){
				manager.forms.folder_remove.hide();

				var folderObj = arrFolders[0],
					folders = manager.forms.folder.getFoldersHtml(),
					folder = manager.forms.folder.getHtmlById(folderObj.getId()),
					isActive = (manager.forms.folder.getActiveHtml() == folder);

				$(folder).remove();

				if(isActive) $(manager.forms.task.getTasksHtml()).remove();
				if(folders.length > 1 && isActive) $(manager.forms.folder.getFoldersHtml()).eq(0).click();

				manager.forms.folder.toggleNotContent();
				manager.forms.task.toggleNotContent();
			}
		});
	});
	//SET CONFIRM DELETE FOLDER

	//SET ADD NEW TASK FORM
	$(document).on("submit","form[name=task_add]", function(e){
		var form = this, inputs = {
			name: this["task_name"],
			domain: this["task_domain"],
			extSource: this["task_extSource"]
		}, task_data = {
			folderId: 0,
			listId: 0,
			afterClick: WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Default,
			beforeClick: WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Default,
			allowProxy: false,
			ignoreGU: false,
			growth: 0,
			domain: "",
			profile: "",
			frozen: false,
			listMode: true,
			rangeSize: WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Default,
			uniquePeriod: WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Default,
			name: "",
			mask: "",
			days: 0,
			extSource: ""
		};

		//check input data
		if(!CheckType(inputs.name.value, TYPE.TASK_NAME)){
			NoticeShow(insertLoc(manager.lng.form.task_add.name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Max
			}), "error");
			$(inputs.name).focus();
		}else if(!CheckType(inputs.domain.value, TYPE.TASK_DOMAIN)){
			NoticeShow(insertLoc(manager.lng.form.task_add.domain.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Max
			}), "error");
			$(inputs.domain).focus();
		}else if(!CheckType(inputs.extSource.value, TYPE.TASK_EXTSOURCE)){
			NoticeShow(insertLoc(manager.lng.form.task_add.extSource.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Max
			}), "error");
			$(inputs.extSource).focus();
		}else{
			$.extend(true, task_data, {
				folderId: getParam(manager.forms.folder.getActiveHtml(), "id"),
				name: inputs.name.value,
				domain: inputs.domain.value,
				extSource: inputs.extSource.value
			});

			WA_ManagerStorage.api_addTask({
				taskData: task_data,
				callback: function(taskObj){
					manager.forms.task_add.hide();

					var folderHtml = manager.forms.folder.getActiveHtml();
					manager.forms.task.addHtml(getParam(folderHtml, "id"), taskObj.getId());

					manager.forms.folder.setTaskCount(folderHtml, WA_ManagerStorage.getFolderById(getParam(folderHtml, "id")).getTaskCount());

					if(manager.forms.task.getTasksHtml().length == 1) $(manager.forms.task.getTasksHtml()).eq(0).click();
					manager.forms.task.toggleNotContent();
				},
				exception: {
					LimitExceeded: function(){
						NoticeShow(manager.lng.exception.query.addTask.LimitExceeded, "error");
					}
				}
			});
		};

		return false;
	});
	//SET ADD NEW FOLDER FORM

	//SET CONFIRM DELETE TASK
	$(document).on("click","#confirm_deleteTask [name=yes]", function(e){
		var Self = this,
			folderId = $(Self).parents("#confirm_deleteTask").find("[name=folderId]").val(),
			taskId = $(Self).parents("#confirm_deleteTask").find("[name=taskId]").val();

		WA_ManagerStorage.api_removeTask({
			folderId: folderId,
			ids: [taskId],
			callback: function(arrTasks){
				manager.forms.task_remove.hide();

				var taskObj = arrTasks[0],
					tasks = manager.forms.task.getTasksHtml(),
					task = manager.forms.task.getHtmlById(folderId, taskId),
					folder = manager.forms.folder.getHtmlById(folderId),
					isActive = (manager.forms.task.getActiveHtml() == task);

				$(task).remove();

				manager.forms.folder.setTaskCount(folder, WA_ManagerStorage.getFolderById(folderId).getTaskCount());

				if(tasks.length > 1 && isActive) $(manager.forms.task.getTasksHtml()).eq(0).click();

				manager.forms.task.toggleNotContent();
			}
		});
	});
	//SET CONFIRM DELETE TASK

	//SET MOVE TASK FORM
	$(document).on("submit","form[name=task_move]", function(e){
		var folderId = $(this).find("[name=folderId]").val(),
			taskId = $(this).find("[name=taskId]").val(),
			targetId = $(this).find("[name=selectBox_folder]").val();

		if(targetId != null){
			WA_ManagerStorage.api_moveTask({
				folderId: folderId,
				targetId: targetId,
				ids: [taskId],
				callback: function(arrTasks){
					manager.forms.task_move.hide();

					var taskObj = arrTasks[0],
						folder = manager.forms.folder.getHtmlById(folderId),
						targetFolder = manager.forms.folder.getHtmlById(targetId),
						task = manager.forms.task.getHtmlById(folderId, taskId),
						tasks = manager.forms.task.getTasksHtml(),
						isActive = (manager.forms.task.getActiveHtml() == task);

					$(task).remove();

					manager.forms.folder.setTaskCount(folder, WA_ManagerStorage.getFolderById(folderId).getTaskCount());
					manager.forms.folder.setTaskCount(targetFolder, WA_ManagerStorage.getFolderById(targetId).getTaskCount());

					if(tasks.length > 1 && isActive) $(manager.forms.task.getTasksHtml()).eq(0).click();

					manager.forms.task.toggleNotContent();
				},
				exception: {
					FolderNotFound: function(){
						NoticeShow(manager.lng.exception.query.moveTask.FolderNotFound, "error");
					},
					TargetFolderNotFound: function(){
						NoticeShow(manager.lng.exception.query.moveTask.TargetFolderNotFound, "error");
					},
					LimitExceeded: function(){
						NoticeShow(manager.lng.exception.query.moveTask.LimitExceeded, "error");
					}
				}
			});
		};
	});
	//SET MOVE TASK FORM

	//SET CLONE TASK FORM
	$(document).on("submit","form[name=task_clone]", function(e){
		var inputs = {
				name: this["task_name"]
			},
			folderId = parseInt($(this).find("[name=folderId]").val()),
			taskId = parseInt($(this).find("[name=taskId]").val()),
			targetId = $(this).find("[name=selectBox_folder]").val();

		//check input data
		if(!CheckType(inputs.name.value, TYPE.TASK_NAME)){
			NoticeShow(insertLoc(manager.lng.form.task_clone.name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Max
			}), "error");
			$(inputs.name).focus();
		}else if(targetId == null){
			NoticeShow(manager.lng.form.task_clone.notSelectedFolder, "error");
		}else{
			targetId = parseInt(targetId);
			WA_ManagerStorage.api_cloneTask({
				folderId: folderId,
				targetFolderId: targetId,
				taskId: taskId,
				name: inputs.name.value,
				callback: function(task){
					manager.forms.task_clone.hide();
					manager.forms.folder.setTaskCount(manager.forms.folder.getHtmlById(targetId), WA_ManagerStorage.getFolderById(targetId).getTaskCount());
					if(folderId == targetId) manager.forms.task.addHtml(task.getFolderId(), task.getId());
				},
				exception: {
					FolderNotFound: function(){
						NoticeShow(manager.lng.exception.query.cloneTask.FolderNotFound, "error");
					},
					TargetFolderNotFound: function(){
						NoticeShow(manager.lng.exception.query.cloneTask.TargetFolderNotFound, "error");
					},
					LimitExceeded: function(){
						NoticeShow(manager.lng.exception.query.cloneTask.LimitExceeded, "error");
					}
				}
			});
		};
	});
	//SET CLONE TASK FORM

	//SET COPY SETTINGS TASK FORM
	$(document).on("submit","form[name=task_copy_settings]", function(e){
		var forms = this,
			inputs = {
				selectBox_folderId: this["selectBox_folderId"],
				selectBox_taskId: this["selectBox_taskId"]
			},
			folderId = parseInt($(this).find("[name=folderId]").val()),
			taskId = parseInt($(this).find("[name=taskId]").val());
		var sourceFolder = 0,
			sourceTask = 0,
			targetFolder = 0,
			targetTasks = [],
			settings = [];

		$(this).find("[name=settings] [name=two_settings] input[type=checkbox]:checked").each(function(key, checkbox){settings.push($(checkbox).val());});

		if(!inputs.selectBox_folderId.value){
			NoticeShow(manager.lng.form.task_copy_settings.notSelectedFolder, "error");
		}else if(!inputs.selectBox_taskId.value){
			NoticeShow(manager.lng.form.task_copy_settings.notSelectedTask, "error");
		}else if(settings.length == 0){
			NoticeShow(manager.lng.form.task_copy_settings.notSelectedParams, "error");
		}else{
			if($(forms).attr("copy") == "in"){
				sourceFolder = folderId;
				sourceTask = taskId;
				targetFolder = parseInt(inputs.selectBox_folderId.value);
				$(inputs.selectBox_taskId.selectedOptions).each(function(key, option){targetTasks.push(parseInt(option.value));});
			}else if($(forms).attr("copy") == "out"){
				sourceFolder = inputs.selectBox_folderId.value;
				sourceTask = inputs.selectBox_taskId.value;
				targetFolder = folderId;
				targetTasks = [taskId];
			};

			WA_ManagerStorage.api_copyTaskSettings({
				sourceFolder: sourceFolder,
				sourceTask: sourceTask,
				targetFolder: targetFolder,
				targetTasks: targetTasks,
				settings: settings,
				callback: function(arrTasks){
					manager.forms.task_copy_settings.hide();
					$.each(arrTasks, function(key, task){
						var html = manager.forms.task.getHtmlById(task.getFolderId(), task.getId());
						manager.forms.task.setStatus(html, task.isEnabled());
						$(manager.forms.task.getActiveHtml()).click();
					});
				},
				exception: {
					FolderNotFound: function(){
						NoticeShow(manager.lng.exception.query.copyTaskSettings.FolderNotFound, "error");
					},
					TargetFolderNotFound: function(){
						NoticeShow(manager.lng.exception.query.copyTaskSettings.TargetFolderNotFound, "error");
					},
					TaskNotFound: function(){
						NoticeShow(manager.lng.exception.query.copyTaskSettings.TaskNotFound, "error");
					}
				}
			});
		};
	});
	//SET COPY SETTINGS TASK FORM

	//SET TASK SETTING FORM
	$(document).on("submit","form[name=task-setting]", function(e){
		var form = this,
			inputs = {
				name: this["name"],
				domain: this["domain"],
				extSource: this["extSource"],
				beforeClick: this["beforeClick"],
				afterClick: this["afterClick"],
				mask: this["mask"],
				rangeSize: this["rangeSize"],
				uniquePeriod: this["uniquePeriod"],
				growth: this["growth"],
				days: this["days"],
				profile: this["profile"],
				ignoreGU: this["ignoreGU"],
				allowProxy: this["allowProxy"],
				listId: this["listId"]
			},
			folderId = parseInt($(this).find("[name=folderId]").val()),
			taskId = parseInt($(this).find("[name=taskId]").val()),
			modified_params = {},
			taskObj = WA_ManagerStorage.getTaskById(folderId, taskId);

		if(!CheckType(inputs.name.value, TYPE.TASK_NAME)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Name.Length.Max
			}), "error");
		}else if(!CheckType(inputs.domain.value, TYPE.TASK_DOMAIN)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.domain.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Domain.Length.Max
			}), "error");
		}else if(!CheckType(inputs.extSource.value, TYPE.TASK_EXTSOURCE)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.extSource.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.ExtSource.Length.Max
			}), "error");
		}else if(!CheckType(inputs.beforeClick.value, TYPE.TASK_BEFORECLICK)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.beforeClick.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.BeforeClick.Value.Max
			}), "error");
		}else if(!CheckType(inputs.afterClick.value, TYPE.TASK_AFTERCLICK)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.afterClick.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.AfterClick.Value.Max
			}), "error");
		}else if(!CheckType(inputs.mask.value, TYPE.TASK_MASK, true)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.mask.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Mask.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Mask.Length.Max
			}), "error");
		}else if(!CheckType(inputs.rangeSize.value, TYPE.TASK_RANGESIZE)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.rangeSize.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Max,
				"default" : WA_ManagerStorage.api.Constants.Limit.Task.RangeSize.Value.Default
			}), "error");
		}else if(!CheckType(inputs.uniquePeriod.value, TYPE.TASK_UNIQUEPERIOD)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.uniquePeriod.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Max,
				"default" : WA_ManagerStorage.api.Constants.Limit.Task.UniquePeriod.Value.Default
			}), "error");
		}else if(!CheckType(inputs.growth.value, TYPE.TASK_GROWTH)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.growth.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Max,
				"default" : WA_ManagerStorage.api.Constants.Limit.Task.Growth.Value.Default
			}), "error");
		}else if(!CheckType(inputs.days.value, TYPE.TASK_DAYS)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.days.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Max,
				"default" : WA_ManagerStorage.api.Constants.Limit.Task.Days.Value.Default
			}), "error");
		}else if(!CheckType(inputs.profile.value, TYPE.TASK_PROFILE, true)){
			NoticeShow(insertLoc(manager.lng.form.task_setting.profile.error, {
				min: WA_ManagerStorage.api.Constants.Limit.Task.Profile.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.Task.Profile.Length.Max
			}), "error");
		}else{
			if(taskObj.getName() != inputs.name.value) modified_params.name = inputs.name.value;
			if(taskObj.getDomain() != inputs.domain.value) modified_params.domain = inputs.domain.value;
			if(taskObj.getExtSource() != inputs.extSource.value) modified_params.extSource = inputs.extSource.value;
			if(taskObj.getMask() != inputs.mask.value) modified_params.mask = inputs.mask.value;
			if(taskObj.getProfile() != inputs.profile.value) modified_params.profile = inputs.profile.value;
			if(taskObj.getBeforeClick() != parseInt(inputs.beforeClick.value)) modified_params.beforeClick = parseInt(inputs.beforeClick.value);
			if(taskObj.getAfterClick() != parseInt(inputs.afterClick.value)) modified_params.afterClick = parseInt(inputs.afterClick.value);
			if(taskObj.getRangeSize() != parseInt(inputs.rangeSize.value)) modified_params.rangeSize = parseInt(inputs.rangeSize.value);
			if(taskObj.getUniquePeriod() != parseInt(inputs.uniquePeriod.value)) modified_params.uniquePeriod = parseInt(inputs.uniquePeriod.value);
			if(taskObj.getGrowth() != parseFloat(inputs.growth.value)) modified_params.growth = parseFloat(inputs.growth.value);
			if(taskObj.getDays() != parseInt(inputs.days.value)) modified_params.days = parseInt(inputs.days.value);
			if(taskObj.getListId() != parseInt(inputs.listId.value)) modified_params.listId = parseInt(inputs.listId.value);
			if(taskObj.getIgnoreGU() != inputs.ignoreGU.checked) modified_params.ignoreGU = inputs.ignoreGU.checked;
			if(taskObj.getAllowProxy() != !inputs.allowProxy.checked) modified_params.allowProxy = !inputs.allowProxy.checked;
			if(taskObj.getListMode() != eval($(form).find("[name=listIp-type]:checked").val())) modified_params.listMode = eval($(form).find("[name=listIp-type]:checked").val());
			var newDayTargeting = convertToDayTargeting(WA_ManagerUi.data.graphs.dayTargeting.getData());
			if(!isEqualDayTargeting(taskObj.getDayTargeting(), newDayTargeting)) modified_params.dayTargeting = newDayTargeting;
			var newWeekTargeting = convertToWeekTargeting(WA_ManagerUi.data.graphs.weekTargeting.getData());
			if(!isEqualWeekTargeting(taskObj.getWeekTargeting(), newWeekTargeting)) modified_params.weekTargeting = newWeekTargeting;
			var newTimeDistribution = convertToTimeDistribution(WA_ManagerUi.data.graphs.timeDistribution.getData());
			if(!isEqualTimeDistribution(taskObj.getTimeDistribution(), newTimeDistribution)) modified_params.timeDistribution = newTimeDistribution;
			var newGeoTargeting = convertToGeoTargeting(WA_ManagerUi.data.geoStorage.getSelected());
			if(!isEqualGeoTargeting(taskObj.getGeoTargeting(), newGeoTargeting)) modified_params.geoTargeting = newGeoTargeting;

			if(!$.isEmptyObject(modified_params)){
				WA_ManagerStorage.api_setTasksParameters({
					folderId: folderId,
					ids: [taskId],
					taskParameters: modified_params,
					callback: function(taskObj){
						taskObj = taskObj[0];
						manager.forms.task.setName(manager.forms.task.getActiveHtml(), taskObj.getName());
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
								},
								onePercent = 0,
								summ_incomplete = 0,
								summ_overload = 0,
								percentControl = 5;

							data.sort(function(a,b){return a.id - b.id;});

							$.each(data, function(key, val){
								lineMin.data.push([val.id, val.min]);
								lineMax.data.push([val.id, val.max]);
								lineGive.data.push([val.id, val.give]);
								lineIncomplete.data.push([val.id, val.incomplete]);
								lineOverload.data.push([val.id, val.overload]);

								onePercent += (val.min + val.max);
								summ_incomplete += val.incomplete;
								summ_overload += val.overload;
							});
							onePercent = (onePercent/2)/100;
							manager.forms.task.notify.hide();
							if(onePercent > 0){
								if(summ_incomplete/onePercent > percentControl) manager.forms.task.notify.show("incomplete");
								if(summ_overload/onePercent > percentControl) manager.forms.task.notify.show("overload");
							};

							manager.data.graphs.dayStat.setData([lineMin, lineMax, lineGive, lineIncomplete, lineOverload]);
						})(taskObj.getDayStat());
					},
					exception: {
						FolderNotFound: function(){
							NoticeShow(manager.lng.exception.query.setTask.FolderNotFound, "error");
						},
						TaskNotFound: function(){
							NoticeShow(manager.lng.exception.query.setTask.TaskNotFound, "error");
						}
					}
				});
			};
		};

		function convertToDayTargeting(data){
			var out = [];

			$.each(data, function(key, arr){
				$.each(arr, function(_key, _arr){
					if(!out[_arr[0]]) out[_arr[0]] = {id: _arr[0]};
					var obj = {};
					obj[key] = _arr[1];
					$.extend(out[_arr[0]], obj);
				});
			});

			return out;
		};
		function isEqualDayTargeting(dayTarg1, dayTarg2){
			var out = true, command_break = false;

			for(var i=0; i<dayTarg1.length; i++){
				command_break = false;
				$.each(dayTarg1[i], function(key, val){
					if(dayTarg1[i][key] != dayTarg2[i][key]){
						out = false;
						command_break = true;
					};
				});
				if(command_break) break;
			};

			return out;
		};
		function convertToWeekTargeting(data){
			var out = [];

			$.each(data, function(key, arr){
				$.each(arr, function(_key, _arr){
					out[_arr[0]] = {id: _arr[0], val: _arr[1]};
				});
			});

			return out;
		};
		function isEqualWeekTargeting(weekTarg1, weekTarg2){
			var out = true, command_break = false;

			for(var i=0; i<weekTarg1.length; i++){
				command_break = false;
				$.each(weekTarg1[i], function(key, val){
					if(weekTarg1[i][key] != weekTarg2[i][key]){
						out = false;
						command_break = true;
					};
				});
				if(command_break) break;
			};

			return out;
		};
		function convertToTimeDistribution(data){
			var out = [];

			$.each(data, function(key, arr){
				$.each(arr, function(_key, _arr){
					out[_arr[0]-1] = {id: _arr[0], val: _arr[1]};
				});
			});

			var i = 1;
			while(i<=100){
				if(!out[i-1]) out[i-1] = {id: i, val: 0};
				i++;
			};

			return out;
		};
		function isEqualTimeDistribution(timeDistr1, timeDistr2){
			var out = true, command_break = false;

			for(var i=0; i<timeDistr1.length; i++){
				command_break = false;
				$.each(timeDistr1[i], function(key, val){
					if(timeDistr1[i][key] != timeDistr2[i][key]){
						out = false;
						command_break = true;
					};
				});
				if(command_break) break;
			};

			return out;
		};
		function convertToGeoTargeting(data){
			var out = [];

			$.each(data, function(key, obj){
				var _obj = {};
				$.each(obj, function(_key, _val){
					_obj[_key] = _val;
				});
				out.push(_obj);
			});

			return out;
		};
		function isEqualGeoTargeting(geoTarg1, geoTarg2){
			var out = true;

			if(geoTarg1.length != geoTarg2.length){
				out = false;
			}else{
				for(var i=0; i<geoTarg1.length; i++){
					var obj1 = geoTarg1[i],
						obj2 = geoTarg2[i];
					if(obj1.id != obj2.id || obj1.target != obj2.target){
						out = false;
						break;
					};
				};
			};

			return out;
		};
	});
	//SET TASK SETTING FORM

	//SET ADD NEW IPLIST FORM
	$(document).on("submit","form[name=ipList_add]", function(e){
		var form = this, inputs = {
			ipList_name: this["ipList_name"]
		};

		//check input data
		if(!CheckType(inputs.ipList_name.value, TYPE.IPLIST_NAME)){
			NoticeShow(insertLoc(manager.lng.form.ipList_add.ipList_name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Max
			}), "error");
			$(inputs.ipList_name).focus();
		}else{
			WA_ManagerStorage.api_addIPList({
				name: inputs.ipList_name.value,
				exception: {
					LimitExceeded: function(){
						NoticeShow(manager.lng.exception.query.addIPList.LimitExceeded, "error");
					}
				},
				callback: function(ipListObj){
					manager.forms.ipList_add.hide()

					manager.forms.ipList.addHtml(ipListObj.getId());

					if(manager.forms.ipList.getIPListsHtml().length == 1) $(manager.forms.ipList.getIPListsHtml()).eq(0).click();
				}
			});
		};

		return false;
	});
	//SET ADD NEW IPLIST FORM

	//SET RENAME IPLIST FORM
	$(document).on("submit","form[name=ipList_rename]", function(e){
		var form = this, inputs = {
			ipList_name: this["ipList_name"],
			id: this["ipList_id"]
		};

		//check input data
		if(!CheckType(inputs.ipList_name.value, TYPE.IPLIST_NAME)){
			NoticeShow(insertLoc(manager.lng.form.ipList_rename.ipList_name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Max
			}), "error");
			$(inputs.ipList_name).focus();
		}else{
			WA_ManagerStorage.api_renameIPList({
				id: inputs.id.value,
				name: inputs.ipList_name.value,
				callback: function(ipListObj){
					manager.forms.ipList_rename.hide();

					manager.forms.ipList.setName(manager.forms.ipList.getHtmlById(inputs.id.value), ipListObj.getName());
				}
			});
		};

		return false;
	});
	//SET RENAME IPLIST FORM

	//SET CLONE IPLIST FORM
	$(document).on("submit","form[name=ipList_clone]", function(e){
		var form = this, inputs = {
			ipList_name: this["ipList_name"],
			id: this["ipList_id"]
		};

		//check input data
		if(!CheckType(inputs.ipList_name.value, TYPE.IPLIST_NAME)){
			NoticeShow(insertLoc(manager.lng.form.ipList_clone.ipList_name.error, {
				min: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Min,
				max: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Max
			}), "error");
			$(inputs.ipList_name).focus();
		}else{
			WA_ManagerStorage.api_cloneIPList({
				listId: parseInt(inputs.id.value),
				name: inputs.ipList_name.value,
				callback: function(ipList){
					manager.forms.ipList_clone.hide();
					manager.forms.ipList.addHtml(ipList.getId());
					manager.forms.ipList.toggleNotContent();
				},
				exception: {
					IPListNotFound: function(){
						NoticeShow(manager.lng.exception.query.cloneIPList.IPListNotFound, "error");
					},
					LimitExceeded: function(){
						NoticeShow(manager.lng.exception.query.cloneIPList.LimitExceeded, "error");
					}
				}
			});
		};

		return false;
	});
	//SET CLONE IPLIST FORM

	//SET CONFIRM DELETE IPLIST
	$(document).on("click","#confirm_deleteIPList [name=yes]", function(e){
		var Self = this,
			ipListId = $(Self).parents("#confirm_deleteIPList").find("[name=id]").val();

		WA_ManagerStorage.api_removeIPList({
			ids: [ipListId],
			callback: function(arrIPList){
				manager.forms.ipList_remove.hide();

				var ipListObj = arrIPList[0],
					ipLists = manager.forms.ipList.getIPListsHtml(),
					ipList = manager.forms.ipList.getHtmlById(ipListObj.getId()),
					isActive = (manager.forms.ipList.getActiveHtml() == ipList);

				$(ipList).remove();

				if(isActive) $(manager.forms.ipRange.getRangesHtml()).remove();
				if(ipLists.length > 1 && isActive)$(manager.forms.ipList.getIPListsHtml()).eq(0).click();

				manager.forms.ipList.toggleNotContent();
				manager.forms.ipRange.toggleNotContent();
			}
		});
	});
	//SET CONFIRM DELETE IPLIST

	//SET ADD NEW IPRANGE FORM
	$(document).on("submit","form[name=ipRange_add]", function(e){
		var form = this, inputs = {
			ipRange: this["ipRange"]
		},
			listId = parseInt(getParam(manager.forms.ipList.getActiveHtml(), "id"));

		//check input data
		if(inputs.ipRange.value.length > 0){
			var lines = [], error = false, err_str = "", ranges = [];
			$.each(inputs.ipRange.value.split("\n"), function(key, string){
				if(string.length > 0) lines.push(string);
			});
			for(var i=0; i<lines.length; i++){
				var index = i, line = lines[index];

				if(line.indexOf("-") == -1){
					error = true;
					err_str = line;
					break;
				}else if(line.indexOf("-") != -1){
					var arr = line.split("-"),
						start = arr[0].toString().trim(),
						end = arr[1].toString().trim();

					if(!CheckType(start, TYPE.IPLIST_IP)){
						error = true;
						err_str = line;
						break;
					}else if(!CheckType(end, TYPE.IPLIST_IP)){
						error = true;
						err_str = line;
						break;
					}else ranges.push({start: start, end: end});
				}
			};
			if(error){
				NoticeShow(insertLoc(manager.lng.form.ipRange_add.ipRange.error, {ip_range: err_str}), "error");
				$(inputs.ipRange).focus();
			}else{
				if(ranges.length > 0){
					WA_ManagerStorage.api_addIPRanges({
						listId: listId,
						ranges: ranges,
						callback: function(ipRanges){
							manager.forms.ipRange_add.hide();
							$.each(ipRanges, function(key, range){
								manager.forms.ipRange.addHtml(range.getListId(), range.getId());
							});
							manager.forms.ipRange.toggleNotContent();
						},
						exception: {
							LimitExceeded: function(){
								NoticeShow(manager.lng.exception.query.addIPRanges.LimitExceeded, "error");
							},
							IPListNotFound: function(){
								NoticeShow(manager.lng.exception.query.addIPRanges.IPListNotFound, "error");
							}
						}
					});
				};
			};
		};

		return false;
	});
	//SET ADD NEW IPRANGE FORM

	//SET EDIT IPRANGE FORM
	$(document).on("submit","form[name=ip_ranges]", function(e){
		var form = this,
			modified_ranges = [],
			data = [],
			error = false,
			err_str = "",
			err_input = null,
			listId = parseInt(getParam(manager.forms.ipList.getActiveHtml(), "id"));

		$.each(manager.forms.ipRange.getRangesHtml(), function(key, html){
			var listId = getParam(html, "listId"),
				rangeId = getParam(html, "rangeId"),
				ipRangeObj = WA_ManagerStorage.getIPRangeById(listId, rangeId),
				rangeData = parseString($(html).find("[name=value]").val());

			if(ipRangeObj.getStart() != rangeData.start || ipRangeObj.getEnd() != rangeData.end) modified_ranges.push(html);
		});

		if(modified_ranges.length > 0){
			for(var i=0; i<modified_ranges.length; i++){
				var html = modified_ranges[i],
					listId = getParam(html, "listId"),
					rangeId = getParam(html, "rangeId"),
					string = $(html).find("[name=value]").val(),
					rangeData = parseString(string);

				if(!CheckType(rangeData.start, TYPE.IPLIST_IP)){
					error = true;
					err_str = string;
					err_input = $(html).find("[name=value]");
					break;
				}else if(!CheckType(rangeData.end, TYPE.IPLIST_IP)){
					error = true;
					err_str = string;
					err_input = $(html).find("[name=value]");
					break;
				}else data.push({listId: listId, rangeId: rangeId, start: rangeData.start, end: rangeData.end});
			};

			if(error){
				NoticeShow(insertLoc(manager.lng.form.ipRange_add.ipRange.error, {ip_range: err_str}), "error");
				$(err_input).focus();
			}else{
				WA_ManagerStorage.api_setIPRanges({
					listId: listId,
					ranges: data,
					callback: function(ipRanges){},
					exception: {
						IPListNotFound: function(){
							NoticeShow(manager.lng.exception.query.setIPRanges.IPListNotFound, "error");
						}
					}
				});
			};
		};

		function parseString(string){
			var out = {start: "", end: ""}, arr = string.split("-");

			if(arr[0]) out.start = arr[0].toString().trim();
			if(arr[1]) out.end = arr[1].toString().trim();

			return out;
		};

		return false;
	});
	//SET EDIT IPRANGE FORM

	//SET CONFIRM DELETE IPRANGE
	$(document).on("click","#confirm_deleteIPRange [name=yes]", function(e){
		var Self = this,
			ipListId = $(Self).parents("#confirm_deleteIPRange").find("[name=ipListId]").val(),
			ipRangeId = $(Self).parents("#confirm_deleteIPRange").find("[name=ipRangeId]").val();

		WA_ManagerStorage.api_removeIPRange({
			listId: ipListId,
			ids: [ipRangeId],
			callback: function(arrRanges){
				var rangeObj = arrRanges[0],
					ranges = manager.forms.ipRange.getRangesHtml(),
					range = manager.forms.ipRange.getHtmlById(ipListId, ipRangeId);

				$(range).remove();

				manager.forms.ipRange.toggleNotContent();
			}
		});
	});
	//SET CONFIRM DELETE IPRANGE

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
			}, 7 * 1000);
		});
		$(msg).hover(function(){
			timeout_destroy = false;
		}, function(){
			timeout_destroy = true;
			setTimeout(function(){
				if(timeout_destroy) $(msg).find("[name=close]").click();
			}, 7 * 1000);
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
		},
		IPLIST_NAME: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.IPLists.Name.Length.Max
		},
		IPLIST_IP: {
			dataType: "text",
			regexp: WA_ManagerStorage.api.Constants.Limit.IPLists.IP.Regexp,
			min:  WA_ManagerStorage.api.Constants.Limit.IPLists.IP.Length.Min,
			max:  WA_ManagerStorage.api.Constants.Limit.IPLists.IP.Length.Max
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

			for(var i=0; i<=arr.length-1; i++){
				var graph = searchGraphInData(arr[i].name, curData);
				if(graph){
					graph.data = arr[i].data;
				}else{
					searchLineInOption(arr[i].name).data = arr[i].data;
				};
			};

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
		this.setDefaultValue = function(){
			var values = [];
			$.each(options.lines, function(key, line){
				values.push($.extend(true, {name: line.name}, {data: searchLineInDefaultLines(line.name).data}));
			});
			SelfObj.setData(values);
		};

		//functions
		function searchLineInOption(lineName){
			for(var i=0; i<= options.lines.length-1; i++) if(options.lines[i].name == lineName) return options.lines[i];
		};
		function searchLineInDefaultLines(lineName){
			for(var i=0; i<= def_lines.length-1; i++) if(def_lines[i].name == lineName) return def_lines[i];
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

			for(var i=0; i<=arr.length-1; i++){
				var graph = searchGraphInData(arr[i].name, curData);
				if(graph){
					graph.data = arr[i].data;
				}else{
					searchLineInOption(arr[i].name).data = arr[i].data;
				};
			};

			var _y = getMaxY(curData);
			maxY = ((_y < options.graphOptions.yaxis.maxDefault) ? options.graphOptions.yaxis.maxDefault : _y);

			SelfObj.graph.setData(curData);
			SelfObj.graph.draw(maxY);

			SelfObj.setMaxYAxis(maxY, Math.floor(maxY/10));
			options.onChange(SelfObj.getData());

			function searchGraphInData(name, data){
				for(var i=0; i<=data.length-1; i++)if(data[i].name == name) return data[i];
				return false;
			};
			function getMaxY(data){
				var arr = [];

				$.each(options.lines, function(key, line){
					if(line.show){
						$.each(searchGraphInData(line.name, data).data, function(key, val){
							arr.push(val[1]);
						});
					}else{
						$.each(line.data, function(key, val){
							arr.push(val[1]);
						});
					};
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
		this.setDefaultValue = function(){
			var values = [];
			$.each(options.lines, function(key, line){
				values.push($.extend(true, {name: line.name}, {data: searchLineInDefaultLines(line.name).data}));
			});
			SelfObj.setData(values);
		};

		//functions
		function searchLineInOption(lineName){
			for(var i=0; i<= options.lines.length-1; i++) if(options.lines[i].name == lineName) return options.lines[i];
		};
		function searchLineInDefaultLines(lineName){
			for(var i=0; i<= def_lines.length-1; i++) if(def_lines[i].name == lineName) return def_lines[i];
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
			return int.toString().replace(/(?=(\d\d\d)+$)/g, ' ').trim();
		}
	};
	function setTitle(elements){
		if(!elements) return;

		elements.reverse();

		var title = "";

		$.each(elements, function(key, value){
			if(value) title += value + " | ";
		});

		document.title = title.substr(0, title.length - 3);
	};
	function parseUrl(){
		var GET = {};

		var url = document.location.search;
		if(url.indexOf('?') != -1) url = url.substr(url.indexOf('?') + 1);

		var arr = url.split("&amp;").join("&").split('&');

		$.each(arr, function(key, value){
			var temp = value.split('=');

			GET[temp[0]] = decodeURI(temp[1]);
		});

		return GET;
	};
	function dateDiff(date1, date2, diffType){
		var diff = date1 - date2,
			out = diff;
		diffType = (diffType && diffType.length>0) ? diffType : "min"

		switch(diffType){
			case "sec":
				out = getDiffSec(diff);
				break;
			case "min":
				out = getDiffMin(getDiffSec(diff));
				break
		};

		function getDiffSec(_diff){
			return Math.round(_diff/1000);
		};
		function getDiffMin(_diff){
			return Math.floor(_diff/60);
		};

		return out;
	};

	//set events on WA_ManagerStorage
	function initDataManager(){
		manager.forms.auth.hide();
		manager.forms.manager.show();
		$(".header [name=login]").html((WA_ManagerStorage.getUserLogin()) ? WA_ManagerStorage.getUserLogin() : "USER");
		//check checkbox on graph day stat
		$("#dayStat_cb_max input[type=checkbox], #dayStat_cb_min input[type=checkbox], #dayStat_cb_give input[type=checkbox], #dayStat_cb_incomplete input[type=checkbox], #dayStat_cb_overload input[type=checkbox]").prop("checked", true);
		//graphs, set default state
		$.each(manager.data.graphs, function(key, graph){
			if(graph.setDefaultState) graph.setDefaultState();
		});
		//load geo zones
		$.each(WA_ManagerStorage.geoZones.getGeoZoneList(), function(key, geoZone){
			manager.data.geoStorage.add(geoZone.getId(), geoZone.getName(), 0, 0);
		});
		//load folders
		manager.forms.folder.load();
		//load ipLists
		manager.forms.ipList.load();
		//load account info
		manager.forms.account.load();
        //load referrals
        manager.forms.referrals.load();
	}
	WA_ManagerStorage.events.onLogin.push(initDataManager);
	WA_ManagerStorage.events.onLogOut.push(function(){
		manager.forms.manager.hide();
		manager.forms.auth.show();
	});
	WA_ManagerStorage.events.onClearData.push(function(){
		manager.forms.folder.clear();
		manager.forms.task.clear();
		manager.forms.ipList.clear();
		manager.forms.ipRange.clear();
		manager.forms.account.clear();
		manager.data.interval_updateTaskStat.stop();
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
			server: "http://api.waspace.net:80/",
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
						manager.forms.manager.hide();
						manager.forms.auth.show();
					};
					break;
				case "Blocked":
					WA_ManagerStorage.apiUserException[key] = function(){
						NoticeShow(manager.lng.exception.general[key], "error");
						manager.forms.manager.hide();
						manager.forms.auth.show();
					};
					break;
				case "NotActivated":
					WA_ManagerStorage.apiUserException[key] = function(){
						NoticeShow(manager.lng.exception.general[key], "error");
						manager.forms.account_activate.show();
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
						if(gErrorName != "WrongSessionId" && gErrorName != "Blocked"){
							manager.forms.manager.show();
							$(".header [name=login]").html("User Login");
							manager.forms.folder.load();
						}
					}
				});
			};
		}else{
			//run manager
			var urlParams = parseUrl();
			WA_ManagerStorage.run({
				onErrorInLogin: function(data, gErrorName){
					if(gErrorName != "WrongSessionId" && gErrorName != "Blocked"){
						manager.forms.manager.show();
						$(".header [name=login]").html("User Login");
						manager.forms.folder.load();
					};
				},
				onNeedAuth: function(){
					if(urlParams.form && urlParams.form == "reg") manager.forms.reg.show();
					else manager.forms.auth.show();
				}
			});
		};
	});
})(jQuery);

//fix js object
if(!String.prototype.trim){
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g,'');
	};
};