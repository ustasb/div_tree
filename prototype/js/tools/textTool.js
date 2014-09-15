function TextTool(id, width, height, zIndex) {
	GenericTool.call(this, id, "div", width, height);
	
	this.isEditable = false;
	
	this.init(zIndex);
}
TextTool.prototype = new GenericTool();
TextTool.prototype.constructor = TextTool;

TextTool.prototype.init = function (zIndex) {
	GenericTool.prototype.init.call(this, zIndex);
	
	this.$element.html("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
};

TextTool.prototype.editable = function (makeEditable) {
	if (this.isEditable === makeEditable) {
		return;
	}
	
	if (makeEditable) {
		this.isEditable = true;
		this.$element.removeClass("DRAG_draggableElement");
	} else {
		this.isEditable = false;
		this.$element.addClass("DRAG_draggableElement");
	}

};