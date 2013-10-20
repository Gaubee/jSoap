V.rt("layout", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		childNodes = handle.childNodes,
		templateHandle_id = childNodes[0].id,
		dataHandle_id = childNodes[1].id,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
			var key = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
				layoutViewInstance = AllLayoutViewInstance[id],
				inserNew;
			if (key /*!==$UNDEFINED*/ ) {
				if (!layoutViewInstance) {
					layoutViewInstance = AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data]().insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
					dataManager.get(key);
					var DM_session = DataManager.session;
					key  = DM_session.filterKey;
					dataManager = DM_session.topGetter;
					if (key) {
						dataManager.subset(layoutViewInstance, key);
					} else {
						dataManager.collect(layoutViewInstance);
					}
				} else {
					layoutViewInstance && layoutViewInstance.set(dataManager.get(key));
				}
			}
		}
	}
	return trigger;
});