// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.
'use strict';
var global = global || this;
var doc = document,
	shadowBody = doc.createElement("body"),
	shadowDIV = doc.createElement("div"),
	_placeholder = function(prefix) {
		return prefix || "@" + Math.random().toString(36).substring(2)
	},
	$NULL = null,
	$UNDEFINED,
	$TRUE = !$UNDEFINED,
	$FALSE = !$TRUE,
	$ = {
		id: 9,
		uidAvator: Math.random().toString(36).substring(2),
		hashCode: function(obj, prefix) {
			var uidAvator = (prefix || "") + $.uidAvator,
				codeID;
			if (!(codeID = obj[uidAvator])) {
				codeID = obj[uidAvator] = $.uid();
			}
			return codeID;
		},
		noop: function noop() {},
		valueOf: function(Obj) {
			if (Obj) {
				Obj = Obj.valueOf()
			}
			return Obj
		},
		uid: function() {
			return this.id = this.id + 1;
		},
		isString: function(str) {
			var start = str.charAt(0);
			return (start === str.charAt(str.length - 1)) && "\'\"".indexOf(start) !== -1;
		},
		trim: function(str) {
			str = str.replace(/^\s\s*/, '')
			var ws = /\s/,
				i = str.length;
			while (ws.test(str.charAt(--i)));
			return str.slice(0, i + 1);
		},
		p: function(arr, item) { //push
			var len = arr.length
			arr[len] = item;
			return len;
		},
		us: function(arr, item) { //unshift
			arr.splice(0, 0, item);
		},
		un: function(array) { //unique
			var a = array;
			for (var i = 0; i < a.length; ++i) {
				for (var j = i + 1; j < a.length; ++j) {
					if (a[i] === a[j])
						a.splice(j--, 1);
				}
			}
			return a;
		},
		s: function(likeArr) { //slice
			var array;
			if (typeof likeArr === "string") {
				return likeArr.split('');
			}
			try {
				array = Array.prototype.slice.call(likeArr, 0); //non-IE and IE9+
			} catch (ex) {
				array = [];
				for (var i = 0, len = likeArr.length; i < len; i++) {
					array.push(likeArr[i]);
				}
			}
			return array;
		},
		pI: function(arr, item) { //pushByID
			arr[item.id] = item;
			return item;
		},
		lI: function(arr) { //lastItem
			return arr[arr.length - 1];
		},
		iA: function(arr, afterItem, item) { //insertAfter
			for (var i = 0; i < arr.length; i += 1) {
				if (arr[i] === afterItem) {
					arr.splice(i + 1, 0, item);
					break;
				}
			}
			return i;
		},
		iO: function(arr, item) { //indexOf
			for (var i = 0; i < arr.length; i += 1) {
				if (arr[i] === item) {
					return i;
				}
			}
			return -1;
		},
		fI: function(obj, callback) { //forIn
			for (var i in obj) {
				callback(obj[i], i, obj);
			}
		},
		ftE: function(arr, callback, scope) { //fastEach
			for (var i = 0, len = arr.length; i < len; i += 1) {
				callback(arr[i], i);
			}
		},
		fE: function(arr, callback, i) { //forEach
			if (arr) {
				arr = $.s(arr);
				// return this._each($.s(arr), callback, i)
				for (i = i || 0; i < arr.length; i += 1) {
					if (callback(arr[i], i, arr) === $FALSE) break;
				}
			}
		},
		c: function(proto) { //create
			_Object_create_noop.prototype = proto;
			return new _Object_create_noop;
		},
		D: { //DOM
			C: function(info) { //Comment
				return document.createComment(info)
			},
			iB: function(parentNode, insertNode, beforNode) { //insertBefore
				// try{
				parentNode.insertBefore(insertNode, beforNode || $NULL);
				// }catch(e){}
			},
			ap: function(parentNode, node) { //append
				parentNode.appendChild(node);
			},
			cl: function(node, deep) { //clone
				return node.cloneNode(deep);
			},
			rC: function(parentNode, node) { //removeChild
				parentNode.removeChild(node)
			},
			re: function(parentNode, new_node, old_node) { //replace
				try {
					parentNode.replaceChild(new_node, old_node);
				} catch (e) {}
			}
		}
	},
	_Object_create_noop = function proto() {},
	_traversal = function(node, callback) {
		for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
			var result = callback(child_node, i, node);
			if (child_node.nodeType === 1 && result !== $FALSE) {
				_traversal(child_node, callback);
			}
		}
	};

function ArraySet() {
	var self = this;
	self.keys = [];
	self.store = {};
	return self;
};
ArraySet.prototype = {
	set: function(key, value) {
		var self = this,
			keys = self.keys,
			store = self.store;
		key = String(key);
		if (!(key in store)) {
			$.p(keys, key)
		}
		store[key] = value;
	},
	get: function(key) {
		return this.store[key];
	},
	fE: function(callback) { //forEach ==> forIn
		var self = this,
			store = self.store,
			value;
		return $.fE(self.keys, function(key, index) {
			value = store[key];
			return callback(value, key, store);
		})
	},
	// ftE: function(callback) { //fastEach ==> forIn
	// 	var self = this,
	// 		store = self.store,
	// 		value;
	// 	return $.ftE(self.keys, function(key, index) {
	// 		value = store[key];
	// 		callback(value, key);
	// 	})
	// },
	has: function(key) {
		return key in this.store;
	}
};
/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData, viewInstance) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData, viewInstance);
	}
	baseData = baseData || {};
	self.id = $.uid();
	self._database = baseData;
	self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager = $UNDEFINED; //to get data
	self._prefix = $NULL; //冒泡时需要加上的前缀
	self._subsetDataManagers = []; //to touch off
	(self._triggerKeys = [])._ = {};
	viewInstance && self.collect(viewInstance);
	DataManager._instances[self.id] = self;
};
var relyStack = [], //用于搜集依赖的堆栈数据集
	allRelyContainer = {}, //存储处理过的依赖关系集，在set运作后链式触发 TODO：注意处理循环依赖
	chain_update_rely = function(id, updataKeys) {
		var relyContainer = allRelyContainer[id]; // || (allRelyContainer[this.id] = {});

		relyContainer && $.ftE(updataKeys, function(updataKey) { //触发依赖
			var leaderArr;
			if (leaderArr = relyContainer[updataKey]) {
				$.ftE(leaderArr, function(leaderObj) {
					var leader = leaderObj.dm,
						key = leaderObj.key;
					chain_update_rely(leader.id, leader.set(key, leader._getSource(key).get())) //递归:链式更新
				})
			}
		})
	},
	DM_proto = DataManager.prototype,
	DM_proto_get = DM_proto.get;



function _mix(sObj, nObj) {
	var obj_s, obj_n, i;
	if (sObj instanceof Object && nObj instanceof Object) {
		for (i in nObj) {
			var obj_n = nObj[i];
			if ((obj_s = sObj[i]) instanceof DynamicComputed) { //计算属性直接采用自带的set操作
				obj_s.set === $.noop ? (obj_s._value = _mix(obj_s._value, obj_n)) : obj_s.set(obj_n);
			} else if (obj_s !== obj_n) { //避免循环 Avoid Circular
				sObj[i] = _mix(obj_s, obj_n);
			}
		}
		return sObj;
	} else {
		return nObj;
	}
};
global.DataManager = DataManager;
DataManager.__formateKey; //最后一次get处理完成的formateKey
DataManager.__id; //最后一次get的id对象
DataManager._instances = {};
DataManager.config = {
	"$THIS": _placeholder(),
	"$PARENT": _placeholder(),
	"$TOP": _placeholder()
}

