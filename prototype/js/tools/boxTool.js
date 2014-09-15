// Dependencies: jQuery, Utils

(function (undefined) {
	"use strict";
	
	function BoxTool(id, width, height, zIndex) {
		GenericTool.call(this, id, "div", width, height);
		
		this.$childrenCont = $('<div class="DT_preventMarginCollapse"></div>');
		this.childrenTools = [];
		
		this.init(zIndex);
	}
	BoxTool.prototype = new GenericTool();
	BoxTool.prototype.constructor = BoxTool;

	BoxTool.prototype.init = function (zIndex) {
		GenericTool.prototype.init.call(this, zIndex);
	
		var $absPosAnchor = $('<div class="DT_absPosAnchor"></div>');
		
		$absPosAnchor.append(this.$childrenCont);
		
		this.$element.append($absPosAnchor);
	};

	BoxTool.prototype.append = function (childTool, absX, absY) {

		if (childTool.layoutType === "static") {
			childTool.changeLayout("absolute");
			Utils.appendElements(childTool.element, this.$childrenCont.get(0), absX, absY);
			
			childTool.parentTool && childTool.parentTool.removeChildTool(childTool);
			childTool.parentTool = this;
			
			this.childrenTools.push(childTool);
			childTool.index = this.childrenTools.length - 1; // The index is zero-based	
			
			childTool.changeLayout("static");
		} else {
			Utils.appendElements(childTool.element, this.$childrenCont.get(0), absX, absY);
			
			childTool.parentTool && childTool.parentTool.removeChildTool(childTool);
			childTool.parentTool = this;
			
			this.childrenTools.push(childTool);
			childTool.index = this.childrenTools.length - 1; // (The index is zero-based);	
		}
		
	};

	BoxTool.prototype.removeChildTool = function (childTool) {
		var i = this.childrenTools.length;
		
		while (i) {
			
			i -= 1;
			if (this.childrenTools[i] === childTool) {
				this.childrenTools.splice(i, 1);
				break;
			}
		
		}
	};

			
	BoxTool.prototype.hasChildTool = function (childTool) {
		var i = this.childrenTools.length;
		
		while (i) {
			i -= 1;
			if (this.childrenTools[i] === childTool) {
				return true;
			}
		}
		
		return false;
	};

	BoxTool.prototype.updateInfluencingStaticTools = function () {
		var parentChildrenTools = this.parentTool.childrenTools,
			foundTool = false;
		
		// If the parent tool does not have a set height, it is therefore resizing to accommodate this tool.
		if (!this.parentTool.masterTool && !this.parentTool.cssPropList.hasProperty("height")) {
			this.parentTool.updateStatCache(true);
		}
		
		for (var i = 0, j = parentChildrenTools.length; i < j; i++) {
			
			if (foundTool) {
				if (parentChildrenTools[i].layoutType === "static") {
					parentChildrenTools[i].updateStatCache();
				}
				continue;
			}
			
			if (this === parentChildrenTools[i]) {
				foundTool = true;
			}
		}
	};
	
	BoxTool.prototype.updateStatCache = function (preventChildrenUpdate) {
		GenericTool.prototype.updateStatCache.call(this);
		
		if (!preventChildrenUpdate) {
			var i = this.childrenTools.length;
			
			while (i) {
				i -= 1;
				this.childrenTools[i].updateStatCache();
			}
		}
	};
	
	// Expose BoxTool to the global object
	window.BoxTool = BoxTool;
	
}());