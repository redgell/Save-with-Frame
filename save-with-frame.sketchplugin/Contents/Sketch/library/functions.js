var createSelectDialog = function(msg, items) {
	var selectedItemIndex = selectedItemIndex || 0

	var accessory = NSComboBox.alloc().initWithFrame(NSMakeRect(0,0,200,25))
	accessory.addItemsWithObjectValues(items)
	accessory.selectItemAtIndex(selectedItemIndex)

	var alert = NSAlert.alloc().init()
	alert.setMessageText(msg)
	alert.addButtonWithTitle('OK')
	alert.addButtonWithTitle('Cancel')
	alert.setAccessoryView(accessory)

	var responseCode = alert.runModal()
	var sel = accessory.indexOfSelectedItem()

	return [responseCode, sel]
}

var readPluginPath = function() {
    var sketchPluginsPath = com.redgell.context.scriptPath.replace(/Sketch([\w \/ -])*.sketchscript$/, "");
    
    return {
        sketchPluginsPath: sketchPluginsPath,
        pluginFolder: 'Resources'
    }
}

var helpers = {
	readPluginPath: readPluginPath,
	createSelectDialog: createSelectDialog
}