function _DM_set(key, nObj) {
	//mix:将对象和当前数据集合混合
	//计算属性需要特殊操作
	//set会引发计算属性链式更新，所以triggerKeys的正常收集仅仅发生在set内部
	var self = this,
		triggerKeys = self._triggerKeys,
		keys,
		lastKey,
		cache_top_n_obj,
		cache_n_Obj,
		updateKeys = [DataManager.config.$THIS];
	switch (arguments.length) {
		case 0:
			break;
		case 1:
			nObj = key;
			self._database = _mix(self._database, nObj);
			key = "";
			break;
		default:
			var sObj = self.get(key)
			if (sObj instanceof DynamicComputed) { //是计算属性
				sObj.set(nObj);
			} else {
				keys = key.split(".");
				lastKey = keys.pop();
				cache_top_n_obj = cache_n_Obj = {};
				$.ftE(keys, function(nodeKey) {
					cache_n_Obj = (cache_n_Obj[nodeKey] = {});
				});
				cache_n_Obj[lastKey] = nObj;
				self._database = _mix(self._database, cache_top_n_obj);
			}
	}
	$.ftE($.un(triggerKeys), function(triggerKey) {
		if (key.indexOf(triggerKey) === 0 || triggerKey.indexOf(key) === 0) {
			var oldVal = self.get(triggerKey),
				newVal = self._update(triggerKey), //updata cacheData
				computedPrototype = self._getSource(triggerKey);
			if (oldVal !== newVal || newVal instanceof Object || (computedPrototype /*updata cacheData*/ instanceof DynamicComputed && oldVal !== computedPrototype.get())) {
				$.p(updateKeys, triggerKey);
			}
		}
	});
	if (key !== "" && !triggerKeys._[key] /*$.iO(triggerKeys, key) === -1*/ ) { //新的Key
		$.p(triggerKeys, key);
		triggerKeys._[key] = $TRUE;
		self._update(key); //更新缓存
		$.p(updateKeys, key);
	}
	$.ftE(updateKeys, function(triggerKey) {
		self._touchOffSubset(triggerKey)
	});
	chain_update_rely(self.id, updateKeys) //开始链式更新
	return updateKeys;
};

