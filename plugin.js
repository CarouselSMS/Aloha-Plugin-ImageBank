/*
* Aloha ImageBank Plugin - Allow image manipulation in Aloha Editor
* 
* Copyright (C) 2010 by Nicolas Karageuzian - http://nka.me/
*	Copyright (C) 2010 by Benjamin Athur Lupton - http://www.balupton.com
* Licensed unter the terms of AGPL http://www.gnu.org/licenses/agpl-3.0.html
*
* do not require anymore IKS Loader
*/

// Attributes manipulation utilities
// Aloha team may want to factorize, it could be useful for other plugins
// Prototypes
String.prototype.toInteger = String.prototype.toInteger || function(){
	return parseInt(String(this).replace(/px$/,'')||0,10);
};
String.prototype.toFloat = String.prototype.toInteger || function(){
	return parseFloat(String(this).replace(/px$/,'')||0,10);
};
Number.prototype.toInteger = Number.prototype.toInteger || String.prototype.toInteger;
Number.prototype.toFloat = Number.prototype.toFloat || String.prototype.toFloat;

// jQuery
jQuery.fn.increase = jQuery.fn.increase || function(attr){
	var	obj = jQuery(this),
		value = obj.css(attr).toFloat(),
		newValue = Math.round((value||1)*1.2);
	if (value == newValue) { // when value is 2, won't increase
		newValue++;
	}
	// Apply
	obj.css(attr,newValue);
	// Chain
	return obj;
};
jQuery.fn.decrease = jQuery.fn.decrease || function(attr){
	var	obj = jQuery(this),
		value = obj.css(attr).toFloat(),
		newValue = Math.round((value||0)*0.8);
	// Apply
	if (value == newValue && newValue >0) { // when value is 2, won't increase
		newValue--;
	}
	obj.css(attr,newValue);
	// Chain
	return obj;
};



GENTICS.Aloha.ImageBank =new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.ImageBank");

GENTICS.Aloha.ImageBank.languages=["en","fr","de"];
GENTICS.Aloha.ImageBank.config = { 'img': { 'max_width': '50px',
		'max_height': '50px' }};
/*
 * Initalize plugin
 */
GENTICS.Aloha.ImageBank.init=function(){
	// get settings
    if (GENTICS.Aloha.ImageBank.settings.objectTypeFilter != undefined)
    	GENTICS.Aloha.ImageBank.objectTypeFilter = GENTICS.Aloha.ImageBank.settings.objectTypeFilter;	
    if (GENTICS.Aloha.ImageBank.settings.dropEventHandler != undefined)
    	GENTICS.Aloha.ImageBank.dropEventHandler = GENTICS.Aloha.ImageBank.settings.dropEventHandler;	

    var that=this;
	that.initImage();
	//that.bindInteractions();
	//that.subscribeEvents();
	stylePath = GENTICS_Aloha_base + '/plugins/com.gentics.aloha.plugins.ImageBank/style.css';
	jQuery('<link rel="stylesheet" />').attr('href', stylePath).appendTo('head');
/*
	if (!GENTICS.Aloha.DnDFile) {
		dndFilePath = GENTICS_Aloha_base + '/plugins/com.gentics.aloha.plugins.DragnDropFiles/plugin.js';
		jQuery('<script type="text/javascript" />').attr('src', dndFilePath).appendTo('head');
	}
 * 
 */
	
   }; // END INIT

GENTICS.Aloha.ImageBank.objectTypeFilter = [];

/**
 * Default behaviour for dropped image
 * car be overriden in settings
 */


