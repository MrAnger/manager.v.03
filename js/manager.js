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
				tokenKey: "token"
			}
		},
		data: {
			user: {
				token: false
			}
		},
		utils: {
			showMsg: MsgShow,
			checkType: CheckType
		},
		methods: {
			getToken: function(){
				return manager.data.user.token;
			},
			setToken: function(token){
				manager.data.user.token = token;
			}
		}
	};

	//set auth form
	$(document).on("submit", "form[name='auth']", function(e){
		var inputs = {
			mail: this["mail"],
			password: this["password"],
			remember: this["remember"]
		};

		//check input data
		if(!CheckType(inputs.mail.value, TYPE.MAIL)){
			manager.utils.showMsg(manager.lng.form.auth.mail.error, "error");
		}else if(!CheckType(inputs.password.value, TYPE.PASSWORD)){
			manager.utils.showMsg(manager.lng.form.auth.password.error, "error");
		}else{
			api.methods.Auth({
				mail: inputs.mail.value,
				password: inputs.password.value,
				remember: inputs.remember.checked,
				exception: {
					NotMatch: function(){
						manager.utils.showMsg(manager.lng.exception.query.auth.NotMatch, "error");
						$(inputs.password).focus();
					},
					SessionLimit: function(){
						manager.utils.showMsg(manager.lng.exception.query.auth.SessionLimit, "error");
					}
				},
				callback: function(data){
					manager.methods.setToken(data.token);
					if(inputs.remember.checked){
						DataStorage.set(manager.options.params.tokenKey, manager.methods.getToken());
					};
				}
			});
		};

		return false;
	});

	//utils
	function MsgShow(text, type){
		var types = {
			error: "false",
			success: "true"
		},
			selector = ".msg-content[default]",
			parent = $(selector).parent(),
			msg = $(selector).clone().addClass(types[type]).removeAttr("default").appendTo(parent).children(".content").html(text);
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
		//set language
		api.utils.addScript('js/lng/'+Language.get()+'.js');
		//Api server
		api.options.server = "http://node0.waspace-run.net:80/";
		//Api Log
		api.options.log.enable = true;
		api.options.log.callback.send = function(txt){
			console.log("////////////////////////SEND TO SERVER");
			console.log(txt);
			console.log("//////////////////////////////////////");
			console.log("");
		};
		api.options.log.callback.receive = function(txt){
			console.log("///////////////////RECEIVE FROM SERVER");
			console.log(txt);
			console.log("//////////////////////////////////////");
			console.log("");
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
				manager.utils.showMsg(manager.lng.exception.general[key], "error");
			};
		});

		//Translate document
		TranslatePage();
		$(document).bind("DOMNodeInserted", TranslatePage);
	});
})(jQuery);