function _DM_bubbleSet(key, nObj) {
	var self = this,
		parentDataManager = self._parentDataManager,
		prefix = self._prefix
	if (parentDataManager) { //确保数据更新到最顶层的数据源中。
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				if (prefix) {
					parentDataManager.set(prefix, nObj)
				} else {
					parentDataManager.set(nObj)
				}
				return _DM_set.call(self, parentDataManager.get(prefix));
			default:
				if (prefix) {
					prefix = prefix + "." + key;
				} else {
					prefix = key;
				}
				parentDataManager.set(prefix, nObj)
				return _DM_set.call(self, key, parentDataManager.get(prefix));
		}
		//从顶层获取完整数据
	}
};
// var direction = []; //direction.length>0 , from the parent node.
DataManager.prototype = {
	getParent: function(key) { //一般用于with或者layout
		//不加前缀对父级索取，不冒泡
		return this._parentDataManager.get(key);
	},
	getThis: function(key) {
		// var self = this,
		// 	prefix = self._prefix ? self._prefix + "." : "";
		// key = prefix + key;
		// //加前缀，不冒泡
		var self = this,
			triggerKeys = self._triggerKeys,
			cacheData = self._cacheData,
			result;
		if (!triggerKeys._[key]) {
			result = self._update(key);
		} else {
			result = cacheData[key];
		}
		return result;
	},
	getTop: function(key) {
		//冒泡到最顶层的父级
		var self = this,
			cacheData = self._cacheData,
			parentDM;
		while (parentDM = self._parentDataManager) {
			self = parentDM;
		}
		return self.get(key);
	},
	_getSource: function(key) {
		var self = this,
			cacheData = self._cacheData,
			arrKey = key.split("."),
			result = self._database;
		if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
			do {
				result = result[arrKey.splice(0, 1)];
			} while (result !== $UNDEFINED && arrKey.length);
		}
		return result;
	},
	get: function(key) {
		//冒泡获取，不更新缓存
		var self = this,
			triggerKeys = self._triggerKeys,
			cacheData = self._cacheData,
			result,
			parentDM;
		switch (arguments.length) {
			case 0:
				result = self._database;
				break;
			default:
				if (!triggerKeys._[key] /*$.iO(triggerKeys, key) === -1*/ ) { //这里不将key存入triggerKeys中，set时自然会存在
					result = self._update(key); //这种情况不存在缓存机制，因为set的自动更新triggerKeys无法更新到这些key，所以保持使用动态获取
				} else {
					result = cacheData[key];
				}
				if (result === $UNDEFINED && (parentDM = self._parentDataManager)) { //冒泡
					return parentDM.get(key);
				}
		}
		return result;
	},
	set: _DM_set,
	_update: function(key) { //将更新缓存从get中剥离
		//更新发生于：1、set	2、collect viewInstance	3、get set_triggerKeys(set操作中需更新的key)中不存在的key（由于2，所以不会影响到vi的更新）
		var self = this,
			cacheData = self._cacheData,
			arrKey = key.split("."),
			result = self._database;
		if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
			do {
				result = $.valueOf(result[arrKey.splice(0, 1)]);
			} while (result !== $UNDEFINED && arrKey.length);
		}
		return cacheData[key] = result;
	},
	_touchOffSubset: function(key) { //TODO:each下的事件无法冒泡到顶级
		var self = this;
		$.fE(self._subsetDataManagers, function(dm) {
			dm._touchOffSubset(key);
		});
		var i, vis, vi, len;
		$.ftE(self._viewInstances, function(vi) { //属性更新器彻底游离，由属性触发器托管
			vi.touchOff(key);
		});
	},
	_collectTriKey: function(vi) {
		var self = this,
			triggerKeys = self._triggerKeys,
			subsetDataManager = vi.dataManager;
		$.ftE(vi._triggers, function(triggerKey) {
			if (!triggerKeys._[triggerKey]/*$.iO(triggerKeys, triggerKey) === -1*/) { //更新触发所需的关键字
				subsetDataManager._update(triggerKey);
			}
		});
		//完全更新完毕后，更新页面，以免函数运作获取到正确数据
		$.ftE(vi._triggers, function(triggerKey) {
			vi.touchOff(triggerKey);
		});
		$.ftE(vi._triggers, function(triggerKey) { //将关键字收集到set操作中需更新的key
			// triggerKeys.push.apply(triggerKeys, vi._triggers);
			$.p(triggerKeys, triggerKey);
			triggerKeys._[triggerKey] = $TRUE;
		});
	},
	collect: function(viewInstance) {
		var self = this;
		if ($.iO(self._viewInstances, viewInstance) === -1) {
			viewInstance.dataManager && viewInstance.dataManager.remove(viewInstance);
			$.p(self._viewInstances, viewInstance);
			viewInstance.dataManager = self;
			self._collectTriKey(viewInstance);
		}
		return self;
	},
	subset: function(viewInstance, prefix) {
		var self = this,
			subsetDataManager = viewInstance.dataManager; //DataManager(baseData, viewInstance);
		subsetDataManager._parentDataManager = self;
		subsetDataManager.set = _DM_bubbleSet;
		if (arguments.length > 1) {
			subsetDataManager._database = _mix(subsetDataManager._database, self.get(String(prefix)));
		} else {
			subsetDataManager._database = self._database;
		}
		if (viewInstance instanceof ViewInstance) {
			viewInstance.dataManager = subsetDataManager;
			// viewInstance.reDraw();
			self._collectTriKey(viewInstance);
		}
		if (prefix) {
			subsetDataManager._prefix = prefix;
		}
		$.p(this._subsetDataManagers, subsetDataManager);
		return subsetDataManager; //subset(vi).set(basedata);},
	},
	remove: function(viewInstance) {
		var self = this,
			vis = self._viewInstances,
			index = $.iO(vis, viewInstance);
		if (index !== -1) {
			vis.splice(index, 1);
		}
	}
};
function DynamicComputed(obs, isStatic) { //动态计算类，可定制成静态计算类（只收集一次的依赖，适合于简单的计算属性，没有逻辑嵌套）
	var self = this;
	if (!(this instanceof Controller.Observer)) {
		return new Controller.Observer(obs);
	}
	if (obs instanceof Function) {
		self._get = obs;
		self.set = $.noop; //默认更新value并触发更新
		self._form = $NULL;
	} else {
		self._get = obs.get || function() {
			return self._value
		};
		self.set = obs.set || $.noop;
		self._form = obs.form || $NULL;
	}
	if (self._static = !! isStatic) {
		var _cacheGet = self.get;
		self.get = DynamicComputed._staticGet;
	};
	self._value;
	self._valueOf = Controller._initGetData;
	self._toString = Controller._getData;
};
DynamicComputed.prototype.get = function() {

	var self = this,
		result;
	$.p(relyStack, []); //开始收集

	result = self._get();

	var relySet = relyStack.pop(); //获取收集结果

	relySet.length && relyOn.pickUp(self, key, relySet);
	$.ftE(relySet, function(relyNode) { //处理依赖结果
		var relyId = relyNode.id,
			relyKey = relyNode.key,
			relyContainer = allRelyContainer[relyId] || (allRelyContainer[relyId] = {});

		if (!(leader_id === relyId && leader_key === relyKey)) { //避免直接的循环依赖
			cache = relyContainer[relyKey];
			if (!cache) {
				cache = relyContainer[relyKey] = [];
				cache._ = {};
			}
			var cache_key = cache._[leader_key] || (cache._[leader_key] = "|");

			if (cache_key.indexOf("|" + leader_id + "|") === -1) {
				$.p(cache, {
					dm: leader,
					key: leader_key
				});
				cache._[leader_key] += leader_id + "|";
			}
		}
	});
};
DynamicComputed._staticGet = function() { //转化成静态计算类
	var self = this,
		result = _cacheGet.apply(self, $.s(arguments));
	self.get = self._get; //剥离依赖收集器
	return result;
};
DynamicComputed._initGetData = function() {
	var self = this;
	self.valueOf = self.toString;
	return self.value = self.get();
};
DynamicComputed._getData = function() {
	return this.value
};
var _isIE = !+"\v1",
	//by RubyLouvre(司徒正美)
	//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
	IEfix = {
		acceptcharset: "acceptCharset",
		accesskey: "accessKey",
		allowtransparency: "allowTransparency",
		bgcolor: "bgColor",
		cellpadding: "cellPadding",
		cellspacing: "cellSpacing",
		"class": "className",
		colspan: "colSpan",
		// checked: "defaultChecked",
		selected: "defaultSelected",
		"for": "htmlFor",
		frameborder: "frameBorder",
		hspace: "hSpace",
		longdesc: "longDesc",
		maxlength: "maxLength",
		marginwidth: "marginWidth",
		marginheight: "marginHeight",
		noresize: "noResize",
		noshade: "noShade",
		readonly: "readOnly",
		rowspan: "rowSpan",
		tabindex: "tabIndex",
		valign: "vAlign",
		vspace: "vSpace"
	},
	/*
The full list of boolean attributes in HTML 4.01 (and hence XHTML 1.0) is (with property names where they differ in case):

checked             (input type=checkbox/radio)
selected            (option)
disabled            (input, textarea, button, select, option, optgroup)
readonly            (input type=text/password, textarea)
multiple            (select)
ismap     isMap     (img, input type=image)

defer               (script)
declare             (object; never used)
noresize  noResize  (frame)
nowrap    noWrap    (td, th; deprecated)
noshade   noShade   (hr; deprecated)
compact             (ul, ol, dl, menu, dir; deprecated)
//------------anyother answer
all elements: hidden
script: async, defer
button: autofocus, formnovalidate, disabled
input: autofocus, formnovalidate, multiple, readonly, required, disabled, checked
keygen: autofocus, disabled
select: autofocus, multiple, required, disabled
textarea: autofocus, readonly, required, disabled
style: scoped
ol: reversed
command: disabled, checked
fieldset: disabled
optgroup: disabled
option: selected, disabled
audio: autoplay, controls, loop, muted
video: autoplay, controls, loop, muted
iframe: seamless
track: default
img: ismap
form: novalidate
details: open
object: typemustmatch
marquee: truespeed
//----
editable
draggable
*/
	_AttributeHandle = function(attrKey) {
		var assign;
		var attrHandles = V.attrHandles,
			result;
		// console.log("attrKey:",attrKey)
		$.fE(attrHandles, function(attrHandle) {
			// console.log(attrHandle.match)
			if (attrHandle.match(attrKey)) {
				result = attrHandle.handle(attrKey);
				return $FALSE
			}
		});
		return result || _AttributeHandleEvent.com;
	},
	attributeHandle = function(attrStr, node, handle, triggerTable) {
		var attrKey = $.trim(attrStr.substring(0, attrStr.search("="))),
			attrValue = node.getAttribute(attrKey);
		attrKey = attrKey.toLowerCase()
		attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
		attrKey = (_isIE && IEfix[attrKey]) || attrKey
		if (_matchRule.test(attrValue)) {

			var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
				_shadowDIV = $.D.cl(shadowDIV), //parserNode
				_attributeHandle = _AttributeHandle(attrKey);
			attrViewInstance.append(_shadowDIV);
			attrViewInstance._isAttr = {
				key: attrKey
			}

			var attrTrigger = {
				event: function(NodeList, dataManager, eventTrigger, isAttr, viewInstance_ID) { /*NodeList, dataManager, eventTrigger, self._isAttr, self._id*/
					var currentNode = NodeList[handle.id].currentNode,
						viewInstance = V._instances[viewInstance_ID];
					if (currentNode) {
						dataManager.collect(attrViewInstance);
						$.fE(attrViewInstance._triggers, function(key) {
							attrViewInstance.touchOff(key);
						});
						_attributeHandle(attrKey, currentNode, _shadowDIV, viewInstance, dataManager, handle, triggerTable);
						dataManager.remove(attrViewInstance); //?
					}
				}
			}
			$.fE(attrViewInstance._triggers, function(key) {
				$.us(triggerTable[key] || (triggerTable[key] = []), attrTrigger);
			});

		}
	};
/*
 * View constructor
 */

function View(arg) {
	var self = this;
	if (!(self instanceof View)) {
		return new View(arg);
	}
	self.handleNodeTree = arg;
	self._handles = [];
	self._triggerTable = {};
	// self._triggers = {};
	// (self._triggers = [])._ = {}; //storage key word and _ storage trigger instance


	_buildHandler.call(self);
	_buildTrigger.call(self);

	return function(data) {
		return _create.call(self, data);
	}
};