// GENTICS.Aloha.ImageBank.PropsWindow =
GENTICS.Aloha.ImageBank.initImage = function() {
	var that = this;
	this.insertImgButton = new GENTICS.Aloha.ui.Button({
		'iconClass': 'GENTICS_button GENTICS_img_insert',
		'size' : 'small',
		'onclick' : function () { that.insertImg(); },
		'tooltip' : that.i18n('button.addimg.tooltip'),
		'toggle' : false
	});
	GENTICS.Aloha.FloatingMenu.addButton(
			'GENTICS.Aloha.continuoustext',
			this.insertImgButton,
			GENTICS.Aloha.i18n(GENTICS.Aloha, 'floatingmenu.tab.insert'),
			1
	);
	
// GENTICS.Aloha.FloatingMenu.createScope(this.getUID('img'),
// 'GENTICS.Aloha.continuoustext');
	GENTICS.Aloha.FloatingMenu.createScope(this.getUID('image'), 'global');
	
	var alignLeftButton = new GENTICS.Aloha.ui.Button({
        'iconClass': 'GENTICS_button GENTICS_img_align_left',
        'size': 'small',
        'onclick' : function() {
            var img = that.findImgMarkup();
            jQuery(img).css('float', 'left');
        },
        'tooltip': that.i18n('button.img.align.left.tooltip')
    });
	var alignRightButton = new GENTICS.Aloha.ui.Button({
        'iconClass': 'GENTICS_button GENTICS_img_align_right',
        'size': 'small',
        'onclick' : function() {
            var img = that.findImgMarkup();
            jQuery(img).css('float', 'right');
        },
        'tooltip': that.i18n('button.img.align.right.tooltip')
    });
    var alignNoneButton = new GENTICS.Aloha.ui.Button({
        'iconClass': 'GENTICS_button GENTICS_img_align_none',
        'size': 'small',
        'onclick' : function() {
	    	var img = that.findImgMarkup();
	        jQuery(img).css('float', '');
        },
        'tooltip': that.i18n('button.img.align.none.tooltip')
    });
    
    // add the src field for images
    var imgSrcLabel = new GENTICS.Aloha.ui.Button({
    	'label': that.i18n('field.img.src.label'),
    	'tooltip': that.i18n('field.img.src.tooltip'),
    	'size': 'small'
    });
    this.imgSrcField = new GENTICS.Aloha.ui.AttributeField({});
    this.imgSrcField.setObjectTypeFilter( this.objectTypeFilter );

    // add the title field for images
    var imgTitleLabel = new GENTICS.Aloha.ui.Button({
    	'label': that.i18n('field.img.title.label'),
    	'tooltip': that.i18n('field.img.title.tooltip'),
    	'size': 'small'
    });
    this.imgTitleField = new GENTICS.Aloha.ui.AttributeField();
    this.imgTitleField.setObjectTypeFilter();

    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		this.imgSrcField,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		alignRightButton,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		alignLeftButton,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		alignNoneButton,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		this.imgTitleField,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    
    var incPadding = new GENTICS.Aloha.ui.Button({
    	iconClass: 'GENTICS_button GENTICS_img_padding_increase',
    	size: 'small',
    	onclick: function() {
    	var image = that.findImgMarkup();
    	ImageBank = jQuery(image);
    	// Apply
    	ImageBank.increase('padding');
    	},
    	tooltip: this.i18n('padding.increase')
    	});
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		incPadding,
    		this.i18n('floatingmenu.tab.img'),
    		2
    );
   var decPadding = new GENTICS.Aloha.ui.Button({
    	iconClass: 'GENTICS_button GENTICS_img_padding_decrease',
    	size: 'small',
    	onclick: function() {
    	var image = that.findImgMarkup();
    	ImageBank = jQuery(image);
    	// Apply
    	ImageBank.decrease('padding');
    	},
    	tooltip: this.i18n('padding.decrease')
    	});
   GENTICS.Aloha.FloatingMenu.addButton(
   		this.getUID('image'),
   		decPadding,
   		this.i18n('floatingmenu.tab.img'),
   		2
   );
   var  incSize = new GENTICS.Aloha.ui.Button({
	   iconClass: 'GENTICS_button GENTICS_img_size_increase',
	   size: 'small',
	   onclick: function() {
	   var image = that.findImgMarkup();
	   ImageBank = jQuery(image);
	   // Apply
		   ImageBank.increase('height').increase('width');
	   },
	   tooltip: this.i18n('size.increase')
	   });
   GENTICS.Aloha.FloatingMenu.addButton(
	   		this.getUID('image'),
	   		incSize,
	   		this.i18n('floatingmenu.tab.img'),
	   		2
	   );
   var decSize = new GENTICS.Aloha.ui.Button({
	   iconClass: 'GENTICS_button GENTICS_img_size_decrease',
	   size: 'small',
	   onclick: function() {
	   var image = that.findImgMarkup();
	   ImageBank = jQuery(image);
	   // Apply
	   ImageBank.decrease('height').decrease('width');
	   },
	   tooltip: that.i18n('size.decrease')
	   });
   GENTICS.Aloha.FloatingMenu.addButton(
	   		this.getUID('image'),
	   		decSize,
	   		this.i18n('floatingmenu.tab.img'),
	   		2
	   );
};

