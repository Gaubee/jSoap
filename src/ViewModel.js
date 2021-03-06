/*
 * View Instance constructor
 */
var stopTriggerBubble; // = $FALSE;

function _addAttr(viewModel, node, attrJson) {
    //保存新增属性说对应的key，返回进行统一触发
    var result = [];
    var handle = jSouper.queryHandle(node);
    $.fI(attrJson, function(attrValue, attrKey) {
        attrKey = _fixAttrKey(attrKey);
        var attrViewModel = _getAttrViewModel(attrValue);
        //获取对应的属性处理器
        var _attributeHandle = _AttributeHandle(attrKey, node);
        var attrTrigger = {
            handleId: handle.id + attrKey,
            key: attrKey,
            type: "attributesTrigger",
            event: function(NodeList, model, /* eventTrigger,*/ isAttr /*, viewModel_ID*/ ) { /*NodeList, model, eventTrigger, self._isAttr, self._id*/
                //addAttr是违反解析规则的方法，所以VM的获取不一定是正确的，node与vm只能通过传入的参数确定
                // var viewModel = V._instances[viewModel_ID];

                attrViewModel.model = model;
                $.E(attrViewModel._triggers, function(key) { //touchoff all triggers
                    attrViewModel.touchOff(key);
                });
                _attributeHandle(attrKey, node, /*_shadowDIV*/ attrViewModel, viewModel, /*model.id,*/ handle, triggerTable);
                // model.remove(attrViewModel); //?

                //触发onporpertychange事件
                var _attrChangeListenerKey = node[_attrKeyListenerPlaceholder]
                if (_attrChangeListenerKey) {
                    var eventMap = attrKeyListenerEvent[_attrChangeListenerKey];
                    var propertyChangeEvents = eventMap && eventMap[attrKey];
                    $.isA(propertyChangeEvents) && $.E(propertyChangeEvents, function(handle) {
                        handle.call(node, attrKey, _get_element_value_from_key(node, attrKey));
                    });
                }
            }
        }
        var triggerTable = viewModel._triggers._;
        $.E(attrViewModel._triggers, function(key) {
            var triggerContainer = triggerTable[key];
            var smartTriggers = viewModel.model._smartTriggers
            if (!triggerContainer) {
                // ViewModel._buildSmart(viewModel, key);//.rebuild();
                triggerContainer = triggerTable[key] = [];
                $.p(viewModel._triggers, key);
                $.p(result, key);
                var smartkeyTrigger = ViewModel._buildSmart(viewModel, key)
                $.p(smartTriggers, smartTriggers._[key] = smartkeyTrigger);
            } else {
                smartkeyTrigger = smartTriggers._[key];
            }
            $.us(triggerContainer, attrTrigger);
            //强制更新
            smartkeyTrigger.rebuild($TRUE);
        });
    });
    // viewModel.model.rebuildTree();
    // viewModel.model.touchOff();
    return result;
};

function ViewModel(handleNodeTree, NodeList, triggerTable, model, opts, vmName) {
    if (!(this instanceof ViewModel)) {
        return new ViewModel(handleNodeTree, NodeList, triggerTable, model, opts, vmName);
    }
    var self = this;
    self.vmName = vmName;
    self._isAttr = $FALSE; //if no null --> Storage the attribute key and current.
    self._isEach = $FALSE; //if no null --> Storage the attribute key and current.
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
    self._CVI = {};
    self._teleporters = {};
    // self._arrayViewModel = $NULL;

    $.D.iB(el, self._open, el.childNodes[0]);
    $.D.ap(el, self._close);
    (self._triggers = [])._ = {};
    // self._triggers._u = [];//undefined key,update every time
    self.TEMP = {};
    $.fI(triggerTable, function(tiggerCollection, key) {
        $.p(self._triggers, key);
        self._triggers._[key] = tiggerCollection;
    });

    self.constructor = ViewModel;
    //为vm加上Model代理层
    new ProxyModel(self, model, opts);

    //转移到proxyModel中
    // self._smartTriggers = [];

    // //bind viewModel with DataManger
    // model.collect(self); //touchOff All triggers

    //console.group(self._id,"touchOff .")
    stopTriggerBubble = $TRUE;
    self.touchOff("."); //const value
    stopTriggerBubble = $FALSE;
    //console.groupEnd(self._id,"touchOff .")
};

