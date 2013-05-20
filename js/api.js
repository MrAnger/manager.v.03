(function($){
	var api = window.WA_ManagerApi =  {
		options: {
			server: "",
			timeout: 30000,
			log: {
				enable: false,
				callback: {
					send: function(str){},
					receive: function(str){}
				}
			},
			loader: {
				enable: false,
				show: function(){},
				hide: function(){}
			},
			exception : {
				NoResponse : function(data){},
				UnDefined : function(data){},
				WrongDataFormat : function(data){},
				AntiDosBlock : function(data){},
				WrongSessionId : function(data){},
				NotActivated : function(data){},
				MailSystemError : function(data){},
				Blocked: function(data){},
				AccessDenied: function(data){}
			}
		},
		methods: {
			getFolders: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.Folders);
				req.setToken(data.token);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.Folders]) $.each(_data[OperationItem.Folders], function(key, folder){
						output.push({
							id: folder[OperationItem.IdFolder],
							name: folder[OperationItem.Name],
							task_count: folder[OperationItem.Tasks]
						});
					});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getTasks: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.Tasks);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.Tasks]) $.each(_data[OperationItem.Tasks], function(key, task){
						output.push({
							folderId: data.folderId,
							taskId: task[OperationItem.IdTask],
							name: task[OperationItem.Name],
							listId: task[OperationItem.IdList],
							afterClick: task[OperationItem.AfterClick],
							beforeClick: task[OperationItem.BeforeClick],
							allowProxy: task[OperationItem.AllowProxy],
							ignoreGU: task[OperationItem.IgnoreGU],
							growth: task[OperationItem.Growth],
							domain: task[OperationItem.Domain],
							profile: task[OperationItem.Profile],
							frozen: task[OperationItem.Frozen],
							listMode: task[OperationItem.ListMode],
							rangeSize: task[OperationItem.RangeSize],
							uniquePeriod: task[OperationItem.UniquePeriod],
							mask: task[OperationItem.Mask],
							days: task[OperationItem.Days],
							extSource: task[OperationItem.ExtSource]
						});
					});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getDayTargeting: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.DayTargeting);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTask, data.taskId);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.DayTargeting]) $.each(_data[OperationItem.DayTargeting], function(key, targ){
						output.push({
							id: targ[OperationItem.Hour],
							min: targ[OperationItem.Min],
							max: targ[OperationItem.Max]
						});
					});

					var i = 0;
					while(i<=23){
						if(!output[i] || output[i].id != i) output.splice(i, 0, {id: i, min: 0, max: 0});
						else i++;
					};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getWeekTargeting: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.WeekTargeting);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTask, data.taskId);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.WeekTargeting]) $.each(_data[OperationItem.WeekTargeting], function(key, targ){
						output.push({
							id: targ[OperationItem.Day],
							val: targ[OperationItem.Target]
						});
					});

					var i = 0;
					while(i<=6){
						if(!output[i] || output[i].id != i) output.splice(i, 0, {id: i, val: 100});
						else i++;
					};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getDayStat: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.DayStats);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTask, data.taskId);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.DayTargeting]) $.each(_data[OperationItem.DayTargeting], function(key, targ){
						output.push({
							id: targ[OperationItem.Hour],
							min: targ[OperationItem.Min],
							max: targ[OperationItem.Max],
							give: targ[OperationItem.Recd],
							incomplete: targ[OperationItem.Incomplete],
							overload: targ[OperationItem.Overload]
						});
					});

					var i = 0;
					while(i<=23){
						if(!output[i] || output[i].id != i) output.splice(i, 0, {id: i, min: 0, max: 0, give: 0, incomplete: 0, overload: 0});
						else i++;
					};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getTimeDistribution: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.TimeDistribution);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTask, data.taskId);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.TimeDistribution]) $.each(_data[OperationItem.TimeDistribution], function(key, targ){
						output.push({
							id: targ[OperationItem.Percent],
							val: targ[OperationItem.Priority]
						});
					});

					var i = 1;
					while(i<=100){
						if(!output[i-1] || output[i-1].id != i) output.splice(i-1, 0, {id: i, val: 0});
						else i++;
					};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getGeoTargeting: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.GeoTargeting);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTask, data.taskId);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.GeoTargeting]) $.each(_data[OperationItem.GeoTargeting], function(key, targ){
						output.push({
							id: targ[OperationItem.IdZone],
							target: targ[OperationItem.Target],
							recd: targ[OperationItem.Recd],
							shortName: targ[OperationItem.Name]
						});
					});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getGeneralInfo: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.GeneralInfo);
				req.setToken(data.token);

				req.send(function(_data){
					var output = {};

					$.each(_data, function(key, val){
						switch(key){
							case OperationItem.ReadonlyKey:
								output.readonlyKey = val;
								break;
							case OperationItem.Login:
								output.login = val;
								break;
							case OperationItem.Deleted:
								output.deleted = val;
								break;
							case OperationItem.Balance:
								output.balance = val;
								break;
							case OperationItem.Id:
								output.id = val;
								break;
							case OperationItem.Mail:
								output.email = val;
								break;
						};
					});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getAll: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.All);
				req.setToken(data.token);

				req.send(function(_data){
					var output = {
						systemConstants: {},
						generalInfo: {},
						folders: [],
						ipLists: [],
						geoZones: []
					};
					//get server date
					if(_data[OperationItem.Timestamp]){
						output.serverDate = new Date(_data[OperationItem.Timestamp] * 1000);
						output.serverDate.setHours(output.serverDate.getTimezoneOffset()/60)
					};

					//parse system constants
					if(_data[OperationItem.SystemConstants]) paramTransfer(output.systemConstants, _data[OperationItem.SystemConstants], [
						[OperationItem.TaskMinCost, "taskMinCost"],
						[OperationItem.TransferPercent, "transferPercent"],
						[OperationItem.ProxyFactor, "proxyFactor"],
						[OperationItem.TaskSecondCost, "taskSecondCost"],
						[OperationItem.ExchangeRate, "exchangeRate"],
						[OperationItem.SystemWMR, "systemWMR"],
						[OperationItem.UniqueTimeFactor, "uniqueTimeFactor"],
						[OperationItem.IPRangeFactor, "ipRangeFactor"]
					]);

					//parse general info
					if(_data[OperationItem.GeneralInfo]) paramTransfer(output.generalInfo, _data[OperationItem.GeneralInfo], [
						[OperationItem.ReadonlyKey, "readonlyKey"],
						[OperationItem.Login, "login"],
						[OperationItem.Deleted, "deleted"],
						[OperationItem.Balance, "balance"],
						[OperationItem.Id, "id"],
						[OperationItem.Mail, "email"]
					]);

					//parse folders, tasks and tasks setting
					if(_data[OperationItem.Folders])$.each(_data[OperationItem.Folders], function(key, folder){
						//parse folder
						var folderObj = paramTransfer({tasks: []}, folder, [
							[OperationItem.IdFolder, "id"],
							[OperationItem.Name, "name"]
						]);

						if(folder[OperationItem.Tasks]) $.each(folder[OperationItem.Tasks], function(key, task){
							//parse task
							var taskObj = paramTransfer({
								dayTargeting: [],
								weekTargeting: [],
								geoTargeting: [],
								timeDistribution: [],
								dayStat: []
							}, task, [
								[OperationItem.IdTask, "id"],
								[OperationItem.Name, "name"],
								[OperationItem.IdList, "listId"],
								[OperationItem.AfterClick, "afterClick"],
								[OperationItem.BeforeClick, "beforeClick"],
								[OperationItem.AllowProxy, "allowProxy"],
								[OperationItem.IgnoreGU, "ignoreGU"],
								[OperationItem.Growth, "growth"],
								[OperationItem.Domain, "domain"],
								[OperationItem.Profile, "profile"],
								[OperationItem.Frozen, "frozen"],
								[OperationItem.ListMode, "listMode"],
								[OperationItem.RangeSize, "rangeSize"],
								[OperationItem.UniquePeriod, "uniquePeriod"],
								[OperationItem.Mask, "mask"],
								[OperationItem.Days, "days"],
								[OperationItem.ExtSource, "extSource"]
							]);

							//parse geo Targeting
							if(task[OperationItem.GeoTargeting]) $.each(task[OperationItem.GeoTargeting], function(key, targ){
								taskObj.geoTargeting.push(paramTransfer({},targ, [
									[OperationItem.IdZone, "id"],
									[OperationItem.Target, "target"],
									[OperationItem.Recd, "recd"]
								]));
							});
							taskObj.geoTargeting.sort(function(a,b){return a.id- b.id;});

							//parse day Targeting
							if(task[OperationItem.DayTargeting]){
								$.each(task[OperationItem.DayTargeting], function(key, targ){
									taskObj.dayTargeting.push(paramTransfer({},targ, [
										[OperationItem.Hour, "id"],
										[OperationItem.Min, "min"],
										[OperationItem.Max, "max"]
									]));
								});

								var i = 0;
								while(i<=23){
									if(!taskObj.dayTargeting[i] || taskObj.dayTargeting[i].id != i) taskObj.dayTargeting.splice(i, 0, {id: i, min: 0, max: 0});
									else i++;
								};

								taskObj.dayTargeting.sort(function(a,b){return a.id- b.id;});
							};

							//parse week Targeting
							if(task[OperationItem.WeekTargeting]){
								$.each(task[OperationItem.WeekTargeting], function(key, targ){
									taskObj.weekTargeting.push(paramTransfer({},targ, [
										[OperationItem.Day, "id"],
										[OperationItem.Target, "val"]
									]));
								});

								var i = 0;
								while(i<=6){
									if(!taskObj.weekTargeting[i] || taskObj.weekTargeting[i].id != i) taskObj.weekTargeting.splice(i, 0, {id: i, val: 100});
									else i++;
								};

								taskObj.weekTargeting.sort(function(a,b){return a.id- b.id;});
							};

							//parse time Distribution
							if(task[OperationItem.TimeDistribution]){
								$.each(task[OperationItem.TimeDistribution], function(key, targ){
									taskObj.timeDistribution.push(paramTransfer({},targ, [
										[OperationItem.Percent, "id"],
										[OperationItem.Priority, "val"]
									]));
								});

								var i = 1;
								while(i<=100){
									if(!taskObj.timeDistribution[i-1] || taskObj.timeDistribution[i-1].id != i) taskObj.timeDistribution.splice(i-1, 0, {id: i, val: 0});
									else i++;
								};

								taskObj.timeDistribution.sort(function(a,b){return a.id- b.id;});
							};

							//parse day stat
							if(task[OperationItem.DayStatistic]){
								$.each(task[OperationItem.DayStatistic], function(key, targ){
									taskObj.dayStat.push(paramTransfer({},targ, [
										[OperationItem.Hour, "id"],
										[OperationItem.Recd, "give"],
										[OperationItem.Incomplete, "incomplete"],
										[OperationItem.Overload, "overload"]
									]));
								});

								var i = 0;
								while(i<=23){
									if(!taskObj.dayStat[i] || taskObj.dayStat[i].id != i) taskObj.dayStat.splice(i, 0, {id: i, give: 0, incomplete: 0, overload: 0});
									else i++;
								};

								taskObj.dayStat.sort(function(a,b){return a.id- b.id;});
							};

							//add taskObj to folderObj
							folderObj.tasks.push(taskObj);
						});
						folderObj.tasks.sort(function(a,b){return a.id- b.id;});

						//add folderObj to output
						output.folders.push(folderObj);
					});
					output.folders.sort(function(a,b){return a.id- b.id;});

					//parse ipLists
					if(_data[OperationItem.IPLists]) $.each(_data[OperationItem.IPLists], function(key, ipList){
						//parse ipList
						var ipListObj = paramTransfer({ranges: []}, ipList, [
							[OperationItem.IdList, "id"],
							[OperationItem.Name, "name"]
						]);

						if(ipList[OperationItem.Ranges]) $.each(ipList[OperationItem.Ranges], function(key, range){
							//parse task
							var rangeObj = paramTransfer({}, range, [
								[OperationItem.IdRange, "id"],
								[OperationItem.Start, "start"],
								[OperationItem.End, "end"]
							]);

							//prepare ip address
							rangeObj.start = num2dot(rangeObj.start);
							rangeObj.end = num2dot(rangeObj.end);

							//add rangeObj to folderObj
							ipListObj.ranges.push(rangeObj);
						});
						ipListObj.ranges.sort(function(a,b){return a.id- b.id;});

						//add ipListObj to output
						output.ipLists.push(ipListObj)
					});
					output.ipLists.sort(function(a,b){return a.id- b.id;});

					//parse geo zones
					if(_data[OperationItem.GeoZones]) $.each(_data[OperationItem.GeoZones], function(key, geoZone){
						//parse geo zone
						var geoZoneObj = paramTransfer({}, geoZone, [
							[OperationItem.IdZone, "id"],
							[OperationItem.Name, "name"]
						]);

						//add geoZoneObj to output
						output.geoZones.push(geoZoneObj);
					});
					output.geoZones.sort(function(a,b){return a.id- b.id;});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getIpLists: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.IPLists);
				req.setToken(data.token);

				req.send(function(_data){
					var output = [];

					if(_data[OperationItem.IPLists]) $.each(_data[OperationItem.IPLists], function(key, list){
						output.push({
							id: list[OperationItem.IdList],
							name: list[OperationItem.Name]
						});
					});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			getSystemConstants: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Get.SystemConstants);
				req.setToken(data.token);

				req.send(function(_data){
					var output = {};

					$.each(_data, function(key, val){
						switch(key){
							case OperationItem.TaskMinCost:
								output.taskMinCost = val;
								break;
							case OperationItem.TransferPercent:
								output.transferPercent = val;
								break;
							case OperationItem.ProxyFactor:
								output.proxyFactor = val;
								break;
							case OperationItem.TaskSecondCost:
								output.taskSecondCost = val;
								break;
							case OperationItem.ExchangeRate:
								output.exchangeRate = val;
								break;
							case OperationItem.SystemWMR:
								output.systemWMR = val;
								break;
							case OperationItem.UniqueTimeFactor:
								output.uniqueTimeFactor = val;
								break;
							case OperationItem.IPRangeFactor:
								output.ipRangeFactor = val;
								break;
						};
					});

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			setTaskStatus: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Set.TaskFrozen);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTask, data.taskId);
				req.addData(OperationItem.Frozen, data.frozen);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			setAccountPassword: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Set.Password);
				req.setToken(data.token);

				req.addData(OperationItem.Password, data.password);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			addFolder: function(data){
				data = $.extend(true, {
					exception: {
						LimitExceeded: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Add.Folder);
				req.setToken(data.token);

				req.addData(OperationItem.Name, data.name);

				req.send(function(_data){
					var output = {};

					output.id = _data[OperationItem.IdFolder];

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			addTask: function(data){
				data = $.extend(true, {
					exception: {
						LimitExceeded: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Add.Task);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.Name, data.name);
				req.addData(OperationItem.IdList, data.listId);
				req.addData(OperationItem.AfterClick, data.afterClick);
				req.addData(OperationItem.BeforeClick, data.beforeClick);
				req.addData(OperationItem.AllowProxy, data.allowProxy);
				req.addData(OperationItem.IgnoreGU, data.ignoreGU);
				req.addData(OperationItem.Growth, data.growth);
				req.addData(OperationItem.Domain, data.domain);
				req.addData(OperationItem.Profile, data.profile);
				req.addData(OperationItem.ListMode, data.listMode);
				req.addData(OperationItem.RangeSize, data.rangeSize);
				req.addData(OperationItem.UniquePeriod, data.uniquePeriod);
				req.addData(OperationItem.Mask, data.mask);
				req.addData(OperationItem.Days, data.days);
				req.addData(OperationItem.ExtSource, data.extSource);

				req.send(function(_data){
					var output = {};

					output.taskId = _data[OperationItem.IdTask];

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			deleteFolders: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Delete.Folders);
				req.setToken(data.token);

				req.addData(OperationItem.IdsFolder, data.ids);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			deleteTasks: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Delete.Tasks);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdsTasks, data.ids);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			renameFolder: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Set.FolderName);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.id);
				req.addData(OperationItem.Name, data.name);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			resetReadonlyKey: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Reset.ReadonlyKey);
				req.setToken(data.token);

				req.send(function(_data){
					var output = {};

					output.readonlyKey = _data[OperationItem.ReadonlyKey];

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			resetPassword: function(data){
				data = $.extend(true, {
					exception: {
						NotFound: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Reset.Password);

				req.addData(OperationItem.Mail, data.mail);

				req.send(function(_data){
					var output = {};
					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			confirmSetAccountPassword: function(data){
				data = $.extend(true, {
					exception: {
						InvalidCode: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Confirm.SetAccountPassword);
				req.setToken(data.token);

				req.addData(OperationItem.CodeConfirm, data.code);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			confirmSendCredits: function(data){
				data = $.extend(true, {
					exception: {
						LowBalance: function(){},
						InvalidRecipient: function(){},
						InvalidCode: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Confirm.SendCredits);
				req.setToken(data.token);

				req.addData(OperationItem.CodeConfirm, data.code);

				req.send(function(_data){
					var output = {};

					output.operationId = _data[OperationItem.IdOperation];
					output.balance = _data[OperationItem.Balance];
					output.tranferAmount = _data[OperationItem.TransferAmount];

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			confirmResetPassword: function(data){
				data = $.extend(true, {
					exception: {
						InvalidCode: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Confirm.resetPassword);

				req.addData(OperationItem.Mail, data.mail);
				req.addData(OperationItem.CodeConfirm, data.code);
				req.addData(OperationItem.Password, data.password);

				req.send(function(_data){
					var output = {};
					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			confirmRegister: function(data){

				data = $.extend(true, {
					exception: {
						InvalidCode: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Confirm.register);
				req.setToken(data.token);

				req.addData(OperationItem.Mail, data.mail);
				req.addData(OperationItem.CodeConfirm, data.code);

				req.send(function(_data){
					var output = {};
					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			auth: function(data){
				data = $.extend(true, {
					remember: false,
					exception: {
						NotMatch: function(){},
						SessionLimit: function(){}
					},
					ge_callback: function(){}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.auth);

				req.addData(OperationItem.Mail, data.mail);
				req.addData(OperationItem.Password, data.password);
				req.addData(OperationItem.Remember, data.remember);

				req.send(function(_data){
					var output = {
						token: _data[OperationItem.Token]
					};
					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			register: function(data){
				data = $.extend(true, {
					exception: {
						MailExists: function(){},
						LoginExists: function(){},
						Forbidden: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Registration);

				req.addData(OperationItem.Login, data.login);
				req.addData(OperationItem.Mail, data.mail);
				req.addData(OperationItem.Password, data.password);

				req.send(function(_data){
					var output = {};
					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			logOut: function(data){
				data = $.extend(true, {
					exception: {}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.logOut);
				req.setToken(data.token);

				req.send(function(_data){
					var output = {};
					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			moveTasks: function(data){
				data = $.extend(true, {
					exception: {
						FolderNotFound: function(){},
						TargetFolderNotFound: function(){},
						NotEnoughSlots: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Move.Tasks);
				req.setToken(data.token);

				req.addData(OperationItem.IdFolder, data.folderId);
				req.addData(OperationItem.IdTarget, data.targetId);
				req.addData(OperationItem.IdsTasks, data.ids);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			},
			sendCredits: function(data){
				data = $.extend(true, {
					exception: {
						LowBalance: function(){},
						InvalidRecipient: function(){}
					}
				}, data);

				var req = api.requestStorage.addRequest();

				req.setOpCode(OperationCode.Send.Credits);
				req.setToken(data.token);

				req.addData(OperationItem.Amount, data.amount);
				req.addData(OperationItem.Recipient, data.recipient);

				req.send(function(_data){
					var output = {};

					data.callback(output);
				}, data.exception, data.ge_callback);
			}
		},
		utils: {
			cwe: cwe,
			addScript: addScript,
			addStyleSheet: addStyleSheet,
			cookie : Cookie,
			interval: Interval,
			request: Request,
			wa_request: WaRequest,
			inObject: inObject,
			dot2num: dot2num,
			num2dot: num2dot
		}
	};

	api.requestStorage = new StorageRequest();

	api.Constants = {
		OperationCode : {
			auth : 'Sign in',
			logOut: 'Sign out',
			Registration : 'Sign up',
			Activate : 'Activate',
			Transfer2XXBalance: 'Transfer 2xx balance',

			Get : {
				GeneralInfo : 'Get general info',
				Balance : 'Get balance',
				TimeBonus : 'Get timebonus',
				Invite : 'Get invite',
				Masks: 'Get masks',
				Folders: 'Get folders',
				AccessKeys: 'Get access keys',
				GeoTargeting: 'Get geo targeting',
				ViewTargeting: 'Get views targeting',
				ClickTargeting: 'Get clicks targeting',
				DayTargeting: 'Get day targeting',
				Domains: 'Get domains',
				Tasks: 'Get tasks',
				SystemConstants: 'Get system constants',
				WeekTargeting: 'Get week targeting',
				IPLists: 'Get IP lists',
				IPRanges: "Get IP ranges",
				DayStats: "Get day stats",
				TimeDistribution: "Get time distribution",
				All: "Get all"
			},

			Set : {
				AccountStatus: 'Set account status',
				Vip: 'Set VIP',
				MaskRangeSize: 'Set mask range size',
				Mask: 'Set mask',
				FolderName: 'Set folder name',
				GeoTargeting: 'Set geo targeting',
				ViewTargeting: 'Set views targeting',
				ClickTargeting: 'Set clicks targeting',
				DayTargeting: 'Set day targeting',
				Domain: 'Set domain',
				Task: 'Set task',
				Password: 'Set password',
				TaskFrozen: 'Set task frozen',
				WeekTargeting: 'Set week targeting',
				IPListName: 'Set IP list name',
				IPRange: 'Set IP range',
				TimeDistribution: "Set time distribution"
			},

			Add : {
				Folder: 'Add folder',
				Domain: 'Add domain',
				Mask: 'Add mask',
				Task: 'Add task',
				IPList: 'Add IP list',
				IPRange: 'Add IP range'
			},

			Delete : {
				Folders : 'Delete folders',
				Domains: 'Delete domains',
				Masks: 'Delete masks',
				Tasks: 'Delete tasks',
				IPLists: 'Delete IP lists',
				IPRanges: 'Delete IP ranges'
			},

			Change : {
				Login : 'Change login',
				Mail : 'Change mail',
				Password : 'Change password'
			},

			Restore : {
				Access: 'Restore access',
				Account: 'Restore account'
			},

			Reset : {
				Account: 'Reset account',
				SurfingKey: 'Reset surfing key',
				ReadonlyKey: 'Reset readonly key',
				Password: 'Reset password'
			},

			Confirm: {
				register: 'Confirm sign up',
				SetAccountPassword: 'Confirm set password',
				SendCredits: 'Confirm send credits',
				resetPassword: 'Confirm reset password'
			},

			Send: {
				Credits: "Send credits"
			},

			Move: {
				Tasks: "Move tasks"
			}
		},

		OperationItem : {
			Action : 'Action',
			Amount: 'Amount',
			Status : 'Status',
			Error : 'Error',
			Data : 'Data',
			Login : 'Login',
			Mail : 'Mail',
			Password : 'Password',
			Token : 'Token',
			Invite : 'Invite',
			Offset : 'Offset',
			Count : 'Count',
			Name : 'Name',
			Fields : 'Fields',
			NewDatasetId : 'New dataset ID',
			Id : 'ID',
			Use : 'In use',
			FieldsCount : 'Fields count',
			DataSets : 'Datasets',
			SetsCount : 'Sets count',
			Ids : 'IDs',
			NewName : 'New name',
			IdSet : 'SetID',
			ActivationCode : 'Activation code',
			RegDate : 'Register timestamp',
			NewLogin : 'New login',
			NewMail : 'New mail',
			NewPassword : 'New password',
			Confirmation : 'Confirmation',
			Icq: 'ICQ',
			Wmr: 'WMR',
			InActivity: 'Inactivity',
			Balance: 'Balance',
			Deleted: 'Deleted',
			TimeBonus: 'Timebonus',
			Vip: 'VIP',
			AllowProxy: 'Allow proxy',
			IgnoreGU: 'Ignore GU',
			IdMask: 'Mask ID',
			RangeSize: 'Range size',
			Mask: 'Mask',
			UniquePeriod: 'Unique period',
			Masks: 'Masks',
			Folders: 'Folders',
			IdFolder: 'Folder ID',
			IdsFolder: 'Folder IDs',
			SurfingKey: 'Surfing key',
			ReadonlyKey: 'Readonly key',
			Remember: 'Remember',
			GeoTargeting: 'Geo targeting',
			ViewTargeting: 'Views targeting',
			ClickTargeting: 'Clicks targeting',
			TimeTargeting: 'Time targeting',
			DayTargeting: 'Day targeting',
			WeekTargeting: 'Week targeting',
			IdZone: 'Zone ID',
			Target: 'Target',
			ZoneShortName: 'Zone shortname',
			Domains: 'Domains',
			IdDomain: 'Domain ID',
			Domain: 'Domain',
			ExtSource: 'Ext source',
			IdsDomain: 'Domain IDs',
			IdsMasks: 'Mask IDs',
			IdsTasks: 'Task IDs',
			IdsRanges: 'Range IDs',
			IdsList: 'List IDs',
			IdTime: 'Time ID',
			IdTask: 'Task ID',
			IdList: 'List ID',
			IdRange: 'Range ID',
			IdTarget: 'Target ID',
			Day: 'Day',
			IdOperation: 'Operation ID',
			Recd: 'Recd',
			Min: 'Min',
			Max: 'Max',
			BeforeClick: 'Before click',
			AfterClick: 'After click',
			Tasks: 'Tasks',
			Incomplete: 'Incomplete',
			CodeConfirm: 'Confirm code',
			TaskSecondCost: 'Task second cost',
			TransferPercent:  'Transfer percent',
			ExchangeRate: 'Exchange rate',
			ProxyFactor: 'Proxy factor',
			SystemWMR: 'System WMR',
			UniqueTimeFactor: 'Unique time factor',
			IPRangeFactor: 'IP range factor',
			TaskMinCost: 'Task min cost',
			Recipient: 'Recipient',
			TransferAmount: 'Transfer amount',
			Overload: 'Overload',
			Frozen: 'Frozen',
			Hour: 'Hour',
			Growth: 'Growth',
			Profile: 'Profile',
			IPLists: 'IP lists',
			Ranges: 'Ranges',
			Start: 'Start',
			End: 'End',
			Days: 'Days',
			Balance2XX: '2xx balance',
			Balance3XX: '3xx balance',
			ListMode: 'List mode',
			TimeDistribution: 'Time distribution',
			Percent: 'Percent',
			Priority: 'Priority',
			GeneralInfo: 'General info',
			Timestamp: 'Timestamp',
			DayStatistic: 'Day stats',
			SystemConstants: 'System constants',
			GeoZones: 'Geo zones'
		},

		ResponseStatus : {
			GeneralError : 'General error',
			QueryError : 'Query error',
			Success : 'Success'
		},

		GeneralError : {
			NoResponse : 'No response',
			UnDefined : 'Undefined',
			WrongDataFormat : 'Wrong data format',
			AntiDosBlock : 'AntiDOS block',
			WrongSessionId : 'Wrong session ID',
			NotActivated : 'Account not activated',
			Blocked: 'Account blocked',
			MailSystemError : 'Mail system error',
			AccessDenied: 'Access denied'
		},

		QueryError : {
			NotMatch : 'Not match',
			NotFound: 'Not found',
			SessionLimit : 'Session limit',
			MailExists : 'Mail exists',
			LoginExists : 'Login exists',
			InviteNotFound : 'Invite not found',
			NameExists : 'Name exists',
			LimitExceeded : 'Limit exceeded',
			FieldsLimitExceeded : 'Fields limit exceeded',
			CannotRemove : 'Cannot remove',
			AlreadyActive : 'Already active',
			AlreadyExists: 'Already exists',
			WrongActivationCode : 'Wrong activation code',
			WrongPassword: 'Wrong password',
			PasswordNotMatch : 'Password not match',
			MailNotMatch : 'Mail not match',
			Forbidden: 'Forbidden',
			IcqExists: 'ICQ UIN exists',
			WmrExists: 'WMR exists',
			IpRangeNotRegistered: 'IP range not registered',
			WrongConfirmCode: 'Wrong confirm code',
			InvalidCode: 'Invalid code',
			LowBalance: 'Low balance',
			InvalidRecipient: 'Invalid recipient',
			FolderNotFound: 'Folder not found',
			TargetFolderNotFound: 'Target folder not found',
			NotEnoughSlots: 'Not enough slots'
		},

		AccountStatus : {
			Active : 0,
			Frozen : 1,
			Blocked : 2,
			Awaiting : 3
		},

		Limit : {
			Account : {
				Login : {
					Regexp: /^.*$/,
					Length : {
						Min : 4,
						Max : 50
					}
				},

				Password : {
					Regexp: /^.*$/,
					Length : {
						Min : 3,
						Max : 40
					}
				},

				Mail : {
					Regexp: /^[a-zA-Z0-9\.\-_]+@[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,6})+$/,
					Length : {
						Min : 8,
						Max : 70
					}
				}
			},

			Folder: {
				Name: {
					Regexp: /^.*$/,
					Length: {
						Min: 1,
						Max: 50
					}
				}
			},

			Task: {
				Name: {
					Regexp: /^.*$/,
					Length: {
						Min: 1,
						Max: 50
					}
				},
				Domain: {
					Regexp: /^((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(([a-zA-Zа-яА-Я0-9\-]*\.)+[a-zA-Zа-яА-Я\-\d]{2,9}))(\/.*)?$/,
					Length: {
						Min: 5,
						Max: 255
					}
				},
				ExtSource: {
					Regexp: /^(http|https|ftp)(:\/\/)((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(([a-zA-Zа-яА-Я0-9\-]*\.)+[a-zA-Zа-яА-Я\-\d]{2,9}))(\/{1}.{1,})?$/,
					Length: {
						Min: 5,
						Max: 500
					}
				},
				RangeSize: {
					Regexp: /^\d*$/,
					Value: {
						Min: 4,
						Max: 24,
						Default: 16
					}
				},
				Mask: {
					Regexp: /^.*$/,
					Length: {
						Min: 0,
						Max: 50
					}
				},
				UniquePeriod: {
					Regexp: /^\d*$/,
					Value: {
						Min: 0,
						Max: 28800,
						Default: 1440
					}
				},
				BeforeClick: {
					Regexp: /^\d*$/,
					Value: {
						Min: 10,
						Max: 900,
						Default: 250
					}
				},
				AfterClick: {
					Regexp: /^\d*$/,
					Value: {
						Min: 0,
						Max: 900,
						Default: 150
					}
				},
				Growth: {
					Regexp: /^\d*$/,
					Value: {
						Min: 0,
						Max: 100,
						Default: 0
					}
				},
				Profile: {
					Regexp: /^.*$/,
					Length: {
						Min: 0,
						Max: 50
					}
				},
				Days: {
					Regexp: /^\d*$/,
					Value: {
						Min: 0,
						Max: 4294967296
					}
				}
			},

			Confirm: {
				Code: {
					Regexp: /^.*$/,
					Length: {
						Min: 1,
						Max: 100
					}
				}
			},

			IPLists: {
				Name: {
					Regexp: /^.*$/,
					Length: {
						Min: 1,
						Max: 150
					}
				},
				IP: {
					Regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
					Length: {
						Min: 7,
						Max: 15
					}
				}
			}
		}
	};

	var OperationCode = api.Constants.OperationCode,
		OperationItem = api.Constants.OperationItem;

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
	function cwe(tag, attr, parent){
		var element = document.createElement(tag);
		if(attr){
			if(attr instanceof Object){
				$.each(attr, function(name, value){
					element.setAttribute(name, value);
				});
			}else{
				if (attr.length > 0) {
					var array = attr.split(";");
					for (var x = 0; x<=array.length - 1; x++) {
						var tattr = array[x].split(",");
						element.setAttribute(tattr[0], tattr[1]);
					};
				};
			};
		};

		if(parent) $(parent).append(element);

		return element;
	};
	function addScript(path, anticache){
		return cwe('script','type,text/javascript;src,'+path+((anticache)?"?rnd="+Math.random():""), document.getElementsByTagName('head')[0]);
	};
	function addStyleSheet(path, anticache){
		return cwe('link','rel,stylesheet;type,text/css;href,'+path+((anticache)?"?rnd="+Math.random():""), document.getElementsByTagName('head')[0]);
	};
	function Request(_url, _data, _callback, _defaultReceive, _timeout, _loaderShow, _loaderHide, _logSend, _logReceive, _otherOptions){
		if(_loaderShow) _loaderShow();
		var complete = false,
			stop = false,
			sended = false,
			state = {
				"waiting": "waiting",
				"loading": "loading",
				"canceled": "canceled",
				"completed": "completed"
			},
			SelfObj = this,
			otherOptions = $.extend(true, {
				changeStateCallback: function(state){}
			}, _otherOptions);

		var IFRAME = cwe('iframe','',document.getElementsByTagName('body')[0]);
		IFRAME.contentWindow.name = _defaultReceive;

		$(IFRAME).css({
			'display': 'none',
			'position': 'fixed',
			'top': 0,
			'left': -2000,
			'width': 0,
			'height': 0
		});
		var DOCUMENT = IFRAME.contentWindow.document;
		if(!DOCUMENT.body) DOCUMENT.appendChild(DOCUMENT.createElement('body'));
		var FORM = cwe('form',{
			'method': 'POST',
			'enctype': 'application/x-www-form-urlencoded',
			'accept-charset': 'utf-8',
			'action': _url + '?rnd='+Math.random()
		},DOCUMENT.body);
		var TEXTAREA = cwe('textarea','name,v',FORM);
		TEXTAREA.value = _data;

		function processResponse(resp){
			setState(state.completed);
			if(_loaderHide) _loaderHide();
			$(IFRAME).remove();
			resp = decodeURI(resp);
			if(_logReceive) _logReceive(resp);
			if(_callback) _callback(resp);
		};
		function setState(state){
			SelfObj.state = state;
			otherOptions.changeStateCallback(SelfObj.state);
		};

		$(IFRAME).bind('load',function(e){
			if(!stop){
				if(window.navigator.appName == 'Opera'){
					var interval = new Interval(function(){
						if(IFRAME.contentWindow.name != _defaultReceive){
							complete = true;
							interval.stop();
							processResponse(IFRAME.contentWindow.name);
						};
					}, 100);
					interval.start();
					$(IFRAME).unbind('load');
				}else{
					$(IFRAME).unbind('load');
					IFRAME.contentWindow.location.href="about:blank";
					$(IFRAME).bind('load',function(e){
						complete = true;
						processResponse(IFRAME.contentWindow.name);
					});
				};
			}else{
				$(IFRAME).unbind('load');
				setState(state.canceled);
			};
		});

		this.state = state.waiting;

		this.send = function(){
			if(sended){
				return false;
			}else {
				$(FORM).submit();
				sended = true;
				setState(state.loading);
				setTimeout(function(){
					if(!stop){
						if(!complete){
							$(IFRAME).unbind("load");
							complete = true;
							processResponse(_defaultReceive);
						};
					};
				},_timeout);
				if(_logSend) _logSend(TEXTAREA.value);
				return true;
			};
		};
		this.stop = function(){
			stop = true;
			$(IFRAME).unbind("load");
			setState(state.canceled);
		};
		this.setData = function(data){
			TEXTAREA.value = data;
		};
		this.setCallback = function(callback){
			_callback = callback;
		};
	};
	function WaRequest(){
		var urlRequest = api.options.server,
			defaultReceive = {},//string
			data = {},
			SelfObj = this;

		//Default receive data
		defaultReceive[api.Constants.OperationItem.Status] = api.Constants.ResponseStatus.GeneralError;
		defaultReceive[api.Constants.OperationItem.Error] = api.Constants.GeneralError.NoResponse;
		defaultReceive["_defaultReceive"] = true;
		defaultReceive = $.toJSON(defaultReceive);

		//request
		var request = new Request(
			urlRequest,//url
			null,//data
			null,//callback
			defaultReceive,//default receive data
			api.options.timeout,//timeout
			null,//loader show callback
			null,//loader hide callback
			((api.options.log.enable) ? api.options.log.callback.send : null),//log send callback
			((api.options.log.enable) ? api.options.log.callback.receive : null),//log receive callback
			{
				changeStateCallback: function(state){
					SelfObj.state = state;
				}
			}
		);

		this.state = request.state;

		this.setOpCode = function(opCode){
			data[api.Constants.OperationItem.Action] = opCode;
		};
		this.setToken = function(token){
			SelfObj.addData(api.Constants.OperationItem.Token, token);
		};
		this.addData = function(key, value){
			if(!data[api.Constants.OperationItem.Data]) data[api.Constants.OperationItem.Data] = {};
			data[api.Constants.OperationItem.Data][key] = value;
		};
		this.setDataRaw = function(raw){
			try{
				raw = eval("v="+raw);
				data = raw;

				return true;
			}catch(e){
				return false;
			};
		};
		this.toCode = function(){
			return $.toJSON(data);
		};
		this.toObject = function(code){
			return eval("v="+code);
		};
		this.send = function(callback, exception, ge_callback){
			request.setData(SelfObj.toCode(data));
			request.setCallback(function(receive_data){
				receive_data = SelfObj.toObject((receive_data.length > 0) ? receive_data : "{}");
				if(!receive_data[api.Constants.OperationItem.Data]) receive_data[api.Constants.OperationItem.Data] = {};
				var data = receive_data[api.Constants.OperationItem.Data];

				switch(receive_data[api.Constants.OperationItem.Status]){
					case api.Constants.ResponseStatus.Success:
						callback(data);
						break;
					case api.Constants.ResponseStatus.QueryError:
						if(exception){
							$.each(api.Constants.QueryError, function(key, val){
								if(val == receive_data[api.Constants.OperationItem.Error]){
									exception[key](data);
								};
							});
						};
						break;
					case api.Constants.ResponseStatus.GeneralError:
						var errorName = "";
						$.each(api.Constants.GeneralError, function(key, val){
							if(val == receive_data[api.Constants.OperationItem.Error]){
								errorName = key;
								api.options.exception[key](data);
							};
						});
						if(ge_callback) ge_callback(data, errorName);
						break;
				};
			});
			request.send();
		};
	};
	function StorageRequest(){
		var listRequest = [];

		var interval = new Interval(function(){
			if(listRequest.length > 0){
				var count_worked = 0;

				var iStart = 0, iEnd = listRequest.length;
				for(iStart; iStart < iEnd; iStart++){
					var req = listRequest[iStart];

					if(req.state == "loading"){
						count_worked++;
					}else if(req.state == "canceled" || req.state == "completed"){
						listRequest.splice(iStart, 1);
						iStart--;
						iEnd = listRequest.length
					};
				};

				if(api.options.loader.enable){
					if(count_worked > 0) api.options.loader.show();
					else api.options.loader.hide();
				};
			};
		}, 300);
		interval.start();

		this.addRequest = function(){
			var req = new WaRequest();
			listRequest.push(req);
			return req;
		};
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
	}
	function paramTransfer(objIn, objOut, params){
		$.each(objOut, function(key, val){
			var id = paramFind(key, params);
			if(params[id]) objIn[params[id][1]] = val;
		});

		function paramFind(name, params_arr){
			var out = null;

			for(var i=0;i<=params_arr.length-1;i++) if(params_arr[i][0] == name) return i;

			return out;
		};

		return objIn;
	};
	function dot2num(dot){
		var d = dot.split('.');
		return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
	};
	function num2dot(num) {
		var d = num%256;
		for(var i=3;i>0;i--){
			num = Math.floor(num/256);
			d = num%256 + '.' + d;
		}
		return d;
	};
})(jQuery);