function _buildHandler(handleNodeTree) {
	var self = this,
		handles = self._handles
		handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(item_node, index, handleNodeTree) {
		item_node.parentNode = handleNodeTree;
		if (item_node.type === "handle") {
			var handleFactory = V.handles[item_node.handleName];
			if (handleFactory) {
				var handle = handleFactory(item_node, index, handleNodeTree)
				handle && $.p(handles, handle);
			}
		}
	});
};
var _attrRegExp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;


function _buildTrigger(handleNodeTree, dataManager) {
	var self = this, //View Instance
		triggerTable = self._triggerTable;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				if (trigger) {
					var key = trigger.key || (trigger.key = "");
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.us((triggerTable[key]||(triggerTable[key]  =  [])), trigger); //Storage as key -> array
					$.p(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			var node = handle.node,
				nodeHTMLStr = node.outerHTML.replace(node.innerHTML, ""),
				attrs = nodeHTMLStr.match(_attrRegExp);

			$.fE(attrs, function(attrStr) {
				attributeHandle(attrStr, node, handle, triggerTable);

			});
		}
	});
};

function _create(data) { //data maybe basedata or dataManager
	var self = this,
		NodeList_of_ViewInstance = {}, //save newDOM  without the most top of parentNode -- change with append!!
		topNode = $.c(self.handleNodeTree);
	topNode.currentNode = $.D.cl(shadowBody);
	$.pI(NodeList_of_ViewInstance, topNode);

	_traversal(topNode, function(node, index, parentNode) {
		node = $.pI(NodeList_of_ViewInstance, $.c(node));
		if (!node.ignore) {
			var currentParentNode = NodeList_of_ViewInstance[parentNode.id].currentNode || topNode.currentNode;
			var currentNode = node.currentNode = $.D.cl(node.node);
			$.D.ap(currentParentNode, currentNode);
		} else {

			_traversal(node, function(node) { //ignore Node's childNodes will be ignored too.
				node = $.pI(NodeList_of_ViewInstance, $.c(node));
			});
			return $FALSE
		}
	});


	$.fE(self._handles, function(handle) {
		handle.call(self, NodeList_of_ViewInstance);
	});
	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggerTable, data);
};
/*
 * View Instance constructor
 */

var ViewInstance = function(handleNodeTree, NodeList, triggerTable, data) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggerTable, data);
	}
	var self = this,
		dataManager;
	self._isAttr = $FALSE; //if no null --> Storage the attribute key and current.
	self._isEach = $FALSE; //if no null --> Storage the attribute key and current.
	self.dataManager; //= dataManager;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.s(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	var el = self.topNode(); //NodeList[handleNodeTree.id].currentNode;
	self._packingBag = el;
	V._instances[self._id = $.uid()] = self;
	self._open = $.D.C(self._id + " _open");
	self._close = $.D.C(self._id + " _close");
	self._canRemoveAble = $FALSE;
	self._AVI = {};
	self._ALVI = {};
	self._WVI = {};
	$.D.iB(el, self._open, el.childNodes[0]);
	$.D.ap(el, self._close);
	(self._triggers = [])._ = {};
	// self._triggers._u = [];//undefined key,update every time
	self.TEMP = {};

	if (data instanceof DataManager) {
		dataManager = data.collect(self);
	} else {
		dataManager = DataManager(data, self);
	}

	$.fI(triggerTable, function(tiggerCollection, key) {
		if (".".indexOf(key)!==0) {
			$.p(self._triggers, key);
		}
		self._triggers._[key] = tiggerCollection;
	});
	$.fE(triggerTable["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, dataManager);
	});
	self.reDraw();
};

function _bubbleTrigger(tiggerCollection, NodeList, dataManager, eventTrigger) {
	var self = this;
	$.fE(tiggerCollection, function(trigger) { //TODO:测试参数长度和效率的平衡点，减少参数传递的数量
		trigger.event(NodeList, dataManager, eventTrigger, self._isAttr, self._id);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, dataManager, trigger);
		}
	});
};

function _replaceTopHandleCurrent(self, el) {
	self._canRemoveAble = $TRUE;
	self.topNode(el);
};
ViewInstance.prototype = {
	reDraw: function() {
		var self = this,
			dataManager = self.dataManager;

		$.fE(self._triggers, function(key) {
			dataManager._touchOffSubset(key)
		});
		return self;
	},
	append: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			AllLayoutViewInstance = self._ALVI,
			AllWithViewInstance = self._WVI,
			viewInstance,
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.ap(el, child_node);
		});
		_replaceTopHandleCurrent(self, el);

		$.ftE(NodeList[handleNodeTree.id].childNodes, function(child_node) {
			if (viewInstance = AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id]) {
				_replaceTopHandleCurrent(viewInstance, el)
			}
		});

		return self;
	},
	insert: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			AllLayoutViewInstance = self._ALVI,
			AllWithViewInstance = self._WVI,
			viewInstance,
			currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.iB(elParentNode, child_node, el);
		});
		_replaceTopHandleCurrent(self, elParentNode);

		$.ftE(NodeList[handleNodeTree.id].childNodes, function(child_node) {
			if (viewInstance = AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id]) {
				_replaceTopHandleCurrent(viewInstance, elParentNode)
			}
		});
		return self;
	},
	remove: function() {
		var self = this,
			el = this._packingBag
		if (self._canRemoveAble) {
			var handleNodeTree = self.handleNodeTree,
				NodeList = self.NodeList,
				currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
				openNode = self._open,
				closeNode = self._close,
				startIndex = 0;

			$.fE(currentTopNode.childNodes, function(child_node, index) {
				if (child_node === openNode) {
					startIndex = index
				}
			});
			$.fE(currentTopNode.childNodes, function(child_node, index) {
				// console.log(index,child_node,el)
				$.D.ap(el, child_node);
				if (child_node === closeNode) {
					return $FALSE;
				}
			}, startIndex);
			_replaceTopHandleCurrent(self, el);
			this._canRemoveAble = $FALSE; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
		}
		return self;
	},
	get: function get() {
		var dm = this.dataManager;
		return dm.get.apply(dm, $.s(arguments));
	},
	set: function set() {
		var dm = this.dataManager;
		return dm.set.apply(dm, $.s(arguments))
	},
	topNode: function(newCurrentTopNode) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList;
		if (newCurrentTopNode) {
			NodeList[handleNodeTree.id].currentNode = newCurrentTopNode
		} else {
			return NodeList[handleNodeTree.id].currentNode
		}
	},
	touchOff: function(key) {
		var self = this,
			dataManager = self.dataManager,
			NodeList = self.NodeList;
		// key!==$UNDEFINED?_bubbleTrigger.call(self, self._triggers._[key], NodeList, dataManager):_bubbleTrigger.call(self, self._triggers._u, NodeList, dataManager)
		_bubbleTrigger.call(self, self._triggers._[key], NodeList, dataManager)
	}
};

/*
 * parse function
 */
var _parse = function(node) {//get all childNodes
	var result = [];
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		switch (child_node.nodeType) {
			case 3:
				if ($.trim(child_node.data)) {
					$.p(result, new TextHandle(child_node))
				}
				break;
			case 1:
				if (child_node.tagName.toLowerCase() === "span" && child_node.getAttribute("type") === "handle") {
					var handleName = child_node.getAttribute("handle");
					if (handleName !== $NULL) {
						$.p(result, new TemplateHandle(handleName, child_node))
					}
				} else {
					$.p(result, new ElementHandle(child_node))
				}
				break;
		}
	}
	return result;
};

/*
 * Handle constructor
 */