GENTICS.Aloha.ImageBank.bindInteractions = function () {
    var that = this;

    // update image object when src changes
    this.imgSrcField.addListener('keyup', function(obj, event) {  	
    	that.srcChange();
    });

    this.imgSrcField.addListener('blur', function(obj, event) {
    	// TODO remove image or do something usefull if the user leaves the
    	// image without defining a valid image src.
    	img = jQuery(obj.getTargetObject());
    	if (img.attr('src') == "") {
    		img.remove();
    	} // image removal when src field is blank
    });
     
};

GENTICS.Aloha.ImageBank.subscribeEvents = function () {
	var that = this;
	//handles dropped files
	GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'UploadSuccess', function(event,data) {
		//TODO - Wait for DragAndDrop
		img = jQuery("#GENTICS_image_uploading_"+data.file.id);
		img.attr("src",data.result.data);
		img.attr("id",'');		
	});
	GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'dropFileInEditable', function(event,data) {
		//console.log(data.file);
		if (data.file.type.match(/image\//)) {			
			var reader = new FileReader();
			reader.config = that.getEditableConfig(data.editable);
			reader.attachedData = data;
			reader.onloadend = function(readEvent) {
				id = "GENTICS_image_uploading_" + data.ul_id;
				img = jQuery('<img id="'+id+'" style="" title="" src=""></img>');
				//img.attr('src', readEvent.target.result);
				img.click( GENTICS.Aloha.ImageBank.clickImage );
				//GENTICS.Aloha.Selection.changeMarkupOnSelection(img);
				//this.attachedData.display.append(img);
				img.attr('src', readEvent.target.result);
				//this.attachedData.display.replaceWith(img);
				GENTICS.Utils.Dom.insertIntoDOM(img,reader.attachedData.range,  jQuery(GENTICS.Aloha.activeEditable.obj));
				//this.attachedData.display.removeClass('GENTICS_default_file_icon');
				//console.log(this.attachedData.display);
			};
			reader.readAsDataURL(data.file);
		}
	});
    // add the event handler for selection change
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'selectionChanged', function(event, rangeObject) {
        // console.log('selectionChanged');
    	var foundMarkup = that.findImgMarkup( rangeObject );
    	var config = that.getEditableConfig(GENTICS.Aloha.activeEditable.obj);
        if ( config.img ) {
        	that.insertImgButton.show();
        } else {
        	that.insertImgButton.hide();
        	// TODO this should not be necessary here!
        	GENTICS.Aloha.FloatingMenu.doLayout();
            // leave if img is not allowed
            return;
        }
        if ( foundMarkup ) {
          // console.log('image found');
          setTimeout(function () {
        	// img found
        	that.insertImgButton.hide();
        	GENTICS.Aloha.FloatingMenu.setScope(that.getUID('image'));
            that.imgSrcField.setTargetObject(foundMarkup, 'src');
            that.imgTitleField.setTargetObject(foundMarkup, 'title');
            that.imgSrcField.focus();
            GENTICS.Aloha.FloatingMenu.userActivatedTab = that.i18n('floatingmenu.tab.img');
          }, 500);
        } else {
          // console.log('image not found');
        	that.imgSrcField.setTargetObject(null);
        }
    	// TODO this should not be necessary here!
    	GENTICS.Aloha.FloatingMenu.doLayout();
    });
    // add to all editables the image click
    for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {

	    // add a click (=select) event to all image.
	    GENTICS.Aloha.editables[i].obj.find('img').each( function( i ) {
	        // select the image when clicked
	        jQuery(this).click( GENTICS.Aloha.ImageBank.clickImage );
	    });
    }
};