/*
 * 静态函数
 */
//_buildSmartTriggers接口，
ViewModel._buildSmartTriggers = function(viewModel, sKey) {
    var smartTriggers = [];
    smartTriggers._ = {};
    $.E(viewModel._triggers, function(sKey) {
        $.p(smartTriggers, smartTriggers._[sKey] = ViewModel._buildSmart(viewModel, sKey));
    });
    return smartTriggers;
};
//VM通用的重建接口
var _smartTriggerHandle_rebuild = function(forceUpdate) {
    var smartTrigger = this;
    var TEMP = smartTrigger.TEMP;
    var viewModel = TEMP.vM;
    var router_result = viewModel.model.$router(TEMP.sK);
    var topGetter = router_result.model,
        matchKey = router_result.key || "";
    var currentTopGetter = TEMP.md;
    if (topGetter !== currentTopGetter) {
        TEMP.md = topGetter
        if (currentTopGetter) {
            smartTrigger.unbind(currentTopGetter._triggerKeys)
        }
        if (topGetter) {
            smartTrigger.matchKey = matchKey;
            smartTrigger.bind(topGetter._triggerKeys);
            // finallyRun.register(viewModel._id + TEMP.sK, function() {
            //因为Model是惰性生成的，因此在Model存在的情况下已经可以进行更新DOM节点了
            smartTrigger.event(topGetter._triggerKeys);
            // });
        }
    }
    if (forceUpdate && topGetter) {
        smartTrigger.event(topGetter._triggerKeys)
    }
};
//_buildSmart接口
ViewModel._buildSmart = function(viewModel, sKey) {
    var smartTrigger = new SmartTriggerHandle(
        sKey || "", //match key
        vm_buildSmart_event, //VM通用的触发函数
        { //TEMP data
            vM: viewModel,
            sK: sKey
        }
    );
    smartTrigger.rebuild = _smartTriggerHandle_rebuild;
    // viewModel._triggers._[sKey]._ = smartTrigger;
    return smartTrigger;
};

var vm_buildSmart_event = function(smartTriggerSet) {
    var TEMP = this.TEMP;
    TEMP.vM.touchOff(TEMP.sK);
};

var VI_session = ViewModel.session = {
    touchHandleIdSet: $NULL,
    touchStacks: $NULL
};

//保存所有的node与相应的handle的信息，用于查询
(ViewModel.queryList = [])._ = {};

function _bubbleTrigger(tiggerCollection, NodeList, model /*, eventTrigger*/ ) {
    var self = this, // result,
        eventStack = [],
        touchStacks = VI_session.touchStacks,
        touchHandleIdSet = VI_session.touchHandleIdSet;
    $.p(touchStacks, eventStack); //Add a new layer event collector
    $.e(tiggerCollection, function(trigger) { //TODO:测试参数长度和效率的平衡点，减少参数传递的数量
        if (!touchHandleIdSet[trigger.handleId]) { //To prevent repeated collection
            $.p(eventStack, trigger) //collect trigger
            if ( /*result !== $FALSE &&*/ trigger.bubble && !stopTriggerBubble) {
                // Stop using the `return false` to prevent bubble triggered
                // need to use `this. Mercifully = false` to control
                var parentNode = NodeList[trigger.handleId].parentNode;
                parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, model /*, trigger*/ );
            }
            touchHandleIdSet[trigger.handleId] = $TRUE;
        }
        /*else{
            console.log(trigger.handleId)
        }*/
    });

};

function _moveChild(self, el) {
    var AllEachViewModel = self._AVI,
        AllLayoutViewModel = self._ALVI,
        AllWithViewModel = self._WVI;

    self.topNode(el);

    $.E(self.NodeList[self.handleNodeTree.id].childNodes, function(child_node) {
        var viewModel,
            arrayViewModels,
            id = child_node.id;
        if (viewModel = (AllLayoutViewModel[child_node.id] || AllWithViewModel[child_node.id])) {
            _moveChild(viewModel, el)
        } else if (arrayViewModels = AllEachViewModel[id]) {
            $.E(arrayViewModels, function(viewModel) {
                _moveChild(viewModel, el);
            })
        }
    });

    self.oninsert && self.oninsert();
};