function Handle(type, opction) {
	var self = this;
	if (!(self instanceof Handle)) {
		return new Handle(type,opction);
	}
	if (type) {
		self.type = type;
	}
	$.fI(opction, function(val,key) {
		self[key] = val;
	});
};
Handle.init = function(self,weights){
	self.id = $.uid();//weights <= 1
	if (weights<2)return;
	self._controllers = [];//weights <= 2
	self._controllers[$TRUE] = [];//In the #if block scope
	self._controllers[$FALSE] = [];//In the #else block scope
	if (weights<3)return;
	self._triggers = [];//weights <= 3
};
Handle.prototype = {
	nodeType:0,
	ignore: $FALSE, //ignore Handle --> no currentNode
	display: $FALSE, //function of show or hidden DOM
	childNodes:[],
	parentNode: $NULL,
	type: "handle"
};

/*
 * TemplateHandle constructor
 */
function TemplateHandle(handleName, node) {
	var self = this;
	self.handleName = $.trim(handleName);
	self.childNodes = _parse(node);
	Handle.init(self,3);
};
TemplateHandle.prototype = Handle("handle", {
	ignore: $TRUE,
	nodeType: 1
})

/*
 * ElementHandle constructor
 */
function ElementHandle(node) {
	var self = this;
	self.node = node;
	self.childNodes = _parse(node);
	Handle.init(self,3);
};
ElementHandle.prototype = Handle("element", {
	nodeType: 1
})

/*
 * TextHandle constructor
 */
function TextHandle(node) {
	var self = this;
	self.node = node;
	Handle.init(self,2);
};
TextHandle.prototype = Handle("text", {
	nodeType: 3
})

/*
 * CommentHandle constructor
 */
function CommentHandle(node) {
	var self = this;
	self.node = node;
	Handle.init(self,1);
};
CommentHandle.prototype = Handle("comment", {
	nodeType: 8
})
/*
 * parse rule
 */
var placeholder = {
		"<": "&lt;",
		">": "&gt;",
		"{": _placeholder(),
		"(": _placeholder(),
		")": _placeholder(),
		"}": _placeholder()
	},
	_Rg = function(s) {
		return RegExp(s, "g")
	},
	placeholderReg = {
		"<": /</g,
		">": />/g,
		"/{": /\\\{/g,
		"{": _Rg(placeholder["{"]),
		"/(": /\\\(/g,
		"(": _Rg(placeholder["("]),
		"/)": /\\\)/g,
		")": _Rg(placeholder[")"]),
		"/}": /\\\}/g,
		"}": _Rg(placeholder["}"])
	}, _head = /\{([\w\W]*?)\(/g,
	_footer = /\)[\s]*\}/g,
	parseRule = function(str) {
		var parseStr = str
			.replace(/</g, placeholder["<"])
			.replace(/>/g, placeholder[">"])
			.replace(placeholderReg["/{"], placeholder["{"])
			.replace(placeholderReg["/("], placeholder["("])
			.replace(placeholderReg["/)"], placeholder[")"])
			.replace(placeholderReg["/}"], placeholder["}"])
			.replace(_head, "<span type='handle' handle='$1'>")
			.replace(_footer, "</span>")
			.replace(placeholderReg["{"], "{")
			.replace(placeholderReg["("], "(")
			.replace(placeholderReg[")"], ")")
			.replace(placeholderReg["}"], "}");
		return parseStr;
	},
	_matchRule = /\{[\w\W]*?\([\w\W]*?\)[\s]*\}/,
	/*
	 * expores function
	 */

	V = {
		prefix: "attr-",
		parse: function(htmlStr) {
			var _shadowBody = $.D.cl(shadowBody);
			_shadowBody.innerHTML = htmlStr;
			var insertBefore = [];
			_traversal(_shadowBody, function(node, index, parentNode) {
				if (node.nodeType === 3) {
					$.p(insertBefore, {
						baseNode: node,
						parentNode: parentNode,
						insertNodesHTML: parseRule(node.data)
					});
				}
			});

			$.fE(insertBefore, function(item) {
				var node = item.baseNode,
					parentNode = item.parentNode,
					insertNodesHTML = item.insertNodesHTML;
				shadowDIV.innerHTML = insertNodesHTML;
				//Using innerHTML rendering is complete immediate operation DOM, 
				//innerHTML otherwise covered again, the node if it is not, 
				//then memory leaks, IE can not get to the full node.
				$.fE(shadowDIV.childNodes, function(refNode) {
					$.D.iB(parentNode, refNode, node)
				})
				$.D.rC(parentNode, node);
			});
			_shadowBody.innerHTML = _shadowBody.innerHTML;
			var result = new ElementHandle(_shadowBody);
			return View(result);
		},
		scans: function() {
			$.fE(document.getElementsByTagName("script"), function(scriptNode) {
				if (scriptNode.getAttribute("type") === "text/template") {
					V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
				}
			});
		},
		rt: function(handleName, triggerFactory) {
			return V.triggers[handleName] = triggerFactory;
		},
		rh: function(handleName, handle) {
			return V.handles[handleName] = handle
		},
		ra: function(match, handle) {
			var attrHandle = V.attrHandles[V.attrHandles.length] = {
				match: $NULL,
				handle: handle
			}
			if (typeof match === "function") {
				attrHandle.match = match;
			} else {
				attrHandle.match = function(attrKey) {
					return attrKey === match;
				}
			}
		},
		triggers: {},
		handles: {},
		attrHandles: [],
		modules: {},
		attrModules: {},
		eachModules: {},
		withModules: {},
		_instances: {},

		Proto: DynamicComputed/*Proto*/,
		Model: DataManager
	};
global.ViewParser = $.c(V);
V.rh("HTML", function(handle, index, parentHandle) {
	var endCommentHandle = _commentPlaceholder(handle, parentHandle, "html_end_" + handle.id),
		startCommentHandle = _commentPlaceholder(handle, parentHandle, "html_start_" + handle.id);
});
var _commentPlaceholder = function(handle, parentHandle, commentText) {
	var handleName = handle.handleName,
		commentText = commentText || (handleName + handle.id),
		commentNode = $.D.C(commentText),
		commentHandle = new CommentHandle(commentNode); // commentHandle as Placeholder

	$.p(handle.childNodes, commentHandle);
	$.iA(parentHandle.childNodes, handle, commentHandle);
	//Node position calibration
	//no "$.insert" Avoid sequence error
	return commentHandle;
};
var placeholderHandle = function(handle, index, parentHandle) {
	var commentHandle = _commentPlaceholder(handle, parentHandle);
};
var _each_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endeach_id,
		allArrViewInstances = V._instances[viewInstance_ID]._AVI,
		arrViewInstances = allArrViewInstances[handle.id];
	$.fE(parentHandle.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			comment_endeach_id = cs[index + 3].id;
			return $FALSE;
		}
	});
	// console.log(comment_endeach_id,viewInstance_ID)
	arrViewInstances && (arrViewInstances.hidden = !show_or_hidden);
	if (show_or_hidden) {
		$.fE(arrViewInstances, function(viewInstance, index) {
			// console.log(comment_endeach_id,NodeList_of_ViewInstance[comment_endeach_id],handle,parentHandle)
			viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
			// console.log(handle.len)
			if (arrViewInstances.len === index + 1) {
				return $FALSE;
			}
		});
	} else {
		$.fE(arrViewInstances, function(viewInstance) {
			// console.log(viewInstance)
			viewInstance.remove();
		})
	}
};
V.rh("#each", function(handle, index, parentHandle) {
	//The Nodes between #each and /each will be pulled out , and not to be rendered.
	//which will be combined into new View module.
	var _shadowBody = $.D.cl(shadowBody),
		eachModuleHandle = new ElementHandle(_shadowBody),
		endIndex = 0;

	// handle.arrViewInstances = [];//Should be at the same level with currentNode
	// handle.len = 0;
	var layer = 1;
	$.fE(parentHandle.childNodes, function(childHandle, index) {
		endIndex = index;
		if (childHandle.handleName === "#each") {
			layer += 1
		}
		if (childHandle.handleName === "/each") {
			layer -= 1;
			if (!layer) {
				return $FALSE
			}
		}
		$.p(eachModuleHandle.childNodes, childHandle);
		// layer && console.log("inner each:", childHandle)
	}, index + 1);
	// console.log("----",handle.id,"-------")
	parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
	V.eachModules[handle.id] = View(eachModuleHandle); //Compiled into new View module

	handle.display = _each_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});
