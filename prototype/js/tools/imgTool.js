// Dependencies: jQuery, GenericTool

(function (undefined) {
	"use strict";
	
	function ImgTool(id, width, height, zIndex) {
		GenericTool.call(this, id, "img", width, height);
		
		GenericTool.prototype.init.call(this, zIndex);
		this.init();
	}
	ImgTool.prototype = new GenericTool();
	ImgTool.prototype.constructor = ImgTool;

	ImgTool.prototype.init = function () {
		this.element.src = "http://images.wikia.com/onepiecefanfiction/images/9/98/JArmada_olly-roger.png";
		
		// Prevent default image dragging
		this.element.draggable = false;
		this.$element.mousedown(function (e) {
			e.preventDefault();
		});
	};
	
	window.ImgTool = ImgTool;
	
}());


