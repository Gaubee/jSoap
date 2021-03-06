/*
 * parse rule
 * 底层解析器，类Lisp语法规则，易于解析
 */

// DoubleQuotedString = /"(?:\.|(\\\")|[^\""\n])*"/g, //双引号字符串
// SingleQuotedString = /'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
var QuotedString = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g, //引号字符串
    // TemplateString = /`([\s\S]*?)`/g, //模板字符串
    ScriptNodeString = /<script[^>]*>([\s\S]*?)<\/script>/gi,
    StyleNodeString = /<style[^>]*>([\s\S]*?)<\/style>/gi;
// XmpNodeString = /<xmp[^>]*>([\s\S]*?)<\/xmp>/gi,

//用于抽离字符串的中特定的字符来避免解析，完成后可以回退这些字符串
var _string_placeholder = {
        save: function(regExp_placeholder, str) {
            var map = this.maps[regExp_placeholder] = {
                ph: _placeholder("_v"),
                strs: []
            };
            var strings = map.strs;
            var placeholder = map.ph;
            str = str.replace(regExp_placeholder, function(matchStr) {
                $.p(strings, matchStr);
                return placeholder;
            });
            return str;
        },
        maps: {},
        release: function(regExp_placeholder, str) {
            if (this.maps.hasOwnProperty(regExp_placeholder)) {
                var map = this.maps[regExp_placeholder];
                var strings = map.strs;
                var placeholder = map.ph;
                str = str.replace(RegExp(placeholder, "g"), function(ph) {
                    return strings.shift();
                })
            };
            return str;
        }
    },
    // _head = /\{([\s\S]*?)\(/g,
    // _footer = /\)\}/g, ///\)[\s]*\}/g,
    _matchRule = /\{([\s\S]*?)\(([\s\S]*?)\)\}/g, ///\{[\s\S]*?\([\s\S]*?\)[\s]*\}/,
    _handle_type_argument_name = _placeholder("handle-"),
    /*
     * 将模板语法解析成数组节点
     */
    parseRule = function(str) {
        var _handle_type_tagName;
        var expression_ph = _placeholder("json");
        var expression_strs = [];

        //备份字符串
        // str = _string_placeholder.save(QuotedString, str);
        var _str_ph = _placeholder("_s");
        var _release_ph_reg = new RegExp(_str_ph + "[\\d]+" + _str_ph, "g");
        var _release_ph_foo = function(str) {
            return str.replace(_release_ph_reg, function(matchPh) {
                return _str_maps[matchPh];
            })
        }
        var _str_maps = {};
        var index = 0;
        str = str.replace(QuotedString, function(matchStr) {
            index += 1;
            var key = _str_ph + index + _str_ph;
            _str_maps[key] = matchStr;
            return key;
        });

        var EscapeString = /\\(\W)/g;
        //备份转义字符
        str = _string_placeholder.save(EscapeString, str);

        var parseStr = str
            //模拟HTML转义
            // .replace(/&gt;/g, ">")
            // .replace(/&lt;/g, "<")
            // .replace(/&amp;/g, "&")
            // .replace(/&quot;/g, '"')
            // .replace(/&apos;/g, "'")
            .replace(_matchRule, function(match, handleName, expression) {
                handleName = _release_ph_foo($.trim(handleName));
                if (!V.handles[handleName]) {
                    throw "Can't find handle:" + handleName;
                }
                $.p(expression_strs, {
                    nodeType: 1,
                    handleName: handleName,
                    expression: _release_ph_foo(expression)
                });
                return expression_ph;
            });

        //还原转义字符
        parseStr = _string_placeholder.release(EscapeString, parseStr);
        //还原字符串
        // parseStr = _string_placeholder.release(QuotedString, parseStr);
        parseStr = _release_ph_foo(parseStr);

        //模拟js字符串的转义
        parseStr = parseStr.replace(EscapeString, "$1");

        //带模板语法的，转化成Array
        if (expression_strs.length) {

            parseStr = parseStr.split(expression_ph);
            for (var i = 1; i < parseStr.length; i += 2) {
                parseStr.splice(i, 0, expression_strs.shift());
            }
            if (!$.trim(parseStr[0])) {
                parseStr.shift();
            };
        }
        return parseStr;
    },
    /*
     * expores function
     */
    _ignoreNameSpaceTag = "|area|br|col|embed|hr|img|input|link|meta|param|" + _svgTagStr.replace(/\s/g, "|") + "|",
    V = {
        prefix: "bind-",
        namespace: "fix:",
        stringifyStr: stringifyStr,
        // _currentParsers: [],
        _nodeTree: function(htmlStr) {
            var _shadowBody = fragment( /*"body"*/ ); //$.D.cl(shadowBody);

            /*
             * 将所有HTML标签加上命名空间，不让浏览器解析默认语言
             */
            var start_ns = "<" + V.namespace;
            var end_ns = "</" + V.namespace;
            //备份字符串与style、script、XMP标签

            htmlStr = _string_placeholder.save(QuotedString, htmlStr);
            htmlStr = _string_placeholder.save(ScriptNodeString, htmlStr);
            // htmlStr = _string_placeholder.save(TemplateString, htmlStr);
            htmlStr = _string_placeholder.save(StyleNodeString, htmlStr);

            //为无命名空间的标签加上前缀
            htmlStr = htmlStr.replace(/<[\/]{0,1}([\w:]+)/g, function(html, tag) {
                //排除：带命名空间、独立标签、特殊节点、SVG节点
                if (tag.indexOf(":") === -1 && _ignoreNameSpaceTag.indexOf("|" + tag.toLowerCase() + "|") === -1) {
                    html = (html.charAt(1) === "/" ? end_ns : start_ns) + tag;
                }
                return html;
            });

            //顶层模板语言解析到底层模板语言
            htmlStr = parse(htmlStr);

            //回滚字符串与style、script、XMP标签
            htmlStr = _string_placeholder.release(StyleNodeString, htmlStr);
            // htmlStr = _string_placeholder.release(TemplateString, htmlStr);
            htmlStr = _string_placeholder.release(ScriptNodeString, htmlStr);
            htmlStr = _string_placeholder.release(QuotedString, htmlStr);

            //使用浏览器默认解析力解析标签树，保证HTML的松语意
            _shadowBody.innerHTML = htmlStr;

            //抽取代码模板
            V._scansCustomTags(_shadowBody);

            //递归过滤
            //在ElementHandle(_shadowBody)前扫描，因为在ElementHandle会将模板语法过滤掉
            //到时候innerHTML就取不到完整的模板语法了，只留下DOM结构的残骸
            // if(htmlStr.indexOf("selectHidden")>-1){alert(htmlStr);alert(_shadowBody.innerHTML)}
            V._scansView(_shadowBody);

            //编译代码模板
            V._buildCustomTags(_shadowBody);

            return new ElementHandle(_shadowBody);
        },
        _scansView: function(node, vmName) {
            node || (node = doc);
            //想解析子模块
            var xmps = $.s(node.getElementsByTagName("xmp"));
            Array.prototype.push.apply(xmps, $.s(node.getElementsByTagName(V.namespace + "xmp")));
            $.E(xmps, function(tplNode) {
                var type = tplNode.getAttribute("type");
                var name = tplNode.getAttribute("name");

                if (name) {
                    if (type === "template") {
                        var _if = tplNode.getAttribute("if");
                        if (_if) {
                            try {
                                _if = !eval(_if);
                            } catch (e) {
                                debugger
                            }
                        }
                        if (!_if) {
                            V.modules[name] = jSouper.parseStr(tplNode.innerHTML, name);
                            $.D.rm(tplNode);
                        }
                    }
                }
            });

            return node;
        },
        _scansVMInit: function(node, vmName) {
            node || (node = doc);

            $.e(node.getElementsByTagName("script"), function(scriptNode) {
                var type = scriptNode.getAttribute("type");
                var name = scriptNode.getAttribute("name");
                if (name && type === "text/template") {
                    V.modules[name] = jSouper.parseStr(scriptNode.text, name);
                    $.D.rm(scriptNode);
                } else if (type === "text/vm") {
                    if (!name && vmName) {
                        //如果是最顶层的匿名script节点，则默认为当前解析中的View的initVM函数
                        if (!scriptNode.parentNode.parentNode.parentNode) { //null=>document-fragment=>wrap-div=>current-scriptNode
                            name = vmName;
                        }
                    }
                    if (name) {
                        var scriptText = $.trim(scriptNode.text);
                        if (scriptText) {
                            try {
                                V.modulesInit[name] = Function("return " + scriptText)();
                                $.D.rm(scriptNode);
                            } catch (e) {
                                console.error("VM-scripts build error:", e);
                            }
                        }
                    }
                } else if (type === "text/tag/vm") {
                    if (!name) {
                        console.error("Custom tag VM-scripts must declare the name tags");
                    } else {
                        var scriptText = $.trim(scriptNode.text);
                        if (scriptText) {
                            try {
                                //不带编译功能
                                V.customTagsInit[name.toLowerCase()] = Function("return " + scriptText)();;
                                $.D.rm(scriptNode);
                            } catch (e) {
                                console.error("Custom tag VM-scripts build error:", e);
                            }
                        }
                    }
                } else if (type === "text/tag/vm/before") {
                    if (!name) {
                        console.error("Custom tag VM-scripts must declare the name tags");
                    } else {
                        var scriptText = $.trim(scriptNode.text);
                        if (scriptText) {
                            try {
                                //不带编译功能
                                V.customTagsInitBefore[name.toLowerCase()] = Function("return " + scriptText)();;
                                $.D.rm(scriptNode);
                            } catch (e) {
                                console.error("Custom tag VM-scripts build error:", e);
                            }
                        }
                    }
                } else if (type === "text/tag") { //代码模板
                    //临时编译临时使用
                    //而且仅仅只能在页面解析就需要定义完整，因为是代码模板
                    if (name) {
                        V.customTags[name.toLowerCase()] = scriptNode.text;
                    } else {
                        console.error("the name of custom tag could not empty!");
                    }
                }
            });
            return node;
        },
        _scansCustomTags: function(node) {
            node || (node = doc);
            //想解析子模块
            var xmps = $.s(node.getElementsByTagName("xmp"));
            Array.prototype.push.apply(xmps, $.s(node.getElementsByTagName(V.namespace + "xmp")));
            $.E(xmps, function(tplNode) {
                var type = tplNode.getAttribute("type");
                if (type !== "tag") {
                    return
                }
                var name = tplNode.getAttribute("name");
                if (name) {
                    if (type === "tag") {
                        var _if = tplNode.getAttribute("if");
                        if (_if) {
                            try {
                                _if = !eval(_if);
                            } catch (e) {
                                debugger
                            }
                        }
                        if (!_if) {
                            V.customTags[name.toLowerCase()] = $.trim(tplNode.innerHTML);
                            $.D.rm(tplNode);
                        }
                    }
                } else {
                    console.error("the name of custom tag could not empty!");
                }
            });

            $.e(node.getElementsByTagName("script"), function(scriptNode) {
                var type = scriptNode.getAttribute("type");
                var name = scriptNode.getAttribute("name");
                if (type !== "text/tag") { //代码模板
                    return
                }
                //临时编译临时使用
                //而且仅仅只能在页面解析就需要定义完整，因为是代码模板
                if (name) {
                    V.customTags[name.toLowerCase()] = $.trim(scriptNode.text);
                } else {
                    console.error("the name of custom tag could not empty!");
                }
            });
            return node;
        },
        _buildCustomTags: function(node) {
            node || (node = doc);
            _traversal(node, function(currentNode, index, parentNode) {
                if (currentNode.nodeType === 1) {
                    var tagName = currentNode.tagName.toLowerCase();
                    if (tagName.indexOf(V.namespace) === 0) {
                        tagName = tagName.substr(V.namespace.length)
                    }
                    if (V._isCustonTagNodeLock[tagName] === $TRUE) {
                        return
                    }
                    if (V.customTags[tagName]) {
                        var before_handle = V.customTagsInitBefore[tagName];
                        if (before_handle) {
                            if (!before_handle.call(currentNode)) {
                                return
                            }
                        }
                        var node_id = $.uid();
                        var nodeInfo = {
                            tagName: tagName,
                            innerHTML: currentNode.innerHTML,
                            __node__: currentNode
                        };
                        $.E($.s(currentNode.attributes), function(attr) {
                            //fix IE
                            var name = attr.name;
                            var name_bak = name;
                            var value = currentNode.getAttribute(name);
                            //TODO attr.specified ??
                            if (value === $NULL || value === "") { //fix IE6-8 is dif
                                name = _isIE && IEfix[name];
                                value = name && currentNode.getAttribute(name);
                            }
                            //boolean\tabIndex should be save
                            //style shoule be handle alone
                            if (name && value !== $NULL && value !== "" /*&& name !== "style"*/ ) {
                                // console.log(name,value);
                                //be an Element, attribute's name may be diffrend;
                                name = (_isIE ? IEfix[name] : _unkonwnElementFix[name]) || name;
                                nodeInfo[name_bak] = value;
                            }
                        });

                        V._customTagNode[node_id] = nodeInfo;
                        $.D.re(parentNode, $.D.cs(parse("{{custom_tag '" + tagName + "','" + node_id + "'}}")), currentNode);
                    }
                }
            });
        },
        parse: function(htmlStr, name) {
            // $.p(V._currentParsers, name);
            var result = View(V._nodeTree(htmlStr), name);
            // V._currentParsers.pop();
            return result;
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
        modulesInit: {},
        // modulesInitBefore: {},
        customTags: {},
        customTagsInit: {},
        customTagsInitBefore: {},
        _customTagNode: {},
        _isCustonTagNodeLock: {},
        attrModules: {},
        eachModules: {},
        withModules: {},
        customTagModules: {},
        _instances: {},

        // Proto: DynamicComputed /*Proto*/ ,
        Model: Model,
        View: View,
        ViewModel: ViewModel
    };


var _noop_expression_foo = function() {
    return []
};
//存储表达式字符，达成复用
var Expression = {
    //存储表达式解析结果
    _: {},
    set: function(expression, build_str, varsSet) {
        var foo = _noop_expression_foo;
        try {
            foo = Function(build_str)()
        } catch (e) {
            debugger
            console.group('expression error:');
            console.error(expression);
            console.error(e.message);
            console.groupEnd('expression error:')
        }
        return (Expression._[expression] = {
            foo: foo,
            keys: varsSet
        });
    },
    get: function(expression) {
        expression = $.trim(expression);
        return Expression._[expression] || _build_expression(expression);
    }
};
//JS对象的获取
//\[\]hash取值现在已经在model.get中支持
var _obj_get_reg = /([^\^\~\+\-\*\/\%\=\&\|\?\:\s\(\)\{\}\[\]\:\;\'\"\,\<\>\@\#\!]+)/g;
// var _obj_get_reg = /([a-zA-Z_?.$][\w?.$]*)/g;
var _const_obj = {
        "undefined": $TRUE,
        "Infinity": $TRUE,
        "NaN": $TRUE,
        "true": $TRUE,
        "false": $TRUE,
        "null": $TRUE,
        "new": $TRUE,
        "window": $TRUE
            /*,
            "this": $TRUE*/
    }
    //编译模板中的表达式
var _build_expression = window._build_expression = function(expression) {
    //不支持直接Object和Array取值：{a:"a"}或者[1,2]
    //目前暂时支持hash取值，等Path对象完善后才能优化触发hash取值
    //TODO:引入heightline的解析方式
    var _build_str;
    var string_sets = [];
    var template_sets = [];
    var varsSet = [];
    var varsMap = {};
    expression = $.trim(expression);

    // //首先将模板字符串进行特殊解析
    // var result = expression.replace(TemplateString, function(matchTpl) {
    //     if (!varsMap.hasOwnProperty(matchTpl)) {
    //         varsMap[matchTpl] = $TRUE;
    //         $.p(varsSet, matchTpl);
    //     }
    //     return "vm.getSmart("+stringifyStr(matchTpl)+")";
    // });
    //备份字符串，避免解析
    var result = expression.replace(QuotedString, function(matchStr) {
        $.p(string_sets, matchStr);
        return "@#@";
    });
    // //备份模板字符串，替换成正常对象
    // var result = result.replace(TemplateString, function(matchTpl, tpl_content) {
    //     $.p(template_sets, tpl_content);
    //     return "@2";
    // });
    //解析表达式中的对象
    result = result.replace(_obj_get_reg, function(matchVar) {
        //过滤数值、常量
        if (!_const_obj[matchVar] && matchVar.indexOf("window.") && matchVar != (+matchVar) && matchVar.charAt(0) !== "." /*说明是a[b].c中的.c情况，这里不再处理，让try去捕捉数据，意味着自定义数据类型无法执行*/ ) {
            if (!varsMap.hasOwnProperty(matchVar)) {
                varsMap[matchVar] = $TRUE;
                $.p(varsSet, matchVar);
            }
            return "vm.get(" + stringifyStr(matchVar) + ")";
        }
        return matchVar;
    });

    // //回滚备份的模板
    // result = result.replace(/\@2/g, function(tpl_ph) {
    //     return template_sets.shift();
    // });
    //回滚备份的字符串
    result = result.replace(/\@\#\@/g, function() {
        return string_sets.shift();
    });
    // console.log(result);
    _build_str = "return function(vm){try{return [" + result + "]}catch(e){/*debugger;var c=window.console;if(c){c.error(e);}*/return [];}}"
        // console.dir(_build_str);
    return Expression.set(expression, _build_str, varsSet);
};

// var echarMap = {
//     '"': '"',
//     "'": "'",
//     "(": ")",
//     "[": "]",
//     "{": "}",
//     ")": "(",
//     "]": "[",
//     "}": "{"
// }
// //将表达式风格成数组
// var _cut_expression = function(expression) {
//     var result = [];
//     var index = 0;
//     var first_expression = "";
//     var echarts = [];
//     var i = 0;
//     for (var i = 0, len = expression.length, charItem, n_charItem, l_charItem; i < len; i += 1) {
//         charItem = expression.charAt(i);
//         n_charItem = echarMap[charItem];
//         l_charItem = $.lI(echarts);
//         if ((l_charItem === '"' || l_charItem === "'") && n_charItem !== l_charItem) {
//             continue;
//         }
//         if (n_charItem) {
//             if (l_charItem === n_charItem) {
//                 echarts.pop();
//             } else {
//                 $.p(echarts, charItem);
//             }
//         }
//         console.log(echarts, charItem)
//         if (!echarts.length && charItem === ",") {
//             $.p(result, expression.substring(index, i));
//             //跳过","
//             index = i + 1;
//         }
//     };
//     $.p(result, expression.substr(index));
//     return result;
// }