V.rh("/each", placeholderHandle);
// var _noParameters = _placeholder();
V.rh("$TOP",V.rh("$THIS",V.rh("$PARENT",V.rh("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (!textHandle) {//{()} 无参数
		textHandle = $.p(handle.childNodes,new TextHandle(doc.createTextNode("")))
	}
	if (parentHandle.type !== "handle") { //is textNode
		if (textHandle) {
			$.iA(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//textHandle's parentNode will be rewrited. (by using $.insertAfter)
			return $.noop;
		}
	}// else {console.log("ignore:",textHandle) if (textHandle) {textHandle.ignore = $TRUE; } }  //==> ignore Node's childNodes will be ignored too.
}))));
V.rh("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	var i = 0;
	do {
		i += 1;
		var nextHandle = parentHandle.childNodes[index + i];
	} while (nextHandle && nextHandle.ignore);
	if (textHandle) { //textNode as Placeholder

		$.iA(parentHandle.childNodes, handle, textHandle);
		//Node position calibration
		//no "$.insert" Avoid sequence error

		return function(NodeList_of_ViewInstance) {
			var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
				textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
				parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
				$.D.iB(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
		}
	}
});
V.rh("/if", V.rh("#else", V.rh("#if", placeholderHandle)));
var _layout_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		commentPlaceholderElement,
		layoutViewInstance = V._instances[viewInstance_ID]._ALVI[handle.id];
	if (!layoutViewInstance) {
		return;
	}
	$.fE(handle.parentNode.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			commentPlaceholderElement = NodeList_of_ViewInstance[cs[index + 1].id].currentNode
			return $FALSE;
		}
	});
	console.log(show_or_hidden, viewInstance_ID, layoutViewInstance)
	if (show_or_hidden) {
		layoutViewInstance.insert(commentPlaceholderElement);
	} else {
		layoutViewInstance.remove();
	}

};
V.rh(">", V.rh("#layout", function(handle, index, parentHandle) {
	handle.display = _layout_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
}));
var _with_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endwith_id,
		AllLayoutViewInstance = V._instances[viewInstance_ID]._WVI,
		withViewInstance = AllLayoutViewInstance[handle.id];
	if (!withViewInstance) {
		return;
	}
	$.fE(parentHandle.childNodes, function(child_handle, index, cs) { //get comment_endwith_id
		if (child_handle.id === handle.id) {
			comment_endwith_id = cs[index + 3].id;
			return $FALSE;
		}
	});
	console.log(show_or_hidden,NodeList_of_ViewInstance[comment_endwith_id].currentNode)
	if (show_or_hidden) {
		withViewInstance.insert(NodeList_of_ViewInstance[comment_endwith_id].currentNode)
	} else {
		withViewInstance.remove();
	}
};
V.rh("#with", function(handle, index, parentHandle) {
	//The Nodes between #with and /with will be pulled out , and not to be rendered.
	//which will be combined into new View module.
	var _shadowBody = $.D.cl(shadowBody),
		withModuleHandle = new ElementHandle(_shadowBody),
		endIndex = 0;

	// handle.arrViewInstances = [];//Should be at the same level with currentNode
	var layer = 1;
	$.fE(parentHandle.childNodes, function(childHandle, index) {
		endIndex = index;
		// console.log(childHandle,childHandle.handleName)
		if (childHandle.handleName === "#with") {
			layer += 1
		}
		if (childHandle.handleName === "/with") {
			layer -= 1;
			if (!layer) {
				return $FALSE
			}
		}
		$.p(withModuleHandle.childNodes, childHandle);
	}, index + 1);
	// console.log("----",handle.id,"-------")
	parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
	V.withModules[handle.id] = View(withModuleHandle); //Compiled into new View module

	handle.display = _with_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});
