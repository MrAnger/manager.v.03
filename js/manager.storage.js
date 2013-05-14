(function($){
	var mStorage = window.WA_ManagerStorage = {};

	mStorage.api = window.WA_ManagerApi;

	mStorage.events = {
		onDomReady: [],
		onLoad: [],
		onUpdateSystemConst: [],
		onLogin: [],
		onClearData: []
	};

	mStorage.systemData = {
		date: {
			run: new Date()
		},
		network: {
			token: false,
			server: "http://node0.waspace-run.net:80/"
		}
	};

	mStorage.apiUserException = {
		NoResponse : function(data){},
		UnDefined : function(data){},
		WrongDataFormat : function(data){},
		AntiDosBlock : function(data){},
		WrongSessionId : function(data){},
		NotActivated : function(data){},
		MailSystemError : function(data){},
		Blocked: function(data){},
		AccessDenied: function(data){}
	};

	mStorage.const = {
		dataStorage: {
			token: "WA_MS_TOKEN"
		},
		system: {
			taskMinCost: 0,
			transferPercent: 0,
			proxyFactor: 0,
			taskSecondCost: 0,
			exchangeRate: 0,
			systemWMR: "",
			uniqueTimeFactor: 0,
			ipRangeFactor: 0
		}
	};

	mStorage.userData = {
		id: 0,
		login: "",
		balance: 0,
		email: "",
		readonlyKey: "",
		deleted: false
	};

	mStorage.folders = null;

	mStorage.ipLists = null;

	//METHODS SYSTEM DATA
	mStorage.getDateRun = function(){
		return mStorage.systemData.date.run;
	};
	mStorage.getToken = function(){
		return mStorage.systemData.network.token;
	};
	mStorage.setToken = function(token){
		return (mStorage.systemData.network.token = token);
	};
	mStorage.clearToken = function(){
		mStorage.systemData.network.token = false;
	};
	mStorage.getUserId = function(){
		return mStorage.userData.id;
	};
	mStorage.getUserLogin = function(){
		return mStorage.userData.login;
	};
	mStorage.getUserBalance = function(){
		return mStorage.userData.balance;
	};
	mStorage.getUserEmail = function(){
		return mStorage.userData.email;
	};
	mStorage.getUserReadonlyKey = function(){
		return mStorage.userData.readonlyKey;
	};
	mStorage.isUserDeleted = function(){
		return mStorage.userData.deleted;
	};
	mStorage.setUserId = function(id){
		return (mStorage.userData.id =id);
	};
	mStorage.setUserLogin = function(login){
		return (mStorage.userData.login = login);
	};
	mStorage.setUserBalance = function(balance){
		return (mStorage.userData.balance = balance);
	};
	mStorage.setUserEmail = function(email){
		return (mStorage.userData.email = email);
	};
	mStorage.setUserReadonlyKey = function(key){
		return (mStorage.userData.readonlyKey = key);
	};
	mStorage.setUserDeleted = function(deleted){
		return (mStorage.userData.deleted = deleted);
	};

	//METHODS SYSTEM CONST
	mStorage.getConstTaskMinCost = function(){
		return mStorage.const.system.taskMinCost;
	};
	mStorage.getConstTransferPercent = function(){
		return mStorage.const.system.transferPercent;
	};
	mStorage.getConstProxyFactor = function(){
		return mStorage.const.system.proxyFactor;
	};
	mStorage.getConstTaskSecondCost = function(){
		return mStorage.const.system.taskSecondCost;
	};
	mStorage.getConstExchangeRate = function(){
		return mStorage.const.system.exchangeRate;
	};
	mStorage.getConstSystemWMR = function(){
		return mStorage.const.system.systemWMR;
	};
	mStorage.getConstUniqueTimeFactor = function(){
		return mStorage.const.system.uniqueTimeFactor;
	};
	mStorage.getConstIpRangeFactor = function(){
		return mStorage.const.system.ipRangeFactor;
	};
	mStorage.setConstTaskMinCost = function(_const){
		return (mStorage.const.system.taskMinCost = _const);
	};
	mStorage.setConstTransferPercent = function(_const){
		return (mStorage.const.system.transferPercent = _const);
	};
	mStorage.setConstProxyFactor = function(_const){
		return (mStorage.const.system.proxyFactor = _const);
	};
	mStorage.setConstTaskSecondCost = function(_const){
		return (mStorage.const.system.taskSecondCost = _const);
	};
	mStorage.setConstExchangeRate = function(_const){
		return (mStorage.const.system.exchangeRate = _const);
	};
	mStorage.setConstSystemWMR = function(_const){
		return (mStorage.const.system.systemWMR = _const);
	};
	mStorage.setConstUniqueTimeFactor = function(_const){
		return (mStorage.const.system.uniqueTimeFactor = _const);
	};
	mStorage.setConstIpRangeFactor = function(_const){
		return (mStorage.const.system.ipRangeFactor = _const);
	};

	//METHODS
	mStorage.updateSystemConst = function(onError){
		API_METHOD.getSystemConstants({
			token: mStorage.getToken(),
			callback: function(data){
				$.each(data, function(key, val){
					switch(key){
						case "taskMinCost":
							mStorage.setConstTaskMinCost(val);
							break;
						case "transferPercent":
							mStorage.setConstTransferPercent(val);
							break;
						case "proxyFactor":
							mStorage.setConstProxyFactor(val);
							break;
						case "taskSecondCost":
							mStorage.setConstTaskSecondCost(val);
							break;
						case "exchangeRate":
							mStorage.setConstExchangeRate(val);
							break;
						case "systemWMR":
							mStorage.setConstSystemWMR(val);
							break;
						case "uniqueTimeFactor":
							mStorage.setConstUniqueTimeFactor(val);
							break;
						case "ipRangeFactor":
							mStorage.setConstIpRangeFactor(val);
							break;
					};
				});
				mStorage.executeEvents(mStorage.events.onUpdateSystemConst);
			},
			ge_callback: onError
		});
	};
	mStorage.executeEvents = function(events){
		$.each(events, function(key, handler){handler()});
	};
	mStorage.clearData = function(){
		//clear system const
		$.each(CONST.system, function(key){CONST[key] = null;});
		//clear user data
		$.each(mStorage.userData, function(key){CONST[key] = null;});
		//clear folders, tasks
		mStorage.folders.clear();
		//clear ipLists
		mStorage.ipLists.clear();

		mStorage.executeEvents(mStorage.events.onClearData);
	};

	mStorage.run = function(){
		//create folder container
		mStorage.folders = new FolderContainer();
		//create ipList container
		mStorage.ipLists = new IPListContainer();
		//clear data
		mStorage.clearData();
		//RUNNING EVENTS
		mStorage.executeEvents(mStorage.events.onLoad);
		$(document).ready(function(e){
			mStorage.executeEvents(mStorage.events.onDomReady);
		});
	};

	//PROPERTIES
	mStorage.authorized = false;
	mStorage.activated = true;

	//SET SYSTEM EVENT HANDLERS
	mStorage.events.onDomReady.push(function(){
		if(DataStorage.get(CONST_STORAGE.token)){
			var token = DataStorage.get(CONST_STORAGE.token);

			API_METHOD.getGeneralInfo({
				token: token,
				callback: function(data){
					mStorage.setToken(token);
					mStorage.authorized = true;

					$.each(data, function(key, val){
						switch(key){
							case "readonlyKey":
								mStorage.setUserReadonlyKey(val);
								break;
							case "login":
								mStorage.setUserLogin(val);
								break;
							case "deleted":
								mStorage.setUserDeleted(val);
								break;
							case "balance":
								mStorage.setUserBalance(val);
								break;
							case "id":
								mStorage.setUserId(val);
								break;
							case "email":
								mStorage.setUserEmail(val);
								break;
						};
					});

					mStorage.executeEvents(mStorage.events.onLogin);
				}
			});
		};
	});
	mStorage.events.onLogin.push(function(){
		//update system const
		mStorage.updateSystemConst();
	});

	//SET MANAGER API
	$.extend(mStorage.api.options, {
		server: mStorage.systemData.network.server,
		exception : {
			NoResponse : function(data){
				//WA_MS code..

				mStorage.apiUserException.NoResponse(data);
			},
			UnDefined : function(data){
				//WA_MS code..

				mStorage.apiUserException.UnDefined(data);
			},
			WrongDataFormat : function(data){
				//WA_MS code..

				mStorage.apiUserException.WrongDataFormat(data);
			},
			AntiDosBlock : function(data){
				//WA_MS code..

				mStorage.apiUserException.AntiDosBlock(data);
			},
			WrongSessionId : function(data){
				//WA_MS code..
				mStorage.clearToken();
				mStorage.authorized = false;
				mStorage.clearData();

				mStorage.apiUserException.WrongSessionId(data);
			},
			NotActivated : function(data){
				//WA_MS code..

				mStorage.apiUserException.NotActivated(data);
			},
			MailSystemError : function(data){
				//WA_MS code..

				mStorage.apiUserException.MailSystemError(data);
			},
			Blocked: function(data){
				//WA_MS code..

				mStorage.apiUserException.Blocked(data);
			},
			AccessDenied: function(data){
				//WA_MS code..

				mStorage.apiUserException.AccessDenied(data);
			}
		}
	});

	//UTILS
	function Interval(action, time){
		var stop = false;

		function interval(){
			action();
			if(!stop) setTimeout(arguments.callee, time);
		};

		this.start = function(){
			stop = false;
			interval();
		};
		this.stop = function(){
			stop = true;
		};
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
	function inObject(obj, value){
		var exit = false,
			output = null;

		$.each(obj, function(key, val){
			if(!exit){
				if(val == value){
					output = key;
					exit = true;
				};
			};
		});

		return output;
	};

	//SHORT LINKS
	var CONST = mStorage.const,
		CONST_STORAGE = CONST.dataStorage,
		API_METHOD = mStorage.api.methods;

	//OBJECTS
	function FolderContainer(){
		var SelfObj = this,
			data = {};

		this.getFolderById = function(id){
			return data[id];
		};
		this.getFolderList = function(){
			var out = [];

			$.each(data, function(key, folder){
				out.push(folder);
			});

			return out;
		};
		this.addFolder = function(folder){
			return (data[folder.getId()] = folder);
		};
		this.removeFolderById = function(id){
			return (delete data[id]);
		};
		this.removeFolder = function(folder){
			return (delete data[folder.getId()]);
		};
		this.clear = function(){
			data = {};
		};
	};
	function Folder(){
		var SelfObj = this,
			data = {
				id: 0,
				name: "",
				countTask: 0,
				tasks: {}
			};

		this.getId = function(){
			return data.id;
		};
		this.getName = function(){
			return data.name;
		};
		this.getCountTask = function(){
			return data.countTask;
		};
		this.getTask = function(taskId){
			return data.ranges[taskId];
		};
		this.getTaskList = function(){
			var out = [];

			$.each(data.ranges, function(key, task){
				out.push(task);
			});

			return out;
		};
		this.setId = function(id){
			return (data.id = id);
		};
		this.setName = function(name){
			return (data.name = name);
		};
		this.setCountTask = function(countTask){
			return (data.countTask = countTask);
		};
		this.addTask = function(task){
			return (data.ranges[task.getId()] = task);
		};
		this.removeTaskById = function(id){
			return (delete data.tasks[id]);
		};
		this.removeTask = function(task){
			return (delete data.tasks[task.getId()]);
		};
	};
	function Task(){
		var SelfObj = this,
			data = {
				folderId: 0,
				taskId: 0,
				name: "",
				listId: 0,
				afterClick: 0,
				beforeClick: 0,
				allowProxy: false,
				ignoreGU: false,
				growth: 0,
				domain: "",
				profile: "",
				frozen: false,
				listMode: true,
				rangeSize: 0,
				uniquePeriod: 0,
				mask: "",
				days: 0,
				extSource: "",
				dayTargeting: [],
				weekTargeting: [],
				timeDistribution: [],
				geoTargeting: [],
				dayStat: []
			};

		this.getId = function(){
			return data.taskId;
		};
		this.getFolderId = function(){
			return data.folderId;
		};
		this.getName = function(){
			return data.name;
		};
		this.getListId = function(){
			return data.listId;
		};
		this.getAfterClick = function(){
			return data.afterClick;
		};
		this.getBeforeClick = function(){
			return data.beforeClick;
		};
		this.getAllowProxy = function(){
			return data.allowProxy;
		};
		this.getIgnoreGU = function(){
			return data.ignoreGU;
		};
		this.getGrowth = function(){
			return data.growth;
		};
		this.getDomain = function(){
			return data.domain;
		};
		this.getProfile = function(){
			return data.profile;
		};
		this.getFrozen = function(){
			return data.frozen;
		};
		this.getListMode = function(){
			return data.ListMode;
		};
		this.getRangeSize = function(){
			return data.rangeSize;
		};
		this.getUniquePeriod = function(){
			return data.uniquePeriod;
		};
		this.getMask = function(){
			return data.mask;
		};
		this.getDays = function(){
			return data.days;
		};
		this.getExtSource = function(){
			return data.extSource;
		};
		this.getDayTargeting = function(){
			return data.dayTargeting;
		};
		this.getWeekTargeting = function(){
			return data.weekTargeting;
		};
		this.getTimeDistribution = function(){
			return data.timeDistribution;
		};
		this.getGeoTargeting = function(){
			return data.geoTargeting;
		};
		this.getDayStat = function(){
			return data.dayStat;
		};
		this.setId = function(id){
			return (data.taskId = id);
		};
		this.setFolderId = function(folderId){
			return (data.folderId = folderId);
		};
		this.setName = function(name){
			return (data.name = name);
		};
		this.setListId = function(listId){
			return (data.listId = listId);
		};
		this.setAfterClick = function(afterClick){
			return (data.afterClick = afterClick);
		};
		this.setBeforeClick = function(beforeClick){
			return (data.beforeClick = beforeClick);
		};
		this.setAllowProxy = function(allowProxy){
			return (data.allowProxy = allowProxy);
		};
		this.setIgnoreGU = function(ignoreGU){
			return (data.ignoreGU = ignoreGU);
		};
		this.setGrowth = function(growth){
			return (data.growth = growth);
		};
		this.setDomain = function(domain){
			return (data.domain = domain);
		};
		this.setProfile = function(profile){
			return (data.profile = profile);
		};
		this.setFrozen = function(frozen){
			return (data.frozen = frozen);
		};
		this.setListMode = function(listMode){
			return (data.ListMode = listMode);
		};
		this.setRangeSize = function(rangeSize){
			return (data.rangeSize = rangeSize);
		};
		this.setUniquePeriod = function(uniquePeriod){
			return (data.uniquePeriod = uniquePeriod);
		};
		this.setMask = function(mask){
			return (data.mask = mask);
		};
		this.setDays = function(days){
			return (data.days = days);
		};
		this.setExtSource = function(extSource){
			return (data.extSource = extSource);
		};
		this.setDayTargeting = function(dayTargeting){
			return (data.dayTargeting = dayTargeting);
		};
		this.setWeekTargeting = function(weekTargeting){
			return (data.weekTargeting = weekTargeting);
		};
		this.setTimeDistribution = function(timeDistribution){
			return (data.timeDistribution = timeDistribution);
		};
		this.setGeoTargeting = function(geoTargeting){
			return (data.geoTargeting = geoTargeting);
		};
		this.setDayStat = function(dayStat){
			return (data.dayStat = dayStat);
		};
	};
	function IPRange(){
		var SelfObj = this,
			data = {
				id: 0,
				listId: 0,
				start: "",
				end: ""
			};

		this.getId = function(){
			return data.id;
		};
		this.getListId = function(){
			return data.listId;
		};
		this.getStart = function(){
			return data.start;
		};
		this.getEnd = function(){
			return data.end;
		};
		this.setId = function(id){
			return (data.id = id);
		};
		this.setListId = function(listId){
			return (data.listId = listId);
		};
		this.setStart = function(start){
			return (data.start = start);
		};
		this.setEnd = function(end){
			return (data.end = end);
		};
	};
	function IPList(){
		var SelfObj = this,
			data = {
				id: 0,
				name: "",
				ranges: {}
			};

		this.getId = function(){
			return data.id;
		};
		this.getName = function(){
			return data.name;
		};
		this.getRange = function(rangeId){
			return data.ranges[rangeId];
		};
		this.getRangeList = function(){
			var out = [];

			$.each(data.ranges, function(key, range){
				out.push(range);
			});

			return out;
		};
		this.setId = function(id){
			return (data.id = id);
		};
		this.setName = function(name){
			return (data.name = name);
		};
		this.addRange = function(range){
			return (data.ranges[range.getId()] = range);
		};
		this.removeRangeById = function(id){
			return (delete data.ranges[id]);
		};
		this.removeRange = function(range){
			return (delete data.ranges[range.getId()]);
		};
	};
	function IPListContainer(){
		var SelfObj = this,
			data = {};

		this.getIPListById = function(id){
			return data[id];
		};
		this.getIPListList = function(){
			var out = [];

			$.each(data, function(key, iplist){
				out.push(iplist);
			});

			return out;
		};
		this.addIPList = function(iplist){
			return (data[iplist.getId()] = iplist);
		};
		this.removeIPListById = function(id){
			return (delete data[id]);
		};
		this.removeIPList = function(iplist){
			return (delete data[iplist.getId()]);
		};
		this.clear = function(){
			data = {};
		};
	};
})(jQuery);