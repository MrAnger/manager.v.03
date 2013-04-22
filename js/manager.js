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
			onReadyDom: []
		},
		data: {
			user: {
				token: false
			},
			elem: {}
		},
		utils: {
			showNotice: NoticeShow,
			checkType: CheckType,
			formatDate: formatDate,
			consoleAppendToText: console_appendText
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
				switch(data.form){
					case "task":
						$(".main .auth-success .tasks-content").show();
						manager.methods.loadFolders();
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
			logOut: function(data){
				data = $.extend(true, {
					callback: function(){}
				}, data);

				api.methods.logOut({
					token: manager.methods.getToken(),
					callback: function(){
						manager.methods.managerFormHide({callback: function(){
							DataStorage.del(manager.options.params.tokenKey);
							manager.methods.authFormShow();
						}});
					}
				});

				data.callback();
			},
			loadFolders: function(){
				//delete all printed folders
				$("[wa_folder]:not([default])").remove();
				//get folders and print
				api.methods.getFolders({
					token: manager.methods.getToken(),
					callback: function(folders){
						folders.sort(function(a,b){return a.id- b.id;});
						$.each(folders, function(key, folder){
							manager.methods.folder.addHtml(folder);
						});
					}
				});
			},
			folder: {
				addHtml: function(param){
					var layout = $("[wa_folder][default]"),
						parent = $(layout).parent(),
						html = $(layout).clone().removeAttr("default").appendTo(parent);

					$(html).find("[name=view_folderId]").html(param.id);
					$(html).find("[name=view_folderName]").html(param.name);
					$(html).find("[name=view_taskCount]").html(param.task_count);
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

					$(input_name).val($(folder).find("[name=view_folderName]").html());
					$(input_name).focus();
					$(input_id).val($(folder).find("[name=view_folderId]").html());
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
						if($(folder).find("[name=view_folderId]").html() == id) output = folder;
					});

					return output;
				},
				getId: function(folder){
					return $(folder).find("[name=view_folderId]").html();
				},
				getName: function(folder){
					return $(folder).find("[name=view_folderName]").html();
				},
				setName: function(folder, name){
					$(folder).find("[name=view_folderName]").html(name);
				},
				setCountTask: function(folder, count){
					$(folder).find("[name=view_taskCount]").html(count);
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
			$(consoleBox).show();
			clip.reposition();
			$(consoleBox).hide();
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
					manager.methods.folder.setName(manager.methods.folder.getHtml(inputs.id.value), inputs.folder_name.value);
					manager.methods.folder.renameMsgHide();
				}
			});
		};

		return false;
	});
	//SET RENAME FOLDER FORM

	$(document).on("click","#confirm_deleteFolder [name=yes]", function(e){
		var Self = this,
			id = $(Self).parents("#confirm_deleteFolder").find("[name=id]").val();

		api.methods.deleteFolders({
			token: manager.methods.getToken(),
			ids: [id],
			callback: function(){
				$(manager.methods.folder.getHtml(id)).remove();
			}
		});
	});

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
			console.log("1");
			timeout_destroy = false;
		}, function(){
			console.log("2");
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
			/*manager.methods.managerFormHide({callback: function(){
				DataStorage.del(manager.options.params.tokenKey);
				manager.methods.authFormShow();
			}});*/
			manager.methods.logOut();
		};

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
				DataStorage.set(manager.options.params.authStep, 0);
				manager.methods.setToken(DataStorage.get(manager.options.params.authStepToken));
				manager.methods.managerFormShow();
			};
		}else{
			if(DataStorage.get(manager.options.params.tokenKey)){
				manager.methods.setToken(DataStorage.get(manager.options.params.tokenKey));
				manager.methods.managerFormShow();
			}else{
				manager.methods.authFormShow();
			};
		};
	});
})(jQuery);