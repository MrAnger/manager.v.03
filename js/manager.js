(function($){
	var manager = window.manager = {
		options: {
			lng: {
				"default": "ru-ru",
				ru: "ru-ru",
				en: "en-en",
				ua: "ua-ua"
			},
			params: {
				lngDataKey: "lng",
				tokenKey: "token",
				authStep: "authStep",
				authStepNumber: "authStepNumber",
				authStepToken: "authStepToken"
			},
			onReadyDom: [],
			onLogin: [],
			mobileUrl: "http://mobile.mv3.waspace.net"
		},
		data: {
			user: {
				token: false
			},
			elem: {},
			ipLists: [],
			graphs: {},
			geoStorage: false
		},
		const: {
			system:{}
		},
		utils: {
			showNotice: NoticeShow,
			checkType: CheckType,
			formatDate: formatDate,
			consoleAppendToText: console_appendText,
			isInt: isInt
		},
		graph: {
			dayTargeting: DayTargeting,
			weekTargeting: WeekTargeting,
			dayStat: DayStat,
			timeDistribution: TimeDistribution
		},
		methods: {
			getToken: function(){
				return manager.data.user.token;
			},
			setToken: function(token){
				manager.data.user.token = token;
			},
			authFormShow: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$("form[name=auth] input[type=text], form[name=auth] input[type=password]").val("");
				$("form[name=auth] input[type=checkbox]").each(function(key, checkbox){checkbox.checked = false;});

				$(".main .auth-no-success").show();
				$("form[name=auth]").show();

				data.callback({
					form: "form[name=auth]",
					mail: "form[name=auth] input[name=mail]",
					password: "form[name=auth] input[name=password]"
				});
			},
			authFormHide: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$(".main .auth-no-success").hide();
				$("form[name=auth]").hide();

				data.callback();
			},
			regFormShow: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$("[name=reg] input[type=text], [name=reg] input[type=password]").val("");

				$(".main .auth-no-success").show();
				$("[name=reg]").show();

				data.callback();
			},
			regFormHide: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$(".main .auth-no-success").hide();
				$("[name=reg]").hide();

				data.callback();
			},
			forgotFormShow: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$("form[name=auth] input[type=text]").val("");
				$("form[name=auth] input[type=password]").val("");
				$("form[name=auth] input[name=forgot_code], form[name=auth] input[name=forgot_password]").attr("disabled", "disabled");
				$("form[name=auth]").attr("wa_step", 0);

				$(".main .auth-no-success").show();
				$("form[name=forgot]").show();

				data.callback();
			},
			forgotFormHide: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$(".main .auth-no-success").hide();
				$("form[name=forgot]").hide();

				data.callback();
			},
			managerFormShow: function(data){
				data = $.extend(true, {
					callback: function(){},
					form: "default"
				}, data);

				$(".main .auth-success").show();
				$(".header .auth-success").show();
				$(".main .auth-success .manager").children().hide();
				$(".main .auth-success .tasks-content .not-content").hide();
				switch(data.form){
					case "task":
						$(".main .auth-success .tasks-content").show();

						$(manager.methods.folder.getFoldersHtml()).remove();
						$(manager.methods.task.getTasksHtml()).remove();
						manager.methods.taskSettingFormHide();
						$("[name=not-setting] [name=add-category]").hide();
						$("[name=not-setting] [name=add-task]").hide();

						manager.methods.loadFolders();
						manager.methods.refreshDataIpLists();
						break;
					case "iplist":
						$(".main .auth-success .iplists-content").show();
						break;
					case "account":
						$(".main .auth-success .account-content").show();
						break;
					default:
						manager.methods.managerFormShow($.extend(true, data, {form: "task"}));
				};

				data.callback();
			},
			managerFormHide: function(data){
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
			},
			taskSettingFormShow: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				manager.methods.taskSettingFormClear();

				$("[name=not-setting]").hide();
				$("[name=holder-task-setting] .tab-box li.general").click();

				data.callback();
			},
			taskSettingFormHide: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				$("[name=not-setting]").show().children().hide();

				data.callback();
			},
			taskSettingFormClear: function(){
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
				$(manager.methods.geoTargeting.getCountriesHtml()).remove();
				$("[name=task-setting] [name=selectBox_country]").html("");

				$("#task-status").removeClass("status-off");

				//check checkbox on graph day stat
				$("#dayStat_cb_max input[type=checkbox], #dayStat_cb_min input[type=checkbox], #dayStat_cb_give input[type=checkbox], #dayStat_cb_incomplete input[type=checkbox], #dayStat_cb_overload input[type=checkbox]").each(function(key, el){
					el.checked = true;
				});
			},
			logOut: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				api.methods.logOut({
					token: manager.methods.getToken(),
					callback: function(){
						manager.methods.managerFormHide({callback: function(){
							DataStorage.del(manager.options.params.tokenKey);
							manager.methods.setToken("");
							manager.methods.authFormShow();
						}});
					}
				});

				data.callback();
			},
			loadFolders: function(){
				//delete all printed folders
				$(manager.methods.folder.getFoldersHtml()).remove();
				$(".folders .not-content").hide();
				//get folders and print
				api.methods.getFolders({
					token: manager.methods.getToken(),
					callback: function(folders){
						folders.sort(function(a,b){return a.id- b.id;});
						$.each(folders, function(key, folder){
							manager.methods.folder.addHtml(folder);
						});

						$(manager.methods.folder.getFoldersHtml()).eq(0).click();

						manager.methods.folder.toggleNotContent();
					}
				});
			},
			loadTasks: function(folderId){
				//delete all printed folders
				$(manager.methods.task.getTasksHtml()).remove();
				$(".tasks .not-content").hide();
				//get tasks and print
				api.methods.getTasks({
					token: manager.methods.getToken(),
					folderId: folderId,
					callback: function(tasks){
						tasks.sort(function(a,b){return a.taskId - b.taskId;});
						$.each(tasks, function(key, task){
							manager.methods.task.addHtml(task);
						});

						manager.methods.task.toggleNotContent();

						manager.methods.folder.setCountTask(manager.methods.folder.getHtml(folderId), tasks.length);

						$(manager.methods.task.getTasksHtml()).eq(0).click();
					}
				});
			},
			loadTaskSetting: function(taskHtml){
				manager.methods.taskSettingFormShow();
				var taskMethods = manager.methods.task,
					folderId = taskMethods.getParam(taskHtml, "folderId"),
					taskId = taskMethods.getParam(taskHtml, "taskId");
				var inputs = [
					{name: "folderId", value: taskMethods.getParam(taskHtml, "folderId")},//
					{name: "taskId", value: taskMethods.getParam(taskHtml, "taskId")},//
					{name: "name", value: taskMethods.getParam(taskHtml, "name")},//
					{name: "listId", value: taskMethods.getParam(taskHtml, "listId")},//
					{name: "afterClick", value: taskMethods.getParam(taskHtml, "afterClick")},//
					{name: "beforeClick", value: taskMethods.getParam(taskHtml, "beforeClick")},//
					{name: "allowProxy", value: eval(taskMethods.getParam(taskHtml, "allowProxy"))},//
					{name: "ignoreGU", value: eval(taskMethods.getParam(taskHtml, "ignoreGU"))},//
					{name: "growth", value: taskMethods.getParam(taskHtml, "growth")},//
					{name: "domain", value: taskMethods.getParam(taskHtml, "domain")},//
					{name: "profile", value: taskMethods.getParam(taskHtml, "profile")},//
					{name: "frozen", value: eval(taskMethods.getParam(taskHtml, "frozen"))},
					{name: "listMode", value: eval(taskMethods.getParam(taskHtml, "listMode"))},//
					{name: "rangeSize", value: taskMethods.getParam(taskHtml, "rangeSize")},//
					{name: "uniquePeriod", value: taskMethods.getParam(taskHtml, "uniquePeriod")},//
					{name: "mask", value: taskMethods.getParam(taskHtml, "mask")},//
					{name: "days", value: taskMethods.getParam(taskHtml, "days")},//
					{name: "extSource", value: taskMethods.getParam(taskHtml, "extSource")}//
				];

				for(var i=0; i<=inputs.length-1; i++){
					var name = inputs[i].name,
						val = inputs[i].value;
					if(name == "listId"){
						if(val != 0){
							$("form[name=task-setting] [name='"+name+"']").val(val).change();
							$("form[name=task-setting] [name=use_listIp]").click();

							var listMode = eval(taskMethods.getParam(taskHtml, "listMode"));
							if(listMode) $("form[name=task-setting] [name=listIp-type][value=true]").prop("checked", true);
							else $("form[name=task-setting] [name=listIp-type][value=false]").prop("checked", true);
						};
					}else if(name == "listMode"){
						continue;
					}else if(name == "mask"){
						if(val != ""){
							$("form[name=task-setting] [name=use_mask]").click();
							$("form[name=task-setting] [name='"+name+"']").val(val);
							$("form[name=task-setting] [name=afterClick]").val(taskMethods.getParam(taskHtml, "afterClick"));

							$("form[name=task-setting] [name=ignoreGU]").prop("checked", eval(taskMethods.getParam(taskHtml, "ignoreGU")));
						};
					}else if(name == "afterClick"){
						continue;
					}else if(name == "ignoreGU"){
						continue;
					}else if(name == "allowProxy"){
						$("form[name=task-setting] [name=allowProxy]").prop("checked", !eval(taskMethods.getParam(taskHtml, "allowProxy")));
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

				//get DayTargeting
				api.methods.getDayTargeting({
					token: manager.methods.getToken(),
					folderId: folderId,
					taskId: taskId,
					callback: function(data){
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
					},
					ge_callback: function(){
						manager.methods.taskSettingFormHide()
					}
				});

				//get WeekTargeting
				api.methods.getWeekTargeting({
					token: manager.methods.getToken(),
					folderId: folderId,
					taskId: taskId,
					callback: function(data){
						var lineMin = {
								name: "min",
								data: []
							};

						data.sort(function(a,b){return a.id - b.id;});

						$.each(data, function(key, val){
							lineMin.data.push([val.id, val.val]);
						});

						manager.data.graphs.weekTargeting.setData([lineMin]);
					},
					ge_callback: function(){
						manager.methods.taskSettingFormHide()
					}
				});

				//get TimeDistribution
				api.methods.getTimeDistribution({
					token: manager.methods.getToken(),
					folderId: folderId,
					taskId: taskId,
					callback: function(data){
						var lineMin = {
							name: "min",
							data: []
						};

						data.sort(function(a,b){return a.id - b.id;});

						$.each(data, function(key, val){
							if(val.id%5 == 0) lineMin.data.push([val.id, val.val]);
						});

						manager.data.graphs.timeDistribution.setData([lineMin]);
					},
					ge_callback: function(){
						manager.methods.taskSettingFormHide()
					}
				});

				//get geoTargeting
				api.methods.getGeoTargeting({
					token: manager.methods.getToken(),
					folderId: folderId,
					taskId: taskId,
					callback: function(data){
						$.each(data, function(key, country){
							manager.data.geoStorage.add(country.id, country.shortName, country.target, country.recd);
						});

						manager.methods.geoTargeting.printInSelectBox(manager.data.geoStorage.getNotSelected());

						//add selected countries
						$.each(manager.data.geoStorage.getSelected(), function(key, country){
							manager.methods.geoTargeting.addHtml(country);
						});
					},
					ge_callback: function(){
						manager.methods.taskSettingFormHide()
					}
				});

				//get dayStat
				api.methods.getDayStat({
					token: manager.methods.getToken(),
					folderId: folderId,
					taskId: taskId,
					callback: function(data){
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
					},
					ge_callback: function(){
						manager.methods.taskSettingFormHide()
					}
				});
			},
			refreshDataIpLists: function(){
				api.methods.getIpLists({
					token: manager.methods.getToken(),
					callback: function(arr){
						manager.data.ipLists = arr;

						var html = "<option value=0></option>";
						for(var i=0; i<=arr.length-1; i++) html += '<option value="'+arr[i].id+'">'+arr[i].name+'</option>';

						$("[name=task-setting] [name=listId]").html(html).change();
					}
				})
			},
			folder:{
				addHtml: function(param){
					var layout = $("[wa_folder][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					//add param to html
					$.each(param, function(key, val){
						$('<input type="hidden" name="'+key+'" value="'+val+'">').appendTo(html);
					});

					manager.methods.folder.setIdHtml(html, param.id);
					manager.methods.folder.setNameHtml(html, param.name);
					manager.methods.folder.setCountTask(html, param.task_count);
				},
				addMsgShow: function(){
					var msg = $("#msg_addFolder").fadeIn("fast"),
						input = $(msg).find("[name=folder_name]");

					$(input).val("");
					$(input).focus();
				},
				addMsgHide: function(){
					$("#msg_addFolder .add-box .close").click();
				},
				renameMsgShow: function(el){
					var msg = $("#msg_renameFolder").fadeIn("fast"),
						input_name = $(msg).find("[name=folder_name]"),
						input_id = $(msg).find("[name=folder_id]"),
						folder = $(el).parents("[wa_folder]");

					$(input_name).val(manager.methods.folder.getParam(folder, "name"));
					$(input_name).focus();
					$(input_id).val(manager.methods.folder.getParam(folder, "id"));
				},
				renameMsgHide: function(){
					$("#msg_renameFolder .add-box .close").click();
				},
				deleteMsgShow: function(el){
					var msg = $("#confirm_deleteFolder").fadeIn("fast"),
						folder = $(el).parents("[wa_folder]");

					$(msg).find("[name=id]").val(manager.methods.folder.getId(folder));
				},
				deleteMsgHide: function(){
					$("#confirm_deleteFolder .close").click();
				},
				getHtml: function(id){
					var output = false;

					$("[wa_folder]:not([default])").each(function(key, folder){
						if($(folder).find("[name=id]").val() == id) output = folder;
					});

					return output;
				},
				getId: function(folder){
					return manager.methods.folder.getParam(folder, "id");
				},
				getFoldersHtml: function(){
					var out = [];

					$("[wa_folder]:not([default])").each(function(key, folder){out.push(folder)});

					return out;
				},
				toggleNotContent: function(){
					var not_content = $(".folders .not-content"),
						add_category = $("[name=not-setting] [name=add-category]");

					if(manager.methods.folder.getFoldersHtml().length == 0){
						$(not_content).show();
						$(add_category).show();
					}else{
						$(not_content).hide();
						$(add_category).hide();
					};
				},
				getActiveHtml: function(){
					return $(".active[wa_folder]:not([default])")[0];
				},
				getParam: function(folderHtml, param){
					return $(folderHtml).find("input[name='"+param+"']").val();
				},
				setParam: function(folderHtml, param, val){
					var el = $(folderHtml).find("input[name='"+param+"']");
					if(el.length == 0){
						$('<input type="hidden" name="'+param+'" value="'+val+'">').appendTo(folderHtml);
					}else{
						$(el).val(val);
					};
				},
				setNameHtml: function(folderHtml, name){
					$(folderHtml).find("[name=view_folderName]").html(name);
				},
				setIdHtml: function(folderHtml, id){
					$(folderHtml).find("[name=view_folderId]").html(id);
				},
				setCountTask: function(folder, count){
					$(folder).find("[name=view_taskCount]").html(count);
				}
			},
			task:{
				addHtml: function(param){
					var layout = $("[wa_task][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					//add param to html
					$.each(param, function(key, val){
						$('<input type="hidden" name="'+key+'" value="'+val+'">').appendTo(html);
					});

					manager.methods.task.setIdHtml(html, manager.methods.task.getParam(html, "taskId"));
					manager.methods.task.setNameHtml(html, manager.methods.task.getParam(html, "name"));
					manager.methods.task.setStatusHtml(html, !eval(manager.methods.task.getParam(html, "frozen")));
				},
				setStatusHtml: function(taskHtml, status){
					var el = $(taskHtml).find("[name=view_taskStatus]");
					if(status){
						$(el).removeClass("on off").addClass("on").html(manager.lng.form.task.status.on);
					}else{
						$(el).removeClass("on off").addClass("off").html(manager.lng.form.task.status.off);
					};
				},
				setNameHtml: function(taskHtml, name){
					$(taskHtml).find("[name=view_taskName]").html(name);
				},
				setIdHtml: function(taskHtml, id){
					$(taskHtml).find("[name=view_taskId]").html(id);
				},
				getTasksHtml: function(){
					var out = [];

					$("[wa_task]:not([default])").each(function(key, task){out.push(task)});

					return out;
				},
				getHtml: function(folderId, taskId){
					var output = false;

					$("[wa_task]:not([default])").each(function(key, task){
						if($(task).find("[name=folderId]").val() == folderId && $(task).find("[name=taskId]").val() == taskId) output = task;
					});

					return output;
				},
				getParam: function(taskHtml, param){
					return $(taskHtml).find("input[name='"+param+"']").val();
				},
				setParam: function(taskHtml, param, val){
					var el = $(taskHtml).find("input[name='"+param+"']");
					if(el.length == 0){
						$('<input type="hidden" name="'+param+'" value="'+val+'">').appendTo(taskHtml);
					}else{
						$(el).val(val);
					};
				},
				addMsgShow: function(){
					var msg = $("#msg_addTask").fadeIn("fast"),
						input_taskName = $(msg).find("[name=task_name]"),
						input_taskDomain = $(msg).find("[name=task_domain]"),
						input_taskExtSource = $(msg).find("[name=task_extSource]");

					$(input_taskName).val("");
					$(input_taskDomain).val("");
					$(input_taskExtSource).val("");
					$(input_taskName).focus();
				},
				addMsgHide: function(){
					$("#msg_addTask .add-box .close").click();
				},
				deleteMsgShow: function(el){
					var msg = $("#confirm_deleteTask").fadeIn("fast"),
						task = $(el).parents("[wa_task]");

					$(msg).find("[name=folderId]").val(manager.methods.task.getParam(task, "folderId"));
					$(msg).find("[name=taskId]").val(manager.methods.task.getParam(task, "taskId"));
				},
				deleteMsgHide: function(){
					$("#confirm_deleteTask .close").click();
				},
				toggleNotContent: function(){
					var not_content = $(".tasks .not-content"),
						add_task = $("[name=not-setting] [name=add-task]");

					if(manager.methods.task.getTasksHtml().length == 0){
						$(not_content).show();
						$(add_task).show();
					}else{
						$(not_content).hide();
						$(add_task).hide();
					};
				},
				getActiveHtml: function(){
					return $(".active[wa_task]:not([default])")[0];
				},
				setStatusFromTaskSettingForm: function(state, switcher){
					api.methods.setTaskStatus({
						token: manager.methods.getToken(),
						folderId: manager.methods.task.getParam(manager.methods.task.getActiveHtml(), "folderId"),
						taskId: manager.methods.task.getParam(manager.methods.task.getActiveHtml(), "taskId"),
						frozen: !state,
						callback: function(){
							manager.methods.task.setParam(manager.methods.task.getActiveHtml(), "frozen", !state);
							manager.methods.task.setStatusHtml(manager.methods.task.getActiveHtml(), state);
						},
						ge_callback: function(){
							if(state) $(switcher).addClass("status-off");
							else $(switcher).removeClass("status-off");
						}
					});
				},
				getTaskCost: function(beforeClick, afterClick, rangeSize, uniquePeriod){
					var _const = manager.const.system;
					return ((_const.TaskSecondCost * (beforeClick + afterClick)) + (_const.IPRangeFactor * rangeSize) + (_const.UniqueTimeFactor * uniquePeriod) + _const.TaskMinCost).toFixed(2);
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
			geoTargeting:{
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
					$.each(param, function(key, val){
						$('<input type="hidden" name="'+key+'" value="'+val+'">').appendTo(html);
					});

					manager.methods.geoTargeting.setNameHtml(html, manager.methods.geoTargeting.getParam(html, "fullName"));
					manager.methods.geoTargeting.setTargetHtml(html, manager.methods.geoTargeting.getParam(html, "target"));
					manager.methods.geoTargeting.setRecdHtml(html, manager.methods.geoTargeting.getParam(html, "recd"));
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
				getParam: function(html, param){
					return $(html).find("input[name='"+param+"']").val();
				},
				setParam: function(html, param, val){
					var el = $(html).find("input[name='"+param+"']");
					if(el.length == 0){
						$('<input type="hidden" name="'+param+'" value="'+val+'">').appendTo(html);
					}else{
						$(el).val(val);
					};
				},
				getCountriesHtml: function(){
					return $("[wa_geo_country]:not([default])");
				}
			}
		}
	};

	//SET CONSOLE FORM
	$(document).on("click", ".console-box .console-send input[type=submit]", function(e){
		var input = $(".console-box .console-send input[type=text]"),
			text = $(input).val();
		$(input).val("");

		if(text.length > 0){
			try{
				if(JSON && JSON.parse)JSON.parse(text);
				else eval("v="+text);

				var defaultReceive = {};
				defaultReceive[api.Constants.OperationItem.Status] = api.Constants.ResponseStatus.GeneralError;
				defaultReceive[api.Constants.OperationItem.Error] = api.Constants.GeneralError.NoResponse;
				defaultReceive["_defaultReceive"] = true;
				defaultReceive = $.toJSON(defaultReceive);

				var request = new api.utils.request(
					api.options.server,//url
					text,//data
					null,//callback
					defaultReceive,//default receive data
					api.options.timeout,//timeout
					null,//loader show callback
					null,//loader hide callback
					function(txt){
						manager.utils.consoleAppendToText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "CONSOLE\nSend to server: \n-------------------\n" + txt);
					},//log send callback
					function(txt){
						manager.utils.consoleAppendToText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "CONSOLE\nReceive from server: \n-------------------\n" + txt);
					}//log receive callback
				);
				request.send();
			}catch(e){};
		};
	});
	//console
	manager.options.onReadyDom.push(function(){
		var consoleBox = $(".console-box .open-box"),
			clip = manager.data.elem.console_clip = new ZeroClipboard.Client();

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
			NoticeShow(manager.lng.form.console.copy.complete, "success");
		});
		$(window).resize(function(e){
			if($(consoleBox).css("display") != "none"){
				clip.reposition();
			};
			/*$(consoleBox).show();
			clip.reposition();
			$(consoleBox).hide();*/
		});
	});
	//datTargeting graph
	manager.options.onReadyDom.push(function(){
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
	manager.options.onReadyDom.push(function(){
		manager.data.graphs.weekTargeting = new WeekTargeting({
			holder: $("#graph_weekTargeting")
		});
	});
	//dayStat graph
	manager.options.onReadyDom.push(function(){
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
	manager.options.onReadyDom.push(function(){
		manager.data.graphs.timeDistribution = new TimeDistribution({
			holder: $("#graph_timeDistribution")
		});
	});
	//change search country
	manager.options.onReadyDom.push(function(){
		var input = $("[name=task-setting] [name=searchCountry]")[0],
			oldText = null,
			interval = new api.utils.interval(function(){
				if(oldText != input.value){
					manager.methods.geoTargeting.printInSelectBox(manager.data.geoStorage.find(input.value));

					oldText = input.value;
				};
			}, 300);
		interval.start();
	});
	//calculate task cost
	manager.options.onReadyDom.push(function(){
		var interval = new api.utils.interval(function(){
			var beforeClick = $("form[name=task-setting] [name=beforeClick]").val(),
				afterClick = $("form[name=task-setting] [name=afterClick]").val(),
				rangeSize = $("form[name=task-setting] [name=rangeSize]").val(),
				uniquePeriod = $("form[name=task-setting] [name=uniquePeriod]").val();

			$("[name=holder-task-setting] [name=view_taskCost]").html(manager.methods.task.getTaskCost(
				(isInt(beforeClick)) ? parseInt(beforeClick) : 0,
				(isInt(afterClick)) ? parseInt(afterClick) : 0,
				(isInt(rangeSize)) ? parseInt(rangeSize) : 0,
				(isInt(uniquePeriod)) ? parseInt(uniquePeriod) : 0));
		}, 500);
		interval.start();
	});
	//get system const
	manager.options.onLogin.push(function(){
		api.methods.getSystemConstants({
			token: manager.methods.getToken(),
			callback: function(data){
				$.each(data, function(key, val){
					manager.const.system[key] = val;
				});
			}
		});
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
			manager.utils.showNotice(manager.lng.form.auth.mail.error, "error");
			$(inputs.mail).focus();
		}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
			manager.utils.showNotice(manager.lng.form.auth.password.error, "error");
			$(inputs.password).focus();
		}else{
			api.methods.auth({
				mail: inputs.mail.value,
				password: inputs.password.value,
				remember: !inputs.remember.checked,
				exception: {
					NotMatch: function(){
						manager.utils.showNotice(manager.lng.exception.query.auth.NotMatch, "error");
						$(inputs.password).focus();
					},
					SessionLimit: function(){
						manager.utils.showNotice(manager.lng.exception.query.auth.SessionLimit, "error");
					}
				},
				callback: function(data){
					manager.methods.setToken(data.token);
					if(!inputs.remember.checked) DataStorage.set(manager.options.params.tokenKey, manager.methods.getToken());
					else DataStorage.del(manager.options.params.tokenKey);

					//submit auth form
					$(form).attr("wa_auth", 1);

					DataStorage.set(manager.options.params.authStep, 1);
					DataStorage.set(manager.options.params.authStepNumber, 1);
					DataStorage.set(manager.options.params.authStepToken, manager.methods.getToken());

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
			manager.utils.showNotice(manager.lng.form.reg.login.error, "error");
			$(inputs.login).focus();
		}else if(!CheckType(inputs.mail.value, TYPE.MAIL)){
			manager.utils.showNotice(manager.lng.form.reg.mail.error, "error");
			$(inputs.mail).focus();
		}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
			manager.utils.showNotice(manager.lng.form.reg.password.error, "error");
			$(inputs.password).focus();
		}else{
			api.methods.register({
				mail: inputs.mail.value,
				password: inputs.password.value,
				login: inputs.login.value,
				exception: {
					MailExists: function(){
						manager.utils.showNotice(manager.lng.exception.query.reg.MailExists, "error");
						$(inputs.mail).focus();
					},
					LoginExists: function(){
						manager.utils.showNotice(manager.lng.exception.query.reg.LoginExists, "error");
						$(inputs.login).focus();
					},
					Forbidden: function(){
						manager.utils.showNotice(manager.lng.exception.query.reg.Forbidden, "error");
					}
				},
				callback: function(data){
					NoticeShow(manager.lng.form.reg.success, "success");

					var mail = inputs.mail.value,
						pass = inputs.password.value;

					manager.methods.regFormHide({callback: function(){
						manager.methods.authFormShow({callback: function(data){
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
				manager.utils.showNotice(manager.lng.form.forgot.mail.error, "error");
				$(inputs.mail).focus();
			}else{
				api.methods.resetPassword({
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
				manager.utils.showNotice(manager.lng.form.forgot.code.error, "error");
				$(inputs.code).focus();
			}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
				manager.utils.showNotice(manager.lng.form.forgot.password.error, "error");
				$(inputs.password).focus();
			}else{
				api.methods.confirmResetPassword({
					mail: inputs.mail.value,
					code: inputs.code.value,
					password: inputs.password.value,
					callback: function(){
						NoticeShow(manager.lng.form.forgot.success.step2, "success");
						manager.methods.forgotFormHide({
							callback: function(){
								manager.methods.authFormShow({
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
			manager.utils.showNotice(manager.lng.form.folder_add.folder_name.error, "error");
			$(inputs.folder_name).focus();
		}else{
			api.methods.addFolder({
				token: manager.methods.getToken(),
				name: inputs.folder_name.value,
				exception: {
					LimitExceeded: function(){
						manager.utils.showNotice(manager.lng.exception.query.addFolder.LimitExceeded, "error");
					}
				},
				callback: function(data){
					manager.methods.folder.addMsgHide();
					manager.methods.folder.addHtml({
						name: inputs.folder_name.value,
						id: data.id,
						task_count: 0
					});

					if(manager.methods.folder.getFoldersHtml().length == 1) $(manager.methods.folder.getFoldersHtml()).eq(0).click();
					manager.methods.folder.toggleNotContent();
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
			manager.utils.showNotice(manager.lng.form.folder_rename.folder_name.error, "error");
			$(inputs.folder_name).focus();
		}else{
			api.methods.renameFolder({
				token: manager.methods.getToken(),
				id: inputs.id.value,
				name: inputs.folder_name.value,
				callback: function(){
					manager.methods.folder.setParam(manager.methods.folder.getHtml(inputs.id.value), "name", inputs.folder_name.value);
					manager.methods.folder.setNameHtml(manager.methods.folder.getHtml(inputs.id.value), inputs.folder_name.value);
					manager.methods.folder.renameMsgHide();
				}
			});
		};

		return false;
	});
	//SET RENAME FOLDER FORM

	//SET CONFIRM DELETE FOLDER
	$(document).on("click","#confirm_deleteFolder [name=yes]", function(e){
		var Self = this,
			id = $(Self).parents("#confirm_deleteFolder").find("[name=id]").val();

		api.methods.deleteFolders({
			token: manager.methods.getToken(),
			ids: [id],
			callback: function(){
				var folders = manager.methods.folder.getFoldersHtml(),
					folder = manager.methods.folder.getHtml(id),
					isActive = (manager.methods.folder.getActiveHtml() == folder) ? true : false;

				$(folder).remove();

				if(folders.length > 1){
					if(isActive) $(manager.methods.folder.getFoldersHtml()).eq(0).click();
				}
				else manager.methods.taskSettingFormHide();

				manager.methods.folder.toggleNotContent();
				manager.methods.task.toggleNotContent();
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
			taskId: 0,
			folderId: 0,
			listId: 0,
			afterClick: api.Constants.Limit.Task.AfterClick.Value.Default,
			beforeClick: api.Constants.Limit.Task.BeforeClick.Value.Default,
			allowProxy: false,
			ignoreGU: false,
			growth: 0,
			domain: "",
			profile: "",
			frozen: false,
			listMode: true,
			rangeSize: api.Constants.Limit.Task.RangeSize.Value.Default,
			uniquePeriod: api.Constants.Limit.Task.UniquePeriod.Value.Default,
			name: "",
			mask: "",
			days: 0,
			extSource: ""
		};

		//check input data
		if(!CheckType(inputs.name.value, TYPE.TASK_NAME)){
			manager.utils.showNotice(manager.lng.form.task_add.name.error, "error");
			$(inputs.name).focus();
		}else if(!CheckType(inputs.domain.value, TYPE.TASK_DOMAIN)){
			manager.utils.showNotice(manager.lng.form.task_add.domain.error, "error");
			$(inputs.domain).focus();
		}else if(!CheckType(inputs.extSource.value, TYPE.TASK_EXTSOURCE)){
			manager.utils.showNotice(manager.lng.form.task_add.extSource.error, "error");
			$(inputs.extSource).focus();
		}else{
			$.extend(true, task_data, {
				folderId: manager.methods.folder.getId(manager.methods.folder.getActiveHtml()),
				name: inputs.name.value,
				domain: inputs.domain.value,
				extSource: inputs.extSource.value
			});

			api.methods.addTask($.extend(true, {}, task_data, {
				token: manager.methods.getToken(),
				exception: {
					LimitExceeded: function(){
						manager.utils.showNotice(manager.lng.exception.query.addTask.LimitExceeded, "error");
					}
				},
				callback: function(receive_data){
					manager.methods.task.addHtml($.extend(true, task_data, {
						taskId: receive_data.taskId
					}));
					manager.methods.task.addMsgHide();

					if(manager.methods.task.getTasksHtml().length == 1) $(manager.methods.task.getTasksHtml()).eq(0).click();

					manager.methods.task.toggleNotContent();
				}
			}));
		};

		return false;
	});
	//SET ADD NEW FOLDER FORM

	//SET CONFIRM DELETE TASK
	$(document).on("click","#confirm_deleteTask [name=yes]", function(e){
		var Self = this,
			folderId = $(Self).parents("#confirm_deleteTask").find("[name=folderId]").val(),
			taskId = $(Self).parents("#confirm_deleteTask").find("[name=taskId]").val();

		api.methods.deleteTasks({
			token: manager.methods.getToken(),
			folderId: folderId,
			ids: [taskId],
			callback: function(){
				var tasks = manager.methods.task.getTasksHtml(),
					task = manager.methods.task.getHtml(folderId, taskId),
					folder = manager.methods.folder.getHtml(folderId),
					isActive = (manager.methods.task.getActiveHtml() == task) ? true : false;

				$(task).remove();

				manager.methods.folder.setParam(folder, "task_count", parseInt(manager.methods.folder.getParam(folder, "task_count")) - 1);
				manager.methods.folder.setCountTask(folder, manager.methods.folder.getParam(folder, "task_count"));

				if(tasks.length > 1){
					if(isActive) $(manager.methods.task.getTasksHtml()).eq(0).click();
				}
				else manager.methods.taskSettingFormHide();

				manager.methods.task.toggleNotContent();
			}
		});
	});
	//SET CONFIRM DELETE TASK

	//utils
	function NoticeShow(text, type){
		var types = {
			error: "false",
			success: "true"
		},
			timeout_destroy = true,
			selector = ".msg-content[default]",
			parent = $(selector).parent(),
			msg = $(selector).clone().addClass(types[type]).removeAttr("default").appendTo(parent).hide();

		$(msg).find(".text").html(text);
		$(msg).effect("drop", {
			"direction": "down",
			"mode": "show"
		}, function(){
			setTimeout(function(){
				if(timeout_destroy) $(msg).find(".close").click();
			}, 5 * 1000);
		});
		$(msg).hover(function(){
			timeout_destroy = false;
		}, function(){
			timeout_destroy = true;
			setTimeout(function(){
				if(timeout_destroy) $(msg).find(".close").click();
			}, 5 * 1000);
		});
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
	var Cookie = manager.utils.cookie = {
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
		del : function(name){
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
	var DataStorage = manager.utils.dataStorage = {
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
		del: function(name){
			if(window.localStorage){
				delete window.localStorage[name];
			}else{
				Cookie.del(name);
			};
		}
	};
	var Language = manager.utils.language = {
		get: function(){
			var lang = DataStorage.get(manager.options.params.lngDataKey);

			$.each(manager.options.lng, function(key, val){
				if(val == lang) return lang;
			});

			return manager.options.lng['default'];
		},
		set: function(lng){
			DataStorage.set(manager.options.params.lngDataKey, lng);
			window.location.href = "";
		}
	};
	var DataFormat = manager.utils.dataFormat = {
		int: function(int){
			return int.toString().replace(/(?=(\d\d\d)+$)/g, ' ');
		}
	}
	var TYPE = manager.type = {
		LOGIN: {
			dataType: "text",
			regexp: api.Constants.Limit.Account.Login.Regexp,
			min: api.Constants.Limit.Account.Login.Length.Min,
			max: api.Constants.Limit.Account.Login.Length.Max
		},
		MAIL: {
			dataType: "text",
			regexp: api.Constants.Limit.Account.Mail.Regexp,
			min: api.Constants.Limit.Account.Mail.Length.Min,
			max: api.Constants.Limit.Account.Mail.Length.Max
		},
		PASSWORD: {
			dataType: "text",
			regexp: api.Constants.Limit.Account.Password.Regexp,
			min: api.Constants.Limit.Account.Password.Length.Min,
			max: api.Constants.Limit.Account.Password.Length.Max
		},
		CODE_CONFIRM: {
			dataType: "text",
			regexp: api.Constants.Limit.Confirm.Code.Regexp,
			min:  api.Constants.Limit.Confirm.Code.Length.Min,
			max:  api.Constants.Limit.Confirm.Code.Length.Max
		},
		FOLDER_NAME: {
			dataType: "text",
			regexp: api.Constants.Limit.Folder.Name.Regexp,
			min:  api.Constants.Limit.Folder.Name.Length.Min,
			max:  api.Constants.Limit.Folder.Name.Length.Max
		},
		TASK_NAME: {
			dataType: "text",
			regexp: api.Constants.Limit.Task.Name.Regexp,
			min:  api.Constants.Limit.Task.Name.Length.Min,
			max:  api.Constants.Limit.Task.Name.Length.Max
		},
		TASK_DOMAIN: {
			dataType: "text",
			regexp: api.Constants.Limit.Task.Domain.Regexp,
			min:  api.Constants.Limit.Task.Domain.Length.Min,
			max:  api.Constants.Limit.Task.Domain.Length.Max
		},
		TASK_EXTSOURCE: {
			dataType: "text",
			regexp: api.Constants.Limit.Task.ExtSource.Regexp,
			min:  api.Constants.Limit.Task.ExtSource.Length.Min,
			max:  api.Constants.Limit.Task.ExtSource.Length.Max
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
				else if(_data.toString().search(_type.regexp) == 0 && _data >= _type.min && _data <= _type.max) out = true;
				else out = false;
				break;
			default:
				out = false;
		};

		return out;
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

								manager.methods.graphHint.show(x + ":00 - " + ((x == 23) ? "0" : (parseInt(x)+1)) + ":00" + "<br />" + hint_text, ((itemsCount == 1) ? item.series.name : ""), item.pageY - 15, item.pageX + 15);
							}else{
								manager.methods.graphHint.hide();
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

								manager.methods.graphHint.show(hint_text, item.series.name, item.pageY - 15, item.pageX + 15);
							}else{
								manager.methods.graphHint.hide();
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

								manager.methods.graphHint.show(x + ":00 - " + ((x == 23) ? "0" : (parseInt(x)+1)) + ":00" + "<br />" + text, ((itemsCount == 1) ? item.series.name : ""), item.pageY - 15, item.pageX + 15);
							}else{
								manager.methods.graphHint.hide();
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

								manager.methods.graphHint.show(hint_text, item.series.name, item.pageY - 15, item.pageX + 15);
							}else{
								manager.methods.graphHint.hide();
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
			countries = {};
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
		this.setTarget = function(countryId, target){
			countries[countryId].target = target;
		};
		this.unSelect = function(countryId){
			countries[countryId].target = 0;
		};
		this.find = function(text){
			var output = [];

			if(text != ""){
				$.each(countries, function(key, cntry){
					if((cntry.shortName.indexOf(text) != -1 || cntry.fullName.indexOf(text) != -1) ) output.push(cntry);
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
	}

	//init
	$(document).ready(function(e){
		//print useragent to console
		manager.utils.consoleAppendToText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" +navigator.userAgent);
		//set language
		api.utils.addScript('js/lng/'+Language.get()+'.js');
		$(".lang .lng-item[lng='"+Language.get()+"']").addClass("active");
		//Api server
		api.options.server = "http://node0.waspace-run.net:80/";
		//Api Log
		api.options.log.enable = true;
		api.options.log.callback.send = function(txt){
			manager.utils.consoleAppendToText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "Send to server: \n-------------------\n" + txt);
		};
		api.options.log.callback.receive = function(txt){
			manager.utils.consoleAppendToText(formatDate(new Date(), 'dd/mm/yyyy hh:nn:ss') + "\n" + "Receive from server: \n------------------------\n" + txt);
		};
		//Api Loader
		api.options.loader.enable = true;
		api.options.loader.show = function(txt){
			$(".loader").fadeIn("fast");
		};
		api.options.loader.hide = function(txt){
			$(".loader").fadeOut("fast");
		};
		//Api Exception
		$.each(api.options.exception, function(key, val){
			api.options.exception[key] = function(){
				manager.utils.showNotice(manager.lng.exception.general[key], "error");
			};
		});
		//exception wrong session id
		api.options.exception.WrongSessionId = function(){
			manager.methods.managerFormHide({callback: function(){
				DataStorage.del(manager.options.params.tokenKey);
				manager.methods.setToken("");
				manager.methods.authFormShow();
			}});
		};

		manager.data.geoStorage = new GeoStorage();

		//Translate document
		TranslatePage();
		$(document).bind("DOMNodeInserted", TranslatePage);

		//run func onDomReady
		$.each(manager.options.onReadyDom, function(key, f){f();});

		//check start program
		if(DataStorage.get(manager.options.params.authStep) == 1){
			if(DataStorage.get(manager.options.params.authStepNumber) == 1){
				DataStorage.set(manager.options.params.authStepNumber, 2);
				window.location.href = "";
			}else if(DataStorage.get(manager.options.params.authStepNumber) == 2){
				manager.methods.setToken(DataStorage.get(manager.options.params.authStepToken));

				DataStorage.del(manager.options.params.authStep);
				DataStorage.del(manager.options.params.authStepToken);
				DataStorage.del(manager.options.params.authStepNumber);

				$.each(manager.options.onLogin, function(key, f){
					f();
				});

				manager.methods.managerFormShow();
			};
		}else{
			if(DataStorage.get(manager.options.params.tokenKey)){
				manager.methods.setToken(DataStorage.get(manager.options.params.tokenKey));
				manager.methods.managerFormShow();

				$.each(manager.options.onLogin, function(key, f){
					f();
				});
			}else{
				manager.methods.authFormShow();
			};
		};
	});
})(jQuery);