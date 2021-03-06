var _testDIV = fragment(), //$.D.cl(shadowDIV),
    _tagNameIs = function(node, tagName) {
        var tagName = tagName.toUpperCase();
        var node_tagName = node.tagName;
        var namespace = V.namespace.toUpperCase();
        if (node_tagName === tagName) {
            return $TRUE;
        } else if (_ignoreNameSpaceTag.indexOf("|" + node_tagName + "|") === -1) {
            //如果属于要加命名空间的节点，过滤掉命名空间后再做判断
            return node_tagName.indexOf(namespace) === 0 && node_tagName.substr(namespace.length) === tagName
        } else {
            return $FALSE;
        }
    },
    _tagNameIsArr = function(node, tagNames) {
        var result = $FALSE;
        $.E(tagNames, function(tagName) {
            if (!result) {
                result = _tagNameIs(node, tagName)
            }
        });
        return result;
    },
    _attrDataFormat = function(value) {
        var type = $.st(value || "", ":");
        switch (type) {
            case "$Boolean":
                value = !!_booleanFalseRegExp(_split_laveStr);
                break;
            case "$String":
                value = _split_laveStr;
                break;
            case "$JSON":
                try {
                    value = JSON.parse(_split_laveStr);
                } catch (e) {
                    value = null;
                }
                // case "Object"://JSON???....

        }
        return value
    },
    _getAttrOuter = function(attrVM) {
        // var NodeList = attrVM.NodeList;
        var topNode = attrVM.topNode();
        // var result;
        // //单个结果节点
        // var single = $TRUE;
        // //属性VM不支持Element节点，可直接变量出textNode
        // $.E(attrVM.handleNodeTree.childNodes, function(handle) {
        //     if (handle.type === "text") {
        //         var nodeHandle = NodeList[handle.id];
        //         var currentNode = nodeHandle.currentNode;
        //         if (currentNode.parentNode === topNode) {
        //             var data = nodeHandle._data || currentNode.data;
        //         }
        //         single ? (result = data) : (result += data);
        //         single = $FALSE;
        //     }
        // });

        // return result
        if (topNode.innerText !== $UNDEFINED) {
            _getAttrOuter = function(attrVM) {
                return _attrDataFormat(attrVM.topNode().innerText);
            }
        } else {
            _getAttrOuter = function(attrVM) {
                return _attrDataFormat(attrVM.topNode().textContent);
            }
        }
        return _getAttrOuter(attrVM);
    };
// _getAttrOuter = Function("n", "n=n.topNode();n=n." + (("textContent" in _testDIV) ? "textContent" : "innerText") + "||'';console.log(n);return n;");

var _AttributeHandleEvent = {
    event: function(key, currentNode, attrVM) { //on开头的事件绑定，IE需要绑定Function类型，现代浏览器绑定String类型（_AttributeHandleEvent.com）
        var attrOuter = _getAttrOuter(attrVM);
        try {
            var attrOuterEvent = Function(attrOuter); //尝试编译String类型数据
        } catch (e) {
            attrOuterEvent = $.noop; //失败使用空函数替代
        }
        currentNode.setAttribute(key, attrOuterEvent);
    },
    style: function(key, currentNode, attrVM) {
        var attrOuter = _getAttrOuter(attrVM);
        // console.info("style:", attrOuter);
        currentNode.style.cssText = attrOuter;
    },
    com: function(key, currentNode, attrVM) {
        var attrOuter = _getAttrOuter(attrVM);
        if (currentNode.getAttribute(key) !== attrOuter) {
            try {
                currentNode.setAttribute(key, attrOuter)
            } catch (e) { //避免老IE对一些属性的赋值行为报错
            }
        }
    },
    dir: function(key, currentNode, attrVM) {
        var attrOuter = _getAttrOuter(attrVM);
        if (currentNode[key] !== attrOuter) {
            currentNode[key] = attrOuter;
        }
    },
    bool: function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        // console.log("BOOL:",attrOuter);
        if (attrOuter) {
            //readonly等属性是要用node.readOnly，大小写不同，所以用setAttribute比较合理
            currentNode.setAttribute(key, key);
        } else {
            //readonly等属性就算set false也是有用，应该直接remove
            currentNode.removeAttribute(key);
        }
    },
    dir_bool: function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        currentNode[key] = attrOuter;
    },
    // checked:self.bool,
    radio: function(key, currentNode, attrVM) { //radio checked
        var attrOuter = _getAttrOuter(attrVM);
        if (attrOuter === currentNode.value) {
            currentNode[key] = attrOuter;
        } else {
            currentNode[key] = $FALSE;
        }
    },
    withNS: function(key, currentNode, attrVM) {
        var ns = $.st(key, ":");
        key = _split_laveStr;
        var attrOuter = _getAttrOuter(attrVM);
        if (currentNode.getAttribute(key) !== attrOuter) {
            currentNode.setAttributeNS(_svgNS[ns] || null, key, attrOuter);
        }
    }
};
var __bool = _AttributeHandleEvent.checked = _AttributeHandleEvent.dir_bool;
if (_isIE) {
    var __radio = _AttributeHandleEvent.radio;
    _AttributeHandleEvent.radio = function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        if (attrOuter === currentNode.value) {
            currentNode.defaultChecked = attrOuter;
        } else {
            currentNode.defaultChecked = $FALSE;
        }
        // __radio(key, currentNode, attrVM);
        (this._attributeHandle = __radio)(key, currentNode, attrVM);
    }
    _AttributeHandleEvent.checked = function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        if (attrOuter) {
            currentNode.defaultChecked = attrOuter;
        } else {
            currentNode.defaultChecked = $FALSE;
        }
        // __bool(key, currentNode, attrVM);
        (this._attributeHandle = __bool)(key, currentNode, attrVM);
    }
}