//根据AttrJson创建索引函数

function _buildQueryMatchFun(matchAttr) {
    if (matchAttr instanceof Function) {
        return matchAttr
    }
    return function(node) {
        for (var attrKey in matchAttr) {
            var _v = node[attrKey];
            if (attrKey === "tagName") {
                _v = _v.toUpperCase();
            }
            if (matchAttr[attrKey] != _v) {
                return $FALSE;
            }
        }
        return $TRUE;
    }
};
var fr = doc.createDocumentFragment();

var __ViewModelProto__ = ViewModel.prototype = {
    destroy: function() {
        var self = this;
        //TODO:delete node
        self.remove();
        return null;
    },
    append: function(el) {
        var self = this,
            currentTopNode = self.topNode();

        $.e(currentTopNode.childNodes, function(child_node) {
            $.D.ap(fr, child_node);
        });
        $.D.ap(el, fr);

        _moveChild(self, el);
        self._canRemoveAble = $TRUE;

        return self;
    },
    insert: function(el) {
        var self = this,
            currentTopNode = self.topNode(),
            elParentNode = el.parentNode;

        $.e(currentTopNode.childNodes, function(child_node) {
            $.D.ap(fr, child_node);
        });
        $.D.iB(elParentNode, fr, el);

        _moveChild(self, elParentNode);
        self._canRemoveAble = $TRUE;

        return self;
    },
    addAttr: function(node, attrJson) {
        var self = this;
        var _touchOffKeys;
        if ($.isA(node)) {
            _touchOffKeys = [];
            $.E(node, function(node) {
                _touchOffKeys.push.apply(_touchOffKeys, _addAttr(self, node, attrJson));
            });
        } else {
            _touchOffKeys = _addAttr(self, node, attrJson)
        }
        self.model.rebuildTree();
        $.E(_touchOffKeys, function(key) {
            self.model.touchOff(key);
        });
        return self;
    },
    getOneElementByTagName: function(tagName) {
        return this.getElementsByTagName(tagName)[0];
    },
    getElementsByTagName: function(tagName) {
        return this.queryElement({
            tagName: tagName.toUpperCase()
        });
    },
    // //获取绑定在元素上的真实数据
    // getElementAttrData: function(node, attrKey) {
    //     var nodeList = this._buildElementMap();
    //     var handle = nodeList[$.hashCode(node)];
    //     return handle && handle.getAttr(attrKey);
    // },
    _buildElementMap: function() {
        var self = this;
        var NodeList = self.NodeList;
        if (!NodeList._) {
            var result = NodeList._ = [];
            $.fI(NodeList, function(handle) {
                if (handle.type === "element") {
                    $.p(result, handle);
                    //使得Element可以直接映射到Handle
                    result[$.hashCode(handle.currentNode)] = handle;
                }
            })
        }
        return NodeList._;
    },
    queryElement: function(matchFun) {
        return this.model.queryElement(matchFun);
    },
    _queryElement: function(matchFun) {
        var self = this;
        var result = [];
        //获取数组化的节点
        var nodeList = self._buildElementMap();

        //遍历节点
        $.E(nodeList, function(elementHandle) {
            if (matchFun(elementHandle.currentNode)) {
                $.p(result, elementHandle.currentNode);
            }
        });
        return result;
    },
    getElementViewModel: function(node) {
        return this.model.getElementViewModel(node);
    },
    _getElementViewModel: function(node) {
        var self = this;
        var result;
        var nodeList = self._buildElementMap();
        $.e(nodeList, function(elementHandle) {
            if (elementHandle.currentNode === node) {
                result = self;
                return false
            }
        });
        return result;
    },
    remove: function() {
        var self = this,
            el = self._packingBag;
        if (self._canRemoveAble) {
            var handleNodeTree = self.handleNodeTree,
                NodeList = self.NodeList,
                currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
                openNode = self._open,
                closeNode = self._close;

            //TODO:fix Firefox Opera
            var currentNode = openNode;
            var nextNode;
            while ($TRUE) {
                nextNode = currentNode.nextSibling;
                $.D.ap(el, currentNode);
                if (nextNode === closeNode) {
                    $.D.ap(el, nextNode);
                    break;
                }
                currentNode = nextNode;
            }

            self.topNode(el);

            self._canRemoveAble = $FALSE; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert

            self.onremove && self.onremove();
        }
        return self;
    },
    //如果数据所在的对象是数组的元素，将数据中的数据移除，显示的each-remove
    removeFromArray: function() {
        var self = this;
        var arr = self.get("$Parent");
        if ($.isA(arr)) {
            var index = self.get("$Index");
            arr.splice(index, 1);
            self.set("$Parent", arr);
        }
    },
    topNode: function(newCurrentTopNode) {
        var self = this,
            handleNodeTree = self.handleNodeTree,
            NodeList = self.NodeList,
            result;
        if (newCurrentTopNode) {
            NodeList[handleNodeTree.id].currentNode = newCurrentTopNode
        } else if (!self._canRemoveAble && self._packingBag) {
            result = self._packingBag;
        } else {
            var HNT_cs = handleNodeTree.childNodes
            if (HNT_cs.length) {
                var index = 0;
                var len = HNT_cs.length;
                var node;
                do {
                    node = NodeList[HNT_cs[index++].id].currentNode;
                    if (node && (node.nodeType === 1 || node.nodeType === 3)) {
                        result = node.parentNode;
                    }
                } while (!result && index < len)
            }
        }
        if (!result) {
            result = NodeList[handleNodeTree.id].currentNode;
        }
        return result;
    },
    touchOff: function(key) {
        var self = this,
            model = self.model,
            NodeList = self.NodeList;
        VI_session.touchHandleIdSet = {};

        // collect trigger stack
        VI_session.touchStacks = [];

        // if (key==="$PARENT.radio") {debugger};
        _bubbleTrigger.call(self, self._triggers._[key], NodeList, model)

        // trigger trigger stack
        $.E(VI_session.touchStacks, function(eventStack) {
            $.E(eventStack, function(trigger) {
                trigger.event(NodeList, model, /*trigger,*/ self._isAttr, self._id)
            })
        })
    },
    teleporter: function(viewModel, telporterName) {
        var self = this;
        (telporterName === $UNDEFINED) && (telporterName = "index");
        var teleporter = self._teleporters[telporterName];
        if (teleporter) {
            if (teleporter.show_or_hidden !== $FALSE && teleporter.display) {
                //remove old
                var old_viewModel = teleporter.vi;
                if (old_viewModel !== viewModel) {
                    old_viewModel && old_viewModel.remove();

                    //insert new & save new
                    viewModel.insert(teleporter.ph);
                }
            }
            teleporter.vi = viewModel
        }
        return self;
    },
    getTeleporterVM: function(telporterName) {
        var self = this;
        var teleporter = self._teleporters[telporterName];
        if (teleporter) {
            return teleporter.vi;
        }
    },
    removeTeleporterVM: function(telporterName) {
        var self = this;
        var teleporter = self._teleporters[telporterName];
        if (teleporter && teleporter.vi) {
            teleporter.vi.remove();
            teleporter.vi = $NULL;
        }
    },
    /*
     * 获取代理后面真正的Model
     */
    getModel: function(argument) {
        return this.model.model;
    }
};
/*var _allEventNames = ("blur focus focusin focusout load resize" +
    "scroll unload click dblclick mousedown mouseup mousemove" +
    "mouseover mouseout mouseenter mouseleave change select" +
    "submit keydown keypress keyup error contextmenu").split(" ");
$.E(_allEventNames, function(eventName) {
    __ViewModelProto__[eventName] = function(fun) {
        return fun ? this.on(eventName, fun) : this.trigger(eventName);
    }
})*/