GENTICS.Aloha.ImageBank.clickImage = function ( e ) { 
  // console.log('Click image event fired');
  // select the image
  // HELP: can't find a way...
  var thisimg = jQuery(this);
  var imgRange = GENTICS.Aloha.Selection.getRangeObject();
  GENTICS.Aloha.ImageBank.activeImage = thisimg;

  var offset = GENTICS.Utils.Dom.getIndexInParent(thisimg.get(0));

  try {
    imgRange.startContainer = imgRange.endContainer = thisimg.parent()[0];
    imgRange.startOffset = offset;
    imgRange.endOffset = offset+1;
    imgRange.select();
  } catch(err) {
    var startTag = thisimg.parent()[0];
    imgRange = new GENTICS.Utils.RangeObject({
      startContainer: startTag,
      endContainer: startTag,
      startOffset: offset,
      endOffset: offset+1
    });
    imgRange.select();
  }

  // display facebox if not displayed yet
  var $facebox = $('#facebox');
  if (!$facebox.is(':visible')) {
    setTimeout(function () {
      jQuery.facebox($('#image_bank_aloha').html());
      
      var $shadow = $('#GENTICS_floatingmenu_shadow');
      var offset = $shadow.offset();
      $facebox.css({
        top: offset.left + $shadow.width(),
        left: offset.top,
        'z-index': 30003
      });
      
    }, 500);
  }

};



GENTICS.Aloha.ImageBank.findImgMarkup = function ( range ) {
	if ( typeof range == 'undefined' ) {
        var range = GENTICS.Aloha.Selection.getRangeObject();   
    }
	try {
		if (range.startContainer)
			if (range.startContainer.childNodes)
				if (range.startOffset)
					if (range.startContainer.childNodes[range.startOffset])
	    if (range.startContainer.childNodes[range.startOffset].nodeName.toLowerCase() == 'img') {
			// console.log(range);
			result = range.startContainer.childNodes[range.startOffset];
			if (! result.css) result.css = "";
			if (! result.title) result.title = "";
			if (! result.src) result.src = "";
			return result;
		}
	} catch (e) {
		GENTICS.Aloha.Log.debug(e,"Error finding img markup.");
	}
    return null;
    
};

GENTICS.Aloha.ImageBank.apply = function(src) {
  var image = jQuery('<img>').attr('src', src);
  GENTICS.Utils.Dom.insertIntoDOM(image, this.range, this.limit);
  jQuery(document).trigger('close.facebox');
}

GENTICS.Aloha.ImageBank.insertImg = function() {
  var range = GENTICS.Aloha.Selection.getRangeObject();
  
  this.limit = jQuery(GENTICS.Aloha.activeEditable.obj);
  this.range = range;

  jQuery.facebox($('#image_bank_aloha').html());
  $('#facebox').css('z-index', '11111');
  
/*
  if ( range.isCollapsed() ) {
    // TODO I would suggest to call the srcChange method. So all image src
    // changes are on one single point.
    imagetag = '<img src="' + GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.ImageBank/images/blank.jpeg" title="" style=""></img>';
    var newImg = jQuery(imagetag);
    // add the click selection handler
    newImg.click( GENTICS.Aloha.ImageBank.clickImage );

    GENTICS.Utils.Dom.insertIntoDOM(newImg, range, jQuery(GENTICS.Aloha.activeEditable.obj));
    // select the image when inserted
    newImg.click();

  } else {
    // TODO NEVER alert!! i18n !! Instead log. We have a messaging stack on
    // the roadmap which will offer you the possibility to push messages.
    alert('img cannot markup a selection');
    // TODO the desired behavior could be that the selected content is
    // replaced by an image.
    // TODO it should be editor's choice, with an Ext Dialog instead of
   // alert.
  }
  */
};


GENTICS.Aloha.ImageBank.srcChange = function () {
	// TODO the src changed. I suggest :
	// 1. set an loading image (I suggest set src base64 enc) to show the user
	// we are trying to load an image
	// 2. start a request to get the image
	// 3a. the image is ok change the src
	// 3b. the image is not availbable show an error.
	// this.imgSrcField.getTargetObject(), (the img tag)
	// this.imgSrcField.getQueryValue(), (the query value in the inputfield)
	// this.imgSrcField.getItem() (optinal a selected resource item)
	// TODO additionally implement an srcChange Handler to let implementer
	// customize
};