V.rh("/with", placeholderHandle);
V.rt("HTML", function(handle, index, parentHandle) {
	var handleChilds = handle.childNodes,
		htmlTextHandlesId = handleChilds[0].id,
		beginCommentId = handleChilds[handleChilds.length - 1].id,
		endCommentId = handleChilds[handleChilds.length - 2].id,
		cacheNode =  $.D.cl(shadowDIV),
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var htmlText = NodeList_of_ViewInstance[htmlTextHandlesId]._data,
				startCommentNode = NodeList_of_ViewInstance[beginCommentId].currentNode,
				endCommentNode = NodeList_of_ViewInstance[endCommentId].currentNode,
				parentNode = endCommentNode.parentNode,
				brotherNodes = parentNode.childNodes,
				index = -1;
			$.fE(brotherNodes, function(node, i) {
				index = i;
				if (node === startCommentNode) {
					return $FALSE;
				}
			});
			index = index + 1;
			$.fE(brotherNodes, function(node, i) {
				if (node === endCommentNode) {
					return $FALSE;
				}
				$.D.rC(parentNode,node);//remove
			}, index);
			cacheNode.innerHTML = htmlText;
			$.fE(cacheNode.childNodes, function(node, i) {
				$.D.iB(parentNode, node, endCommentNode);
			});
		}
	}
	return trigger;
});
function _handle_on_event_string(isAttr, data) {
	if (isAttr) {
		//IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
		if (isAttr.key.indexOf("on") === 0 && !_isIE) { //W#C标准，onXXX属性事件使用string，消除差异
			data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
		}
	}
	return data;
}
V.rt("&&", V.rt("and", function(handle, index, parentHandle) {
	var childHandlesId = [],
		trigger;
	$.fE(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.p(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var and = $TRUE;
			$.fE(childHandlesId, function(child_handle_id) { //Compared to other values
				and = !! NodeList_of_ViewInstance[child_handle_id]._data
				if (!and) {
					return $FALSE; //stop forEach
				}
			});
			NodeList_of_ViewInstance[this.handleId]._data = and;
		}
	}
	return trigger;
}));
var eachConfig = {
	$I: "$INDEX"
}
V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = dataManager.get(arrDataHandleKey),
				allArrViewInstances = V._instances[viewInstance_ID]._AVI,
				arrViewInstances,
				divideIndex = data ? data.length : 0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;

			(arrViewInstances = allArrViewInstances[id] || (allArrViewInstances[id] = [])).len = divideIndex;

			$.fE(data, function(eachItemData, index) {

				var viewInstance = arrViewInstances[index];
				if (!viewInstance) {
					viewInstance = arrViewInstances[index] = eachModuleConstructor(eachItemData);
					viewInstance._isEach = {
						index:index,
						brotherVI:arrViewInstances
					}
					dataManager.subset(viewInstance,arrDataHandleKey);//+"."+index //reset arrViewInstance's dataManager
					inserNew = $TRUE;
				} else {
					viewInstance.set(eachItemData);
				}
				viewInstance.set(eachConfig.$I, index)
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = $TRUE;
				}


				if (inserNew && !arrViewInstances.hidden) {
					viewInstance.insert(comment_endeach_node)
				}
			});
			$.fE(arrViewInstances, function(eachItemHandle) {
				eachItemHandle.remove();
			}, divideIndex);
		}
	}
	return trigger
});
V.rt("==", V.rt("equa", function(handle, index, parentHandle) { //Equal
	var childHandlesId = [],
		trigger;
	$.fE(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.p(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var equal,
				val = NodeList_of_ViewInstance[childHandlesId[0]]._data; //first value
			$.fE(childHandlesId, function(child_handle_id) { //Compared to other values
				equal = (NodeList_of_ViewInstance[child_handle_id]._data == val);
				if (equal) {
					return $FALSE; //stop forEach
				}
			}, 1); //start from second;
			NodeList_of_ViewInstance[this.handleId]._data = !! equal;
		}
	}
	return trigger;
}));
V.rt("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[textHandleId].currentNode.data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
					var data = dataManager.get(key),
						currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
					if (isAttr) {
						//IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
						if (isAttr.key.indexOf("on") === 0 && !_isIE) {
							data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
						}
					}
					currentNode.data = data;
				}
			}
		}
	} else { //as stringHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = dataManager.get(key);
				}
			};
		}
	}
	return trigger;
});
V.rt("$THIS", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data || DataManager.config.$THIS,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				var data = dataManager.getThis(key),
					currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
				currentNode.data = _handle_on_event_string(isAttr, data);
			}
		}
	} else { //as stringHandle
		trigger = {
			key: key,
			bubble: $TRUE,
			event: function(NodeList_of_ViewInstance, dataManager) {
				NodeList_of_ViewInstance[this.handleId]._data = dataManager.getThis(key);
			}
		};
	}
	return trigger;
});
V.rt("$PARENT", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data || DataManager.config.$PARENT,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				var data = dataManager.getParent(key),
					currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
				currentNode.data = _handle_on_event_string(isAttr, data);
			}
		}
	} else { //as stringHandle
		trigger = {
			key: key,
			bubble: $TRUE,
			event: function(NodeList_of_ViewInstance, dataManager) {
				NodeList_of_ViewInstance[this.handleId]._data = dataManager.getParent(key);
			}
		};
	}
	return trigger;
});
V.rt("$TOP", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data || DataManager.config.$TOP,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				var data = dataManager.getTop(key),
					currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
				currentNode.data = _handle_on_event_string(isAttr, data);
			}
		}
	} else { //as stringHandle
		trigger = {
			key: key,
			bubble: $TRUE,
			event: function(NodeList_of_ViewInstance, dataManager) {
				NodeList_of_ViewInstance[this.handleId]._data = dataManager.getTop(key);
			}
		};
	}
	return trigger;
});
V.rt("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;

	trigger = { //const 
		key: key, //const trigger
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			//trigger but no bind data
			NodeList_of_ViewInstance[textHandleId].currentNode.data = key;
		}
	};
	return trigger;
});
V.rt("#if", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		ignoreHandleType = /handle|comment/,
		conditionHandleId = handle.childNodes[0].id,
		parentHandleId = parentHandle.id,

		comment_else_id, //#if inserBefore #else
		comment_endif_id, //#else inserBefore /if

		conditionDOM = handle._controllers,
		conditionStatus = $TRUE, //the #if block scope
		trigger,
		deep = 0;

	$.fE(parentHandle.childNodes, function(child_handle, i, childHandles) {

		if (child_handle.handleName === "#if") {
			deep += 1
		} else if (child_handle.handleName === "#else") {
			if (deep === 1) {
				conditionStatus = !conditionStatus;
				comment_else_id = $.lI(child_handle.childNodes).id;
			}
		} else if (child_handle.handleName === "/if") {
			deep -= 1
			if (!deep) {
				comment_endif_id = $.lI(child_handle.childNodes).id;
				return $FALSE;
			}
		} else if (child_handle.type !== "comment") {
			$.p(child_handle._controllers, id);
			$.p(conditionDOM[conditionStatus], child_handle.id);
		}
	}, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;

	trigger = {
		// key:"",//default is ""
		event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, viewInstance_ID) {
			var conditionVal = !! NodeList_of_ViewInstance[conditionHandleId]._data,
				parentNode = NodeList_of_ViewInstance[parentHandleId].currentNode,
				markHandleId = comment_else_id, //if(true)
				markHandle; //default is undefined --> insertBefore === appendChild
			
			if (NodeList_of_ViewInstance[this.handleId]._data !== conditionVal || triggerBy) {
				NodeList_of_ViewInstance[this.handleId]._data = conditionVal;
				if (!conditionVal) {
					markHandleId = comment_endif_id;
				}
				if (markHandleId) {
					markHandle = NodeList_of_ViewInstance[markHandleId].currentNode;
				}
				$.fE(conditionDOM[conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode || $.D.C(id)),
						display = $TRUE;

					$.fE(currentHandle._controllers, function(controller_id) {
						//Traverse all Logic Controller(if-else-endif) to determine whether each Controller are allowed to display it.
						var controllerHandle = NodeList_of_ViewInstance[controller_id]
						return display = display && ($.iO(controllerHandle._controllers[controllerHandle._data ? $TRUE : $FALSE], currentHandle.id) !== -1);
						//when display is false,abort traversing
					});
					if (display) {
						if (currentHandle.display) { //Custom Display Function,default is false
							currentHandle.display($TRUE, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID)
						} else if (node) {
							$.D.re(parentNode, node, placeholderNode)
						}
					}
				});
				$.fE(conditionDOM[!conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (currentHandle.placeholderNode = currentHandle.placeholderNode || $.D.C(id));

					if (currentHandle.display) { //Custom Display Function,default is false
						currentHandle.display($FALSE, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID)
					} else if (node) {
						$.D.re(parentNode, placeholderNode, node)
					}
				})
			}
		}
	}

	return trigger;
});
V.rt(">", V.rt("#layout", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		childNodes = handle.childNodes,
		templateHandle_id = childNodes[0].id,
		dataHandle_id = childNodes[1].id,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
				layoutViewInstance = AllLayoutViewInstance[id],
				inserNew;
			if (!layoutViewInstance) {
				layoutViewInstance = AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data]().insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
				dataManager.subset(layoutViewInstance);
			}
			layoutViewInstance.set(data);
		}
	}
	return trigger;
}));
V.rt("!", V.rt("nega", function(handle, index, parentHandle) { //Negate
	var nageteHandlesId = handle.childNodes[0].id,
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			NodeList_of_ViewInstance[this.handleId]._data = !NodeList_of_ViewInstance[nageteHandlesId]._data; //first value
		}
	}
	return trigger;
}));
V.rt("||",V.rt("or", function(handle, index, parentHandle) {
	var childHandlesId = [],
		trigger;
	$.fE(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.p(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var handleId = this.handleId;
			NodeList_of_ViewInstance[handleId]._data = $FALSE;
			$.fE(childHandlesId, function(child_handle_id) { //Compared to other values
				if (NodeList_of_ViewInstance[child_handle_id]._data) {
					NodeList_of_ViewInstance[handleId]._data = $TRUE;
					return $FALSE; //stop forEach
				}
			});
		}
	}
	return trigger;
}));