/*
 * 为ViewModel拓展proxymodel代理类的功能
 */

$.E(["set", "get"], function(handleName) {
    var handle = __ProxyModelProto__[handleName];
    __ViewModelProto__[handleName] = function() {
        var _current_handle_vms = _jSouperBase["current_" + handleName + "_vms"];
        var self = this;
        _current_handle_vms.push(self);
        var model = self.model;
        var result = handle.apply(model, arguments);
        _current_handle_vms.pop();
        return result;
    }
});
$.E(["shelter", "init" /*, "getSmart"*/ ], function(handleName) {
    var handle = __ProxyModelProto__[handleName];
    __ViewModelProto__[handleName] = function() {
        var self = this;
        var model = self.model;
        return handle.apply(model, arguments);
    }
});
$.E(["filter", "push", "pop", "popItem", "unshift", "shift"], function(handleName) {
    var handle = __ProxyModelProto__[handleName];
    __ViewModelProto__[handleName] = function(key) {
        var self = this;
        var model = self.model;
        if (arguments.length <= 1) {
            key = ""
        }
        var arr = model.get(key);
        if (!$.isA(arr)) {
            //不是数组的话直接覆盖
            model.set(key, arr ? $.s(arr) : []);
        }
        return handle.apply(model, arguments);
    }
});

