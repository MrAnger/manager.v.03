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
			cookie: Cookie,
			dataStorage: DataStorage
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

	var forms = {
		auth: "auth",
		register: "reg",
		forgotPassword: "forgot"
	};

	//set auth form
	$("form[name='"+forms.auth+"']").live("submit", function(e){
		var inputs = {
			mail: this["email"],
			password: this["password"],
			remember: this["remember"]
		};

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

				$('.center-box').hide();
				$('.center-box form').hide();
				$('.manager').fadeIn(550).slideDown(500);
				$('.login-content').fadeIn(550).slideDown(500);
			}
		});

		return false;
	});

	//utils
	function MsgShow(text, type){
		var types = {
			error: "error"
		},
			selector = ".msg-content[default]",
			parent = $(selector).parent(),
			msg = $(selector).clone().addClass(types[type]).removeAttr("default").appendTo(parent).children(".content").html(text);
	};
	function TranslatePage(){
		$("[translate='0']").each(function(key, el){
			try{
				var lngPath = $(el).attr("name").split("-");
				var lng = $.extend(true, {}, manager.lng);
				$.each(lngPath, function(key, path){lng = lng[path];});

				if($(el).attr("traslatetype")){
					switch($(el).attr("traslatetype")){
						case "attribute":
							$(el).attr($(el).attr("translateattribute"), lng[$(el).attr("lang")]);
							break;
					};
				}else{
					$(el).html(lng[$(el).attr("lang")]);
				};

				$(el).attr("translate", "1");
			}catch(error){
				if(console && console.log){
					console.log("Error localization:");
					console.log(el);
				};
			};
		});
	};
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
		del: function(name){
			if(window.localStorage){
				delete window.localStorage[name];
			}else{
				Cookie.del(name);
			};
		}
	};
	var Language = {
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

	//init
	$(document).ready(function(e){
		//set language
		api.utils.addScript('js/'+Language.get()+'.js');
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