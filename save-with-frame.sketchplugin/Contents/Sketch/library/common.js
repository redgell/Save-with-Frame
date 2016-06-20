@import 'library/functions.js'

var com = {}
com.redgell = {
	devices: {
		'iPhone6': [
			'iPhone6/gold.png',
			'iPhone6/rose_gold.png',
			'iPhone6/silver.png',
			'iPhone6/space_gray.png'
		],
		'moto360': [
			'moto360/mens_black.png',
			'moto360/mens_gold.png',
			'moto360/womens_silver.png',
			'moto360/womens_gold.png'
		],
		'qfounder': [
			'qfounder/gunmetal.png'
		],
		'nexus4': [
			'nexus/Nexus4.png'
		],
		'nexus5x': [
			'nexus/Nexus5x.png'
		],
		'nexus6p': [
			'nexus/Nexus6p.png'
		]
	},
	baseDir: '',
	width: '',
	height: '',
	offset_y: 0,
	offset_x: 0,

	export: function(deviceType, context, deviceStyle) {
		//log(this.pluginPath)
		this.context = context;
		this.selection = context.selection;
		this.document = context.document;
		this.baseDir = this.getDirFromPrompt()
		this.deviceType = deviceType;
		this.deviceStyle = deviceStyle

		if (this.baseDir == null) {
            this.alert("Not saving any assets");
            return;
        }

        // If nothing is selected tell the user so
        if (this.selection.count() == 0) {
            this.document.showMessage('Please select one or more layers to export.')
            return;
        }

        var device = this.loadDeviceFrame();

        for (var i = 0; i < this.selection.count(); i++) {
            var layer = this.selection[i];
            var artboard = layer.parentArtboard() ? layer.parentArtboard() : this.document.currentPage();

            var board = this.processArtboard(device, layer);
            this.saveFramedImages(board);
            this.deleteFramedImages(board);

            //Restore selection


        }


	},
	getDirFromPrompt: function() {
        var panel = [NSOpenPanel openPanel];
        [panel setMessage:"Where do you want to place your assets?"];
        [panel setCanChooseDirectories: true];
        [panel setCanChooseFiles: false];
        [panel setCanCreateDirectories: true];
        var defaultDir = com.redgell.document.fileURL().URLByDeletingLastPathComponent();
        [panel setDirectoryURL:defaultDir];


        if ([panel runModal] == NSOKButton) {
            var message = [panel filename];
            return message;
        }

	},
	loadDeviceFrame: function() {
		var folders = helpers.readPluginPath()

		var fileName = folders.sketchPluginsPath + folders.pluginFolder + '/' + this.devices[this.deviceType][this.deviceStyle]
  		var image = [[NSImage alloc] initWithContentsOfFile:fileName]
  		this.width = [image size].width;
  		this.height = [image size].height;

  		return image;

	},
	processArtboard: function(device, layer) {
		var board = MSArtboardGroup.alloc().init();
		var pos = this.document.documentData().currentPage().originForNewArtboard();
		board.rect = NSMakeRect(pos.x, pos.y, this.width, this.height);

		var rectShape = MSRectangleShape.alloc().init();
		rectShape.frame = MSRect.rectWithRect(NSMakeRect(0, 0, this.width, this.height));

		var deviceShape=MSShapeGroup.shapeWithPath(rectShape);
		//var fill = deviceShape.style().fills().addNewStylePart();
		var fill = deviceShape.style().addStylePartOfType(0);
		fill.setFillType(4);
		fill.setPatternFillType(1);
		fill.setPatternImage(device);

		board.name = layer.name()+'_framed';

		var artboard = this.makeSliceAndResizeWithFactor(layer, this.scale)

		board.addLayers([artboard, deviceShape]);
		this.document.documentData().currentPage().addLayers([board]);
		return board;

	},
	makeSliceAndResizeWithFactor: function(layer, scale) {
    var rect = [MSSliceTrimming trimmedRectForSlice:layer],
        slice
    ;

    slice = [MSExportRequest requestWithRect:rect scale:scale];

    var path = NSTemporaryDirectory() + layer.name() + ".png";;
    [(com.redgell.document) saveArtboardOrSlice: slice toFile: path];

    var image = [[NSImage alloc] initWithContentsOfFile:path];
    var rectShape = MSRectangleShape.alloc().init();
    // 750, 990
    var y = ((this.height - [image size].height)/2) + this.offset_y;
    var x = ((this.width - [image size].width)/2) + this.offset_x;

    rectShape.frame = MSRect.rectWithRect(NSMakeRect(x, y, [image size].width, [image size].height));

    var artboardShape=MSShapeGroup.shapeWithPath(rectShape);
    //var fill = artboardShape.style().fills().addNewStylePart();
		var fill = artboardShape.style().addStylePartOfType(0);
    fill.setFillType(4);
    fill.setPatternFillType(1);
    fill.setPatternImage(image)

    return artboardShape;
	},
	saveFramedImages: function(board) {
		[(com.redgell.document) saveArtboardOrSlice:board toFile: this.baseDir + '/' + board.name() + '.png'];
	},
	deleteFramedImages: function(board) {
		this.document.currentPage().removeLayer(board);
	}
}