//庞大数据执行SET渲染，为了避免卡死而妥协的渐进式set方案
__ViewModelProto__.asyncArraySet = function(key, arr) {
    var vm = this;
    var base_time = 1000 / 30;
    if (!(arr && arr.length > 1)) {
        return vm.set(key, arr);
    }
    var ArraySetTime = vm.__ArraySetTime__ || (vm.__ArraySetTime__ = {})
    var _array_set_info = ArraySetTime[key];
    var _loop = _array_set_info && (_array_set_info = _array_set_info.loop);
    if (!_loop) {
        var _start_data = +new Date;
        vm.set(key, arr.slice(0, 1));
        var _end_data = +new Date;
        var _interval_time = _end_data - _start_data;
        //计算出每base_time毫米可以添加几个项以保证渲染速度
        _loop = Math.ceil(base_time / _interval_time);
        _array_set_info = ArraySetTime[key] = {
            loop: _loop,
            ti: null
        };
    }
    clearTimeout(_array_set_info.ti);
    var i = 0;
    _array_set_info.ti = setTimeout(function _set() {
        i += _loop;
        console.log(key, i);
        vm.set(key, arr.slice(0, i));
        if (i < arr.length) {
            setTimeout(_set, base_time)
        }
    }, base_time)
    return _array_set_info;
};

__ViewModelProto__.concat = function(key, items) {
    var self = this;
    var model = self.model;
    if (arguments.length <= 1) {
        key = "";
        items = key;
    }
    var arr = model.get(key);
    if (!$.isA(arr)) {
        arr = arr ? $.s(arr) : [];
        model.set(key, []);
    }
    if (!$.isA(items)) {
        items = items ? $.s(items) : [];
    }
    arr.push.apply(arr, items);
    return model.set(key, arr);
};

//VM层面的数据key监听器
__ViewModelProto__.on = function(key, handle) {
    var viewModel = this;
    if ($.isA(key)) {
        $.e(key, function(_key) {
            viewModel.on(_key, handle)
        });
        return
    }
    var keyTrigger = {
        handleId: $.uid(),
        key: key,
        type: "attributesTrigger",
        event: function(NodeList, model, /* eventTrigger,*/ isAttr /*, viewModel_ID*/ ) { /*NodeList, model, eventTrigger, self._isAttr, self._id*/
            handle(model.get(key), key, model);
        }
    };
    var triggerTable = viewModel._triggers._;
    var triggerContainer = triggerTable[key];
    var smartTriggers = viewModel.model._smartTriggers
    if (!triggerContainer) {
        // ViewModel._buildSmart(viewModel, key);//.rebuild();
        triggerContainer = triggerTable[key] = [];
        $.p(viewModel._triggers, key);
        var smartkeyTrigger = ViewModel._buildSmart(viewModel, key, handle)
        $.p(smartTriggers, smartTriggers._[key] = smartkeyTrigger);
    } else {
        smartkeyTrigger = smartTriggers._[key];
    }
    $.us(triggerContainer, keyTrigger);
    //强制更新
    smartkeyTrigger.rebuild($TRUE);

    viewModel.model.rebuildTree();
};