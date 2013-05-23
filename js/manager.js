(function($){
	var mStorage = window.WA_ManagerStorage = {};

	mStorage.api = window.WA_ManagerApi;

	mStorage.events = {
		onLogin: [],
		onClearData: [],
		onLogOut: []
	};

	mStorage.systemData = {
		date: {
			run: new Date(),
			server: null
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
		readonlyKey: ""
	};

	mStorage.folders = null;

	mStorage.ipLists = null;

	mStorage.geoZones = null;

	//METHODS SYSTEM DATA
	mStorage.getDateRun = function(){
		return mStorage.systemData.date.run;
	};
	mStorage.getDateServer = function(){
		return mStorage.systemData.date.server;
	};
	mStorage.getToken = function(){
		return mStorage.systemData.network.token;
	};
	mStorage.setToken = function(token){
		mStorage.authorized = true;
		return (mStorage.systemData.network.token = token);
	};
	mStorage.clearToken = function(){
		mStorage.authorized = false;
		mStorage.systemData.network.token = false;
	};
	mStorage.getUserId = function(){
		return mStorage.userData.id;
	};
	mStorage.getUserLogin = function(){
		return (mStorage.userData.login);
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
	mStorage.setDateServer = function(date){
		return (mStorage.systemData.date.server = date);
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
	mStorage.auth = function(_options){
		var options = $.extend(true, {
			email: "",
			password: "",
			remember: true,
			callback: function(){},
			exception: {
				NotMatch: function(){},
				SessionLimit: function(){}
			},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.auth({
			mail: options.email,
			password: options.password,
			remember: options.remember,
			callback: function(data){
				mStorage.setToken(data.token);

				if(options.remember) DataStorage.set(CONST_STORAGE.token, data.token);
				else DataStorage.remove(CONST_STORAGE.token);

				options.callback();

				mStorage.executeEvents(mStorage.events.onLogin);
			},
			exception: {
				NotMatch: options.exception.NotMatch,
				SessionLimit: options.exception.SessionLimit
			},
			ge_callback: options.onError
		});
	};
	mStorage.logOut = function(_options){
		var options = $.extend(true, {
			callback: function(){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.logOut({
			token: mStorage.getToken(),
			callback: function(data){
				mStorage.clearData();
				mStorage.clearToken();
				DataStorage.remove(CONST_STORAGE.token);

				mStorage.executeEvents(mStorage.events.onLogOut);

				options.callback();
			},
			ge_callback: options.onError
		});
	};
	mStorage.readData = function(_options){
		var options = $.extend(true, {
			callback: function(){},
			onError: function(data, gErrorName){}
		}, _options);

		mStorage.clearData();

		mStorage.api.methods.getAll({
			token: mStorage.getToken(),
			callback: function(data){
				//parse date server
				mStorage.setDateServer(data.serverDate);

				//parse system const
				$.each(data.systemConstants, function(key, val){
					switch(key){
						case "exchangeRate":
							mStorage.setConstExchangeRate(val);
							break;
						case "ipRangeFactor":
							mStorage.setConstIpRangeFactor(val);
							break;
						case "proxyFactor":
							mStorage.setConstProxyFactor(val);
							break;
						case "systemWMR":
							mStorage.setConstSystemWMR(val);
							break;
						case "taskMinCost":
							mStorage.setConstTaskMinCost(val);
							break;
						case "taskSecondCost":
							mStorage.setConstTaskSecondCost(val);
							break;
						case "transferPercent":
							mStorage.setConstTransferPercent(val);
							break;
						case "uniqueTimeFactor":
							mStorage.setConstUniqueTimeFactor(val);
							break;
					};
				});

				//parse general info
				$.each(data.generalInfo, function(key, val){
					switch(key){
						case "readonlyKey":
							mStorage.setUserReadonlyKey(val);
							break;
						case "login":
							mStorage.setUserLogin(val);
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

				//parse geo zones
				$.each(data.geoZones, function(key, geoZone){
					var geoZoneObj = new GeoZone();
					geoZoneObj.setId(geoZone.id);
					geoZoneObj.setName(geoZone.name);

					mStorage.geoZones.addGeoZone(geoZoneObj);
				});

				//parse ipLists
				$.each(data.ipLists, function(key, ipList){
					var ipListObj = new IPList();
					ipListObj.setId(ipList.id);
					ipListObj.setName(ipList.name);

					$.each(ipList.ranges, function(key, range){
						var rangeObj = new IPRange();
						rangeObj.setId(range.id);
						rangeObj.setListId(ipListObj.getId());
						rangeObj.setStart(range.start);
						rangeObj.setEnd(range.end);

						ipListObj.addRange(rangeObj);
					});

					mStorage.ipLists.addIPList(ipListObj);
				});

				//parse folders, tasks and tasks setting
				$.each(data.folders, function(key, folder){
					var folderObj = new Folder();
					folderObj.setId(folder.id);
					folderObj.setName(folder.name);

					$.each(folder.tasks, function(key, task){
						var taskObj = new Task();

						taskObj.setAfterClick(task.afterClick);
						taskObj.setAllowProxy(task.allowProxy);
						taskObj.setBeforeClick(task.beforeClick);
						taskObj.setDayTargeting(task.dayTargeting);
						taskObj.setDomain(task.domain);
						taskObj.setDays(task.days);
						taskObj.setExtSource(task.extSource);
						taskObj.setFrozen(task.frozen);
						taskObj.setGeoTargeting(task.geoTargeting);
						taskObj.setGrowth(task.growth);
						taskObj.setId(task.id);
						taskObj.setFolderId(folderObj.getId());
						taskObj.setIgnoreGU(task.ignoreGU);
						taskObj.setListId(task.listId);
						taskObj.setListMode(task.listMode);
						taskObj.setMask(task.mask);
						taskObj.setName(task.name);
						taskObj.setProfile(task.profile);
						taskObj.setRangeSize(task.rangeSize);
						taskObj.setTimeDistribution(task.timeDistribution);
						taskObj.setUniquePeriod(task.uniquePeriod);
						taskObj.setWeekTargeting(task.weekTargeting);
						//prepare day stat
						$.each(task.dayStat, function(id, data){
							var minDef = task.dayTargeting[id].min,
								maxDef = task.dayTargeting[id].max,
								growth = taskObj.getGrowth()/100,
								weekTarg = taskObj.getWeekTargeting()[getNumberDayForApi(mStorage.getDateServer())].val/100;

							data.min = Math.round((minDef+growth*taskObj.getDays())*weekTarg);
							data.max = Math.round((maxDef+growth*taskObj.getDays())*weekTarg);
						});
						taskObj.setDayStat(task.dayStat);

						folderObj.addTask(taskObj);
					});

					mStorage.folders.addFolder(folderObj);
				});

				mStorage.dataReceived = true;

				//run callback
				options.callback();
			},
			ge_callback: function(data, gErrorName){
				//run on error
				options.onError(data, gErrorName);
			}
		});
	};
	mStorage.executeEvents = function(events){
		$.each(events, function(key, handler){handler()});
	};
	mStorage.clearData = function(){
		mStorage.dataReceived = false;
		//clear system const
		$.each(CONST.system, function(key){CONST[key] = null;});
		//clear user data
		$.each(mStorage.userData, function(key){CONST[key] = null;});
		//clear folders, tasks
		mStorage.folders.clear();
		//clear ipLists
		mStorage.ipLists.clear();
		//clear geo zones
		mStorage.geoZones.clear();

		mStorage.executeEvents(mStorage.events.onClearData);
	};
	mStorage.addTaskByFolderId = function(folderId, task){
		return (mStorage.getFolderById(folderId).addTask(task));
	};
	mStorage.addIPRangesByIPListId = function(listId, ranges){
		var ipList = mStorage.getIPListById(listId);
		$.each(ranges, function(key, range){ipList.addRange(range);});
	};
	mStorage.getFolderById = function(id){
		return mStorage.folders.getFolderById(id);
	};
	mStorage.getTaskById = function(folderId, taskId){
		return mStorage.folders.getFolderById(folderId).getTaskById(taskId);
	};
	mStorage.getFolderList = function(){
		return mStorage.folders.getFolderList();
	};
	mStorage.getTaskList = function(folderId){
		return mStorage.folders.getFolderById(folderId).getTaskList();
	};
	mStorage.getIPListList = function(){
		return mStorage.ipLists.getIPListList();
	};
	mStorage.getIPListById = function(listId){
		return mStorage.ipLists.getIPListById(listId);
	}
	mStorage.setTaskParameters = function(folderId, taskId, params){
		var task = mStorage.getTaskById(folderId, taskId);

		$.each(params, function(param, val){
			switch(param){
				case "afterClick":
					task.setAfterClick(val);
					break;
				case "beforeClick":
					task.setBeforeClick(val);
					break;
				case "allowProxy":
					task.setAllowProxy(val);
					break;
				case "domain":
					task.setDomain(val);
					break;
				case "days":
					task.setDays(val);
					break;
				case "extSource":
					task.setExtSource(val);
					break;
				case "frozen":
					task.setFrozen(val);
					break;
				case "growth":
					task.setGrowth(val);
					break;
				case "ignoreGU":
					task.setIgnoreGU(val);
					break;
				case "listId":
					task.setListId(val);
					break;
				case "listMode":
					task.setListMode(val);
					break;
				case "mask":
					task.setMask(val);
					break;
				case "name":
					task.setName(val);
					break;
				case "profile":
					task.setProfile(val);
					break;
				case "rangeSize":
					task.setRangeSize(val);
					break;
				case "uniquePeriod":
					task.setUniquePeriod(val);
					break;
				case "geoTargeting":
					task.setGeoTargeting(val);
					break;
				case "timeDistribution":
					task.setTimeDistribution(val);
					break;
				case "weekTargeting":
					task.setWeekTargeting(val);
					break;
				case "dayTargeting":
					task.setDayTargeting(val);
					break;
			};
		});

		$.each(task.getDayStat(), function(id, data){
			var minDef = task.getDayTargeting()[id].min,
				maxDef = task.getDayTargeting()[id].max,
				growth = task.getGrowth()/100,
				weekTarg = task.getWeekTargeting()[getNumberDayForApi(mStorage.getDateServer())].val/100;

			data.min = Math.round((minDef+growth*task.getDays())*weekTarg);
			data.max = Math.round((maxDef+growth*task.getDays())*weekTarg);
		});

		return task;
	};
	mStorage.removeFolderById = function(id){
		return (mStorage.folders.removeFolderById(id));
	};
	mStorage.removeTaskById = function(folderId, taskId){
		return (mStorage.getFolderById(folderId).removeTaskById(taskId));
	};
	mStorage.removeIPListById = function(id){
		return (mStorage.ipLists.removeIPListById(id));
	};
	mStorage.removeIPRangeById = function(listId, rangeId){
		return mStorage.getIPListById(listId).removeRangeById(rangeId);
	};
	mStorage.getIPListList = function(){
		return mStorage.ipLists.getIPListList();
	};
	mStorage.getUsedIPList = function(){
		var out = [];

		$.each(mStorage.getFolderList(), function(key, folder){
			$.each(folder.getTaskList(), function(key, task){
				if(task.getListId() != 0) out.push(task.getListId());
			});
		});

		return out;
	};
	mStorage.getIPListById = function(id){
		return mStorage.ipLists.getIPListById(id);
	};
	mStorage.isUsedIPList = function(id){
		var folderList = mStorage.getFolderList();
		for(var i=0; i<=folderList.length-1; i++){
			var folder = folderList[i],
				taskList = folder.getTaskList();
			for(var ii=0; ii<=taskList.length-1; ii++){
				var task = taskList[ii];
				if(task.getListId() == id) return true;
			};
		};

		return false;
	};
	mStorage.getIPRangeById = function(listId, rangeId){
		return mStorage.getIPListById(listId).getRangeById(rangeId);
	};
	mStorage.getIPRangeList = function(ipListId){
		return mStorage.getIPListById(ipListId).getRangeList();
	};
	mStorage.cloneTask = function(folderId, taskId, targetFolderId, targetTaskId, newName){
		var newTask = new Task(), sourceTask = mStorage.getTaskById(folderId, taskId);

		newTask.setAfterClick(sourceTask.getAfterClick());
		newTask.setAllowProxy(sourceTask.getAllowProxy());
		newTask.setBeforeClick(sourceTask.getBeforeClick());
		newTask.setDomain(sourceTask.getDomain());
		newTask.setDays(sourceTask.getDays());
		newTask.setExtSource(sourceTask.getExtSource());
		newTask.setFrozen(true);
		newTask.setGrowth(sourceTask.getGrowth());
		newTask.setId(targetTaskId);
		newTask.setFolderId(targetFolderId);
		newTask.setIgnoreGU(sourceTask.getIgnoreGU());
		newTask.setListId(sourceTask.getListId());
		newTask.setListMode(sourceTask.getListMode());
		newTask.setMask(sourceTask.getMask());
		newTask.setName(newName);
		newTask.setProfile(sourceTask.getProfile());
		newTask.setRangeSize(sourceTask.getRangeSize());
		newTask.setUniquePeriod(sourceTask.getUniquePeriod());
		//prepare geo targeting
		var geoTargeting = [];
		$.each(sourceTask.getGeoTargeting(), function(key, data){geoTargeting[key] = $.extend(true, {}, data, {recd: 0});});
		newTask.setGeoTargeting(geoTargeting);
		//prepare day stat
		var dayStat = [];
		$.each(sourceTask.getDayStat(), function(key, data){dayStat[key] = $.extend(true, {}, data, {give: 0, overload: 0, incomplete: 0});});
		newTask.setDayStat(dayStat);
		//prepare day targeting
		var dayTargeting = [];
		$.each(sourceTask.getDayTargeting(), function(key, data){dayTargeting[key] = $.extend(true, {}, data);});
		newTask.setDayTargeting(dayTargeting);
		//prepare time distribution
		var timeDistribution = [];
		$.each(sourceTask.getTimeDistribution(), function(key, data){timeDistribution[key] = $.extend(true, {}, data);});
		newTask.setTimeDistribution(timeDistribution);
		//prepare week targeting
		var weekTargeting = [];
		$.each(sourceTask.getWeekTargeting(), function(key, data){weekTargeting[key] = $.extend(true, {}, data);});
		newTask.setWeekTargeting(weekTargeting);

		return mStorage.addTaskByFolderId(targetFolderId, newTask);
	};
	mStorage.cloneIPList = function(sourceIPListId, targetIPListId, newName){
		var sourceList = mStorage.getIPListById(sourceIPListId), targetIPList = new IPList();

		targetIPList.setId(targetIPListId);
		targetIPList.setName(newName);

		$.each(sourceList.getRangeList(), function(key, range){
			var newRange = new IPRange();
			newRange.setId(range.getId());
			newRange.setListId(targetIPList.getId());
			newRange.setStart(range.getStart());
			newRange.setEnd(range.getEnd());
			targetIPList.addRange(newRange);
		});

		return targetIPList;
	};
	mStorage.copyTaskSettings = function(folderSourceId, taskSourceId, folderTargetId, arr_taskTargetId, copyParams){
		var sourceTask = mStorage.getTaskById(folderSourceId, taskSourceId);

		$.each(arr_taskTargetId, function(key, taskId){
			var task = mStorage.getTaskById(folderTargetId, taskId);
			$.each(copyParams, function(key, param){
				switch(param){
					case API_OP_ITEM.Mask:
						task.setMask(sourceTask.getMask());
						break;
					case API_OP_ITEM.IgnoreGU:
						task.setIgnoreGU(sourceTask.getIgnoreGU());
						break;
					case API_OP_ITEM.AllowProxy:
						task.setAllowProxy(sourceTask.getAllowProxy());
						break;
					case API_OP_ITEM.UniquePeriod:
						task.setUniquePeriod(sourceTask.getUniquePeriod());
						break;
					case API_OP_ITEM.RangeSize:
						task.setRangeSize(sourceTask.getRangeSize());
						break;
					case API_OP_ITEM.BeforeClick:
						task.setBeforeClick(sourceTask.getBeforeClick());
						break;
					case API_OP_ITEM.AfterClick:
						task.setAfterClick(sourceTask.getAfterClick());
						break;
					case API_OP_ITEM.Domain:
						task.setDomain(sourceTask.getDomain());
						break;
					case API_OP_ITEM.ExtSource:
						task.setExtSource(sourceTask.getExtSource());
						break;
					case API_OP_ITEM.Frozen:
						task.setFrozen(sourceTask.getFrozen());
						break;
					case API_OP_ITEM.Growth:
						task.setGrowth(sourceTask.getGrowth());
						break;
					case API_OP_ITEM.IdList:
						task.setListId(sourceTask.getListId());
						break;
					case API_OP_ITEM.ListMode:
						task.setListMode(sourceTask.getListMode());
						break;
					case API_OP_ITEM.Days:
						task.setDays(sourceTask.getDays());
						break;
					case API_OP_ITEM.Profile:
						task.setProfile(sourceTask.getProfile());
						break;
					case API_OP_ITEM.GeoTargeting:
						var geoTargeting = [];
						$.each(sourceTask.getGeoTargeting(), function(key, targ){geoTargeting[key] = $.extend(true, {}, targ, {recd: 0});});
						task.setGeoTargeting(geoTargeting);
						break;
					case API_OP_ITEM.DayTargeting:
						var dayTargeting = [];
						$.each(sourceTask.getDayTargeting(), function(key, targ){dayTargeting[key] = $.extend(true, {}, targ);});
						task.setDayTargeting(dayTargeting);
						break;
					case API_OP_ITEM.WeekTargeting:
						var weekTargeting = [];
						$.each(sourceTask.getWeekTargeting(), function(key, targ){weekTargeting[key] = $.extend(true, {}, targ);});
						task.setWeekTargeting(weekTargeting);
						break;
					case API_OP_ITEM.TimeDistribution:
						var timeDistribution = [];
						$.each(sourceTask.getTimeDistribution(), function(key, targ){timeDistribution[key] = $.extend(true, {}, targ);});
						task.setTimeDistribution(timeDistribution);
						break;
				};
			});
		});
	};

	//METHODS FOR API SERVER
	mStorage.api_addFolder = function(_options){
		var options = $.extend(true, {
			name: "",
			exception: {
				LimitExceeded: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.addFolder({
			token: mStorage.getToken(),
			name: options.name,
			callback: function(data){
				var folderObj = new Folder();
				folderObj.setId(data.id);
				folderObj.setName(options.name);
				mStorage.folders.addFolder(folderObj);

				options.callback(folderObj);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_addTask = function(_options){
		var options = $.extend(true, {
			taskData: {},
			exception: {
				LimitExceeded: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.addTask($.extend(true,{
			token: mStorage.getToken(),
			callback: function(data){
				var taskObj = new Task(),
					taskData = $.extend(true, {}, options.taskData, data);

				taskObj.setAfterClick(taskData.afterClick);
				taskObj.setAllowProxy(taskData.allowProxy);
				taskObj.setBeforeClick(taskData.beforeClick);
				taskObj.setDays(taskData.days);
				taskObj.setDomain(taskData.domain);
				taskObj.setExtSource(taskData.extSource);
				taskObj.setFrozen(taskData.frozen);
				taskObj.setGrowth(taskData.growth);
				taskObj.setId(taskData.taskId);
				taskObj.setIgnoreGU(taskData.ignoreGU);
				taskObj.setListId(taskData.listId);
				taskObj.setListMode(taskData.listMode);
				taskObj.setMask(taskData.mask);
				taskObj.setName(taskData.name);
				taskObj.setProfile(taskData.profile);
				taskObj.setRangeSize(taskData.rangeSize);
				taskObj.setUniquePeriod(taskData.uniquePeriod);;

				mStorage.addTaskByFolderId(options.taskData.folderId, taskObj);

				options.callback(taskObj);
			},
			exception: options.exception,
			ge_callback: options.onError
		}, options.taskData));
	};
	mStorage.api_addIPList = function(_options){
		var options = $.extend(true, {
			name: "",
			exception: {
				LimitExceeded: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.addIPList({
			token: mStorage.getToken(),
			name: options.name,
			callback: function(data){
				var ipListObj = new IPList();
				ipListObj.setId(data.id);
				ipListObj.setName(options.name);
				mStorage.ipLists.addIPList(ipListObj);

				options.callback(ipListObj);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_addIPRanges = function(_options){
		var options = $.extend(true, {
			listId: 0,
			ranges: [],
			exception: {
				LimitExceeded: function(){},
				IPListNotFound: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.addIPRanges({
			token: mStorage.getToken(),
			listId: options.listId,
			ranges: options.ranges,
			callback: function(data){
				var ranges = [];
				$.each(data.ids, function(key, id){
					var range = new IPRange();
					range.setId(id);
					range.setListId(options.listId);
					range.setStart(options.ranges[key].start);
					range.setEnd(options.ranges[key].end);
					ranges.push(range);
				});
				mStorage.addIPRangesByIPListId(options.listId, ranges);
				options.callback(ranges);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_renameFolder = function(_options){
		var options = $.extend(true, {
			name: "",
			id: 0,
			exception: {},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.renameFolder({
			token: mStorage.getToken(),
			id: options.id,
			name: options.name,
			callback: function(data){
				mStorage.getFolderById(options.id).setName(options.name);

				options.callback(mStorage.getFolderById(options.id));
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_renameIPList = function(_options){
		var options = $.extend(true, {
			name: "",
			id: 0,
			exception: {},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.renameIPList({
			token: mStorage.getToken(),
			id: options.id,
			name: options.name,
			callback: function(data){
				mStorage.getIPListById(options.id).setName(options.name);

				options.callback(mStorage.getIPListById(options.id));
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_removeFolder = function(_options){
		var options = $.extend(true, {
			ids: [],
			exception: {},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		var arrFolders = [];
		$.each(options.ids, function(key, id){ arrFolders.push(mStorage.getFolderById(id));});

		API_METHOD.deleteFolders({
			token: mStorage.getToken(),
			ids: options.ids,
			callback: function(data){
				$.each(options.ids, function(key, id){mStorage.removeFolderById(id);});

				options.callback(arrFolders);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_removeTask = function(_options){
		var options = $.extend(true, {
			folderId: 0,
			ids: [],
			exception: {},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		var arrTasks = [];
		$.each(options.ids, function(key, id){ arrTasks.push(mStorage.getTaskById(options.folderId, id));});

		API_METHOD.deleteTasks({
			token: mStorage.getToken(),
			folderId: options.folderId,
			ids: options.ids,
			callback: function(data){
				$.each(options.ids, function(key, id){mStorage.removeTaskById(options.folderId, id);});

				options.callback(arrTasks);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_removeIPList = function(_options){
		var options = $.extend(true, {
			ids: [],
			exception: {},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		var arrIPLists = [];
		$.each(options.ids, function(key, id){ arrIPLists.push(mStorage.getIPListById(id));});

		API_METHOD.deleteIPLists({
			token: mStorage.getToken(),
			ids: options.ids,
			callback: function(data){
				$.each(options.ids, function(key, id){mStorage.removeIPListById(id);});

				options.callback(arrIPLists);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_removeIPRange = function(_options){
		var options = $.extend(true, {
			listId: 0,
			ids: [],
			exception: {},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		var arrIPRanges = [];
		$.each(options.ids, function(key, id){ arrIPRanges.push(mStorage.getIPRangeById(options.listId, id));});

		API_METHOD.deleteIPRanges({
			token: mStorage.getToken(),
			listId: options.listId,
			ids: options.ids,
			callback: function(data){
				$.each(options.ids, function(key, id){mStorage.removeIPRangeById(options.listId, id);});

				options.callback(arrIPRanges);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_cloneTask = function(_options){
		var options = $.extend(true, {
			folderId: 0,
			taskId: 0,
			targetFolderId: 0,
			name: "",
			exception: {
				FolderNotFound: function(){},
				TargetFolderNotFound: function(){},
				LimitExceeded: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.cloneTask({
			token: mStorage.getToken(),
			folderId: options.folderId,
			taskId: options.taskId,
			targetId: options.targetFolderId,
			name: options.name,
			callback: function(data){
				mStorage.cloneTask(options.folderId, options.taskId, options.targetFolderId, data.id, options.name);

				options.callback(mStorage.getTaskById(options.targetFolderId, data.id));
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_cloneIPList = function(_options){
		var options = $.extend(true, {
			listId: 0,
			name: "",
			exception: {
				IPListNotFound: function(){},
				LimitExceeded: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.cloneIPList({
			token: mStorage.getToken(),
			sourceList: options.listId,
			name: options.name,
			callback: function(data){
				mStorage.cloneIPList(options.listId, data.id, options.name);

				options.callback(mStorage.getIPListById(data.id));
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_setAccountPassword = function(_options){
		var options = $.extend(true, {
			password: "",
			code: "",
			step_setPassword: false,
			step_confirmSetPassword: false,
			exception: {
				InvalidCode: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		if(options.step_setPassword) API_METHOD.setAccountPassword({
			token: mStorage.getToken(),
			password: options.password,
			callback: function(data){
				options.callback();
			},
			exception: options.exception,
			ge_callback: options.onError
		});
		else if(options.step_confirmSetPassword) API_METHOD.confirmSetAccountPassword({
			token: mStorage.getToken(),
			code: options.code,
			callback: function(data){
				options.callback();
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_setTaskParameters = function(_options){
		var options = $.extend(true, {
			folderId: 0,
			taskId: 0,
			taskParameters: {},
			exception: {
				FolderNotFound: function(){},
				TaskNotFound: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.setTask($.extend(true, options.taskParameters, {
			token: mStorage.getToken(),
			folderId: options.folderId,
			taskId: options.taskId,
			callback: function(data){
				mStorage.setTaskParameters(options.folderId, options.taskId, options.taskParameters);
				options.callback(mStorage.getTaskById(options.folderId, options.taskId));
			},
			exception: options.exception,
			ge_callback: options.onError
		}));
	};
	mStorage.api_setIPRanges = function(_options){
		var options = $.extend(true, {
			listId: 0,
			ranges: [],
			exception: {
				IPListNotFound: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.setIPRanges({
			token: mStorage.getToken(),
			listId: options.listId,
			ranges: options.ranges,
			callback: function(data){
				var ranges = [];
				$.each(options.ranges, function(key, range){
					var rangeObj = mStorage.getIPRangeById(range.listId, range.rangeId);
					rangeObj.setStart(range.start);
					rangeObj.setStart(range.end);
					ranges.push(rangeObj);
				});
				options.callback(ranges);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_moveTask = function(_options){
		var options = $.extend(true, {
			folderId: 0,
			targetId: 0,
			ids: [],
			exception: {
				FolderNotFound: function(){},
				TargetFolderNotFound: function(){},
				LimitExceeded: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		var arrTasks = [];
		$.each(options.ids, function(key, id){ arrTasks.push(mStorage.getTaskById(options.folderId, id));});

		API_METHOD.moveTasks({
			token: mStorage.getToken(),
			folderId: options.folderId,
			targetId: options.targetId,
			ids: options.ids,
			callback: function(data){
				//remove tasks from source folder
				$.each(options.ids, function(key, id){mStorage.removeTaskById(options.folderId, id);});
				//add task to target folder
				$.each(arrTasks, function(key, task){
					task.setFolderId(options.targetId);
					task.setId(data.ids[key]);
					mStorage.getFolderById(options.targetId).addTask(task);
				});

				options.callback(arrTasks);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_resetReadonlyKey = function(_options){
		var options = $.extend(true, {
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.resetReadonlyKey({
			token: mStorage.getToken(),
			callback: function(data){
				mStorage.setUserReadonlyKey(data.readonlyKey);

				options.callback(mStorage.getUserReadonlyKey());
			},
			ge_callback: options.onError
		});
	};
	mStorage.api_sendCredits = function(_options){
		var options = $.extend(true, {
			recipient: "",
			amount: 0,
			code: "",
			step_sendCredits: false,
			step_confirmSendCredits: false,
			exception: {
				LowBalance: function(){},
				InvalidRecipient: function(){},
				InvalidCode: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		if(options.step_sendCredits) API_METHOD.sendCredits({
			token: mStorage.getToken(),
			recipient: options.recipient,
			amount: options.amount,
			callback: function(data){
				options.callback();
			},
			exception: options.exception,
			ge_callback: options.onError
		});
		else if(options.step_confirmSendCredits) API_METHOD.confirmSendCredits({
			token: mStorage.getToken(),
			code: options.code,
			callback: function(data){
				mStorage.setUserBalance(data.balance);

				options.callback({
					operationId: data.operationId,
					balance: mStorage.getUserBalance(),
					amount: data.tranferAmount
				});
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_copyTaskSettings = function(_options){
		var options = $.extend(true, {
			sourceFolder: 0,
			sourceTask: 0,
			targetFolder: 0,
			targetTasks: [],
			settings: [],
			exception: {
				FolderNotFound: function(){},
				TargetFolderNotFound: function(){},
				TaskNotFound: function(){}
			},
			callback: function(data){},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.taskCopySettings({
			token: mStorage.getToken(),
			folderSourceId: options.sourceFolder,
			taskSourceId: options.sourceTask,
			folderTargetId: options.targetFolder,
			ids: options.targetTasks,
			settings: options.settings,
			callback: function(data){
				var out = [];

				mStorage.copyTaskSettings(options.sourceFolder, options.sourceTask, options.targetFolder, options.targetTasks, options.settings);
				$.each(options.targetTasks, function(key, taskId){out.push(mStorage.getTaskById(options.targetFolder, taskId));});

				options.callback(out);
			},
			exception: options.exception,
			ge_callback: options.onError
		});
	};
	mStorage.api_updateTaskStat = function(_options){
		var options = $.extend(true, {
			folderId: 0,
			taskId: 0,
			silent: false,
			callback: function(data){},
			exception: {},
			onError: function(data, gErrorName){}
		}, _options);

		API_METHOD.getDayStat({
			token: mStorage.getToken(),
			folderId: options.folderId,
			taskId: options.taskId,
			callback: function(stat){
				var task = mStorage.getTaskById(options.folderId, options.taskId);
				task.setDayStat(stat);
				options.callback(task.getDayStat());
			},
			ge_callback: options.onError
		}, options.silent);
	};

	mStorage.run = function(_options){
		var options = $.extend(true, {
			onErrorInLogin: function(data, gErrorName){},
			onNeedAuth: function(){},
			checkDataStorage: true
		}, _options);
		//create folder container
		mStorage.folders = new FolderContainer();
		//create ipList container
		mStorage.ipLists = new IPListContainer();
		//create geoZone container
		mStorage.geoZones = new GeoZoneContainer();
		//check auth token and read data from server
		if(options.checkDataStorage){
			if(DataStorage.get(CONST_STORAGE.token)){
				mStorage.setToken(DataStorage.get(CONST_STORAGE.token));
				mStorage.readData({
					callback: function(){
						mStorage.executeEvents(mStorage.events.onLogin);
					},
					onError: options.onErrorInLogin
				});
			}else options.onNeedAuth();
		}else{
			mStorage.readData({
				callback: function(){
					mStorage.executeEvents(mStorage.events.onLogin);
				},
				onError: options.onErrorInLogin
			});
		};
	};

	//PROPERTIES
	mStorage.authorized = false;
	mStorage.activated = true;
	mStorage.dataReceived = false;

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
				DataStorage.remove(CONST_STORAGE.token);
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
				mStorage.clearToken();
				DataStorage.remove(CONST_STORAGE.token);
				mStorage.clearData();

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
	function getCountItemsInObject(obj){
		var count = 0;

		$.each(obj, function(){count++;});

		return count;
	};
	function getNumberDayForApi(date){
		switch(date.getDay()){
			case 0:
				return 6;
				break;
			case 1:
				return 0;
				break;
			case 2:
				return 1;
				break;
			case 3:
				return 2;
				break;
			case 4:
				return 3;
				break;
			case 5:
				return 4;
				break;
			case 6:
				return 5;
				break;
		};
	};

	//SHORT LINKS
	var CONST = mStorage.const,
		CONST_STORAGE = CONST.dataStorage,
		API_METHOD = mStorage.api.methods,
		API_OP_ITEM = mStorage.api.Constants.OperationItem;

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
		this.getTaskById = function(taskId){
			return data.tasks[taskId];
		};
		this.getTaskList = function(){
			var out = [];

			$.each(data.tasks, function(key, task){
				out.push(task);
			});

			return out;
		};
		this.getTaskCount = function(){
			return getCountItemsInObject(data.tasks);
		};
		this.setId = function(id){
			return (data.id = id);
		};
		this.setName = function(name){
			return (data.name = name);
		};
		this.addTask = function(task){
			return (data.tasks[task.getId()] = task);
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
		this.isEnabled = function(){
			return !data.frozen;
		};
		this.isDisabled = function(){
			return data.frozen;
		};
		this.setEnabled = function(state){
			return (data.frozen = !state);
		};
		this.setDisabled = function(state){
			return (data.frozen = state);
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
		this.getRangeById = function(rangeId){
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
	function GeoZone(){
		var SelfObj = this,
			data = {
				id: 0,
				name: ""
			};

		this.getId = function(){
			return data.id;
		};
		this.getName = function(){
			return data.name;
		};
		this.setId = function(id){
			return (data.id = id);
		};
		this.setName = function(name){
			return (data.name = name);
		};
	};
	function GeoZoneContainer(){
		var SelfObj = this,
			data = {};

		this.getGeoZoneById = function(id){
			return data[id];
		};
		this.getGeoZoneList = function(){
			var out = [];

			$.each(data, function(key, geoZone){
				out.push(geoZone);
			});

			return out;
		};
		this.addGeoZone = function(geoZone){
			return (data[geoZone.getId()] = geoZone);
		};
		this.removeGeoZoneById = function(id){
			return (delete data[id]);
		};
		this.removeGeoZone = function(geoZone){
			return (delete data[geoZone.getId()]);
		};
		this.clear = function(){
			data = {};
		};
	};
})(jQuery);