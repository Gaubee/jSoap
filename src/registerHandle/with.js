var _with_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
    var handle = this,
        parentHandle = handle.parentNode,
        comment_endwith_id,
        AllLayoutViewInstance = V._instances[viewInstance_ID]._WVI,
        withViewInstance = AllLayoutViewInstance[handle.id];
    if (!withViewInstance) {
        return;
    }
    //get comment_endwith_id
    var commentEndEachPlaceholderElement = NodeList_of_ViewInstance[NodeList_of_ViewInstance[handle.eh_id].childNodes[0].id].currentNode;

    if (show_or_hidden) {
        if (!withViewInstance._canRemoveAble) { //can-insert-able
            withViewInstance.insert(commentEndEachPlaceholderElement)
        }
    } else {
        withViewInstance.remove();
    }
};
V.rh("#with", function(handle, index, parentHandle) {
    //The Nodes between #with and /with will be pulled out , and not to be rendered.
    //which will be combined into new View module.
    var _shadowBody = fragment(), //$.D.cl(shadowBody),
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
                //save end-handle-id to get comment-placeholder
                handle.eh_id = childHandle.id;
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