V.rt("#with", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		dataHandle_id = handle.childNodes[0].id,
		comment_with_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._WVI,
				withViewInstance = AllLayoutViewInstance[id], // || (AllLayoutViewInstance[id] = V.withModules[id](data).insert(NodeList_of_ViewInstance[comment_with_id].currentNode)),
				inserNew;
			if (!withViewInstance) {
				withViewInstance = AllLayoutViewInstance[id] = V.withModules[id](data);
				dataManager.subset(withViewInstance);
				withViewInstance.insert(NodeList_of_ViewInstance[comment_with_id].currentNode);
			}
			withViewInstance.set(data);
		}
	}
	return trigger;
});
var _testDIV = $.D.cl(shadowDIV),
	_getAttrOuter = Function("n", "return n." + (("textContent" in _testDIV) ? "textContent" : "innerText") + "||''"),
	_booleanFalseRegExp = /false|undefined|null|NaN/;

var _AttributeHandleEvent = {
	event: function(key, currentNode, parserNode) { //on开头的事件绑定，IE需要绑定Function类型，现代浏览器绑定String类型（_AttributeHandleEvent.com）
		var attrOuter = _getAttrOuter(parserNode);
		try {
			var attrOuterEvent = Function(attrOuter); //尝试编译String类型数据
		} catch (e) {
			attrOuterEvent = $.noop; //失败使用空函数替代
		}
		currentNode.setAttribute(key, attrOuterEvent);
	},
	style: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode.style.setAttribute('cssText', attrOuter);
	},
	com: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		if (currentNode.getAttribute(key) !== attrOuter) {
			currentNode.setAttribute(key, attrOuter)
		}
	},
	dir: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		if (currentNode[key] !== attrOuter) {
			currentNode[key] = attrOuter;
		}
	},
	bool: function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

		if (attrOuter) { // currentNode.setAttribute(key, key);
			currentNode[key] = key;
		} else { // currentNode.removeAttribute(key);
			currentNode[key] = $FALSE;
		}
	}
};
var _boolAssignment = ["checked", "selected", "disabled", "readonly", "multiple", "defer", "declare", "noresize", "nowrap", "noshade", "compact", "truespeed", "async", "typemustmatch", "open", "novalidate", "ismap", "default", "seamless", "autoplay", "controls", "loop", "muted", "reversed", "scoped", "autofocus", "required", "formnovalidate", "editable", "draggable", "hidden"];
V.ra(function(attrKey){
	return $.iO(_boolAssignment,attrKey) !==-1;
}, function() {
	return _AttributeHandleEvent.bool;
})
var iecheck = function(key, currentNode, parserNode) {
	var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

	if (attrOuter) {
		_asynAttributeAssignment(currentNode, "defaultChecked", key);
		// currentNode.defaultChecked = true;
	} else {
		_asynAttributeAssignment(currentNode, "defaultChecked", $FALSE);
		// currentNode.defaultChecked = false;
	}
	(this._attributeHandle = _AttributeHandleEvent.bool)(key, currentNode, parserNode);
}
V.ra("checked", function() {
	return _isIE ? iecheck : _AttributeHandleEvent.com;
})
var _dirAssignment = RegExp(["className","value"].join("|"),"gi")
V.ra(function(attrKey){
	return _dirAssignment.test(attrKey);
}, function() {
	return _AttributeHandleEvent.dir;
})
var _event_cache = {},
	_addEventListener = function(Element, eventName, eventFun, elementHash) {
		var args = $.s(arguments).splice(4),
			wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)] = function() {
				var wrapArgs = $.s(arguments);
				Array.prototype.push.apply(wrapArgs, args);
				eventFun.apply(Element, wrapArgs)
			};
		Element.addEventListener(eventName, wrapEventFun, $FALSE);
	},
	_removeEventListener = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.removeEventListener(eventName, wrapEventFun, $FALSE);
	},
	_attachEvent = function(Element, eventName, eventFun, elementHash) {
		var args = $.s(arguments).splice(4),
			wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)] = function() {
				var wrapArgs = $.s(arguments);
				Array.prototype.push.apply(wrapArgs, args);
				eventFun.apply(Element, wrapArgs)
			};
		Element.attachEvent("on" + eventName, wrapEventFun);
	},
	_detachEvent = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.detachEvent("on" + eventName, wrapEventFun);
	},
	_registerEvent = _isIE ? _attachEvent : _addEventListener,
	_cancelEvent = _isIE ? _detachEvent : _removeEventListener,
	_elementCache = {},
	eventListerAttribute = function(key, currentNode, parserNode, vi, dm) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName = key.replace("event-on", "").replace("event-", ""),
			eventFun = dm.get(attrOuter), //在重用函数的过程中会出现问题
			elementHashCode = $.hashCode(currentNode, "event"),
			eventCollection,
			oldEventFun;
		if (eventFun) {
			eventCollection = _elementCache[elementHashCode] || (_elementCache[elementHashCode] = {});
			if (oldEventFun = eventCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldEventFun, elementHashCode)
			}
			_registerEvent(currentNode, eventName, eventFun, elementHashCode, vi); //只能定位到属性操作的VI，需要重新构架！！如果完成这个，则_isEach的each元素需要全新的ViewInstance方法，包括remove等来调整次序
			eventCollection[eventName] = eventFun;
		}
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})
/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = {},
	_formKey = {
		"input": function(node) {//需阻止默认事件，比如Checked需要被重写，否则数据没有变动而Checked因用户点击而变动，没有达到V->M的数据同步
			var result = "value";
			switch (node.type.toLowerCase()) {
				case "checkbox":
					return {
						attributeName:"checked",
						eventNames:["change"]
					}
				case "button":
				case "reset":
				case "submit":
			}
			return {
				attributeName: "value",
				eventNames: _isIE ? ["propertychange", "keyup"] : ["input", "keyup"]
			};
		},
		"button": "innerHTML"
	}, _noopFormHandle = function(e, newValue) {
		return newValue
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, dm, handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventConfig = _formKey[currentNode.tagName.toLowerCase()] || {
				attributeName: "innerHTML",
				eventNames: ["click"]
			},
			eventNames,
			elementHashCode = $.hashCode(currentNode, "form"),
			formCollection,
			oldFormHandle,
			newFormHandle,
			obj = dm.get(attrOuter, $NULL);
		typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
		eventNames = eventConfig.eventNames;

		formCollection = _formCache[elementHashCode] || (_formCache[elementHashCode] = {});
		$.ftE(eventNames, function(eventName) {
			if (oldFormHandle = formCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldFormHandle, elementHashCode)
			}
			if (obj instanceof Proto) {
				var baseFormHandle = obj.form === $NULL ? _noopFormHandle : obj.form;
				newFormHandle = function(e) {
					dm.set(attrOuter, baseFormHandle.call(this, e, this[eventConfig.attributeName], vi))
				};
				_registerEvent(currentNode, eventName, newFormHandle, elementHashCode);
			} else if (typeof obj === "string") {
				newFormHandle = function(e) {
					dm.set(attrOuter, this[eventConfig.attributeName])
				};
				_registerEvent(currentNode, eventName, newFormHandle, elementHashCode);
			}
			formCollection[eventName] = newFormHandle;
		});
	};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
});
var _event_by_fun = (function() {
	var testEvent = Function(""),
		attrKey = "onclick";

	_testDIV.setAttribute(attrKey, testEvent);
	if (typeof _testDIV.getAttribute(attrKey) === "string") {
		return $FALSE;
	}
	return $TRUE;
}());
V.ra(function(attrKey){
	attrKey.indexOf("on") === 0;
},function () {
	return _event_by_fun&&_AttributeHandleEvent.event;
})
V.ra("style",function () {
	return _isIE&&_AttributeHandleEvent.style;
})