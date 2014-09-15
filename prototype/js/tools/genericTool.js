// Dependencies: jQuery, DIVTREE.toolBench, DIVTREE.ui

(function (undefined) {
	"use strict";

	function GenericTool(id, elementName, width, height) {
		this.id = id;
		this.element = document.createElement(elementName);
		this.$element = $(this.element);
		this.selected = false;
		this.index = 0;
		this.parentTool = undefined;
		this.cssPropList = undefined;
		this.cssClassLists = [];
		this.outlinerItem = undefined;
		this.snapIgnore = false;
		this.layoutType = "absolute";
		
		this.statCache = {
			width: width || 50,
			height: height || 50,
			absX: 0,
			absY: 0,
			absX2: width || 50,
			absY2: height || 50
		};
	}
	
	GenericTool.prototype = {
		init: function (zIndex) {
			this.$element.addClass("DT_tool").attr("id", this.id);
			
			this.cssPropList = DIVTREE.ui.focusToolEditor.editor.addIDList(this.element);
			this.cssPropList.addProperty("background-color", "purple");
			this.cssPropList.addProperty("border", "2px solid black");
			this.cssPropList.addProperty("z-index", (zIndex !== "undefined") ? zIndex : "auto");
			this.cssPropList.addProperty("width", this.statCache.width + "px");
			this.cssPropList.addProperty("height", this.statCache.height + "px");

			this.addModules();
		},
		updateId: function (newId) {
			this.id = newId;
			this.$element.attr("id", newId);
			this.outlinerItem.setName(newId);
		},
		updateCssPropList: function (propertyNames) {
			for (var i = 0, j = arguments.length; i < j; i++) {
				this.cssPropList.addProperty(arguments[i], this.$element.css(arguments[i]));
			}
		},
		addClassList: function (classList) {
			var i = this.cssClassLists.length;
			
			while (i) {
				i -= 1;
				if (this.cssClassLists[i] === classList) {
					return false;
				}
			}
			
			classList.addElementToList(this.element);
			this.cssClassLists.push(classList);
			
			return this;
		},
		toggleClass: function (className, activate) {
			var i = this.cssClassLists.length;
			
			while (i) {
				i -= 1;
				if (this.cssClassLists[i].className === className) {
					
					if (activate) {
						this.$element.addClass(className);
					} else {
						this.$element.removeClass(className);
					}
					
					break;
				}
			}
			
		},
		removeClassList: function (className) {
			var i = this.cssClassLists.length;
			
			while (i) {
				i -= 1;
				if (this.cssClassLists[i].className === className) {
					this.cssClassLists[i].removeElementFromList(this.element);
					this.cssClassLists.splice(i, 1);
					break;
				}
			}
		},
		addModules: function () {
			var tool = this;
			
			new Draggable({
				element: this.element,
				start: function (ui) {
					if (Resizable.target === tool.element) {
						Resizable.makeHandlesVisible(false);
					}
				},
				move: function (ui) {
				
				},
				stop: function (ui) {
					tool.updateStatCache();

					if (tool instanceof BoxTool && tool.layoutType === "static") {
						tool.updateInfluencingStaticTools();
					}
					
					if (Resizable.target === tool.element) {
						Resizable.updateHandles(tool.element, tool.statCache);
						Resizable.makeHandlesVisible(true);
					}
				}
			});
			
			new Resizable({
				element: this.element,
				stop: function (ui) {
					tool.updateStatCache();
					
					if (/h_s|n/.test(ui.handleLbl)) {
						tool.updateCssPropList("height");
						
						// Don't update width if either/solely the north or south handles are released
						if (ui.handleLbl.length > 3) {
							tool.updateCssPropList("width");
						}
					} else {
						tool.updateCssPropList("width");
					}
					
				}
			});
		},
		select: function () {
			if (!this.selected) {
				this.selected = true;
				this.$element.addClass("DT_selected");
				
				this.outlinerItem.select();
				
				DIVTREE.toolBench.selectedTools.push(this);
				
				if (DIVTREE.toolBench.selectedTools.length === 1) {
					DIVTREE.ui.focusToolEditor.updateFocusTool();
					Resizable.updateHandles(this.element, this.statCache);
					Resizable.makeHandlesVisible(true);
				}
			}
		},
		deselect: function () {
			if (this.selected) {
				this.selected = false;
				this.$element.removeClass("DT_selected");
				
				this.outlinerItem.deselect();
				
				var selectedTools = DIVTREE.toolBench.selectedTools,
					i = selectedTools.length;
				while (i) {
					i -= 1;
					if (selectedTools[i] === this) {
						selectedTools.splice(i, 1);
						break;
					}
				}
				
				// Update the focus tool
				if (this === DIVTREE.ui.focusToolEditor.focusTool) {
					DIVTREE.ui.focusToolEditor.updateFocusTool();
					
					if (selectedTools[0] === undefined) {
						Resizable.makeHandlesVisible(false);
					} else {
						Resizable.updateHandles(selectedTools[0].element, selectedTools[0].statCache);
					}
				}
			}
		},
		insertBefore: function (tool) {
			var madeLayoutAbsolute = false;
			
			if (tool.parentTool !== this.parentTool) {
				tool.parentTool.append(this);
			}
			
			if (this.layoutType === "static") {
				madeLayoutAbsolute = true;
				this.changeLayout("absolute");
				this.$element.insertBefore(tool.element);
			}

			// Reorder and reindex the childrenTool array.
			// If procComplete is true, both tasks are complete and the array can stop.
			var procComplete = false;
			
			for (var i = 0, j = this.parentTool.childrenTools.length; i < j; i++) {
				
				if (this === this.parentTool.childrenTools[i]) {
					this.parentTool.childrenTools.splice(i, 1);
					
					if (procComplete) {
						break;
					} else {
						procComplete = true;
					}
					
					j -= 1;
				}
				
				if (tool === this.parentTool.childrenTools[i]) {
					this.parentTool.childrenTools.splice(i, 0, this);
					this.index = i;
					
					if (procComplete) {
						break;
					} else {
						procComplete = true;
					}
					
					j += 1;
					i += 1;
				}
				
				this.parentTool.childrenTools[i].index = i;

			}
			
			if (madeLayoutAbsolute) {
				// Make the layout static again.
				this.changeLayout("static");
			} else {
				this.$element.insertBefore(tool.element);
			}

		},
		updateStatCache: function () {
			var absPos = this.$element.offset();
			
			this.statCache.absX = absPos.left;
			this.statCache.absY = absPos.top;
			this.statCache.absX2 = absPos.left + this.$element.outerWidth();
			this.statCache.absY2 = absPos.top + this.$element.outerHeight();
			
			if (this.layoutType === "static") {
				this.updateCssPropList("margin-left", "margin-top");
			} else {
				this.updateCssPropList("left", "top");
			}
		},
		changeLayout: (function () {
			
			function getBorders (tool) {
				return {
					top: parseInt(tool.$element.css("border-left-width"), 10) || 0,
					left: parseInt(tool.$element.css("border-top-width"), 10) || 0
				};
			}
			
			function makeLayoutStatic (tool) {
				var staticNeighbors = tool.getBeforeAfterStaticTools(),
					parentBorderDisp = getBorders(tool.parentTool),
					newLeft = tool.statCache.absX - tool.parentTool.statCache.absX - parentBorderDisp.left,
					newTop;
				
				if (staticNeighbors.after) {
					newTop = staticNeighbors.after.statCache.absY - tool.statCache.absY2;
					staticNeighbors.after.cssPropList.addProperty("margin-top", newTop + "px");
				}

				if (staticNeighbors.before) {
					newTop = tool.statCache.absY - staticNeighbors.before.statCache.absY2;
				} else {
					newTop = tool.statCache.absY - tool.parentTool.statCache.absY - parentBorderDisp.top;
				}
				
				tool.cssPropList.addProperty("margin-left", newLeft + "px");
				tool.cssPropList.addProperty("margin-top", newTop + "px");
			}
			
			function makeLayoutAbsolute (tool) {
				var staticNeighbors = tool.getBeforeAfterStaticTools(),
					parentBorderDisp = getBorders(tool.parentTool),
					newLeft = tool.statCache.absX - tool.parentTool.statCache.absX,
					newTop = tool.statCache.absY - tool.parentTool.statCache.absY;
				
				tool.cssPropList.addProperty("left", newLeft - parentBorderDisp.left + "px");
				tool.cssPropList.addProperty("top", newTop - parentBorderDisp.top + "px");
				
				if (staticNeighbors.after) {

					if (staticNeighbors.before) {
						newTop = staticNeighbors.after.statCache.absY - staticNeighbors.before.statCache.absY2;
					} else {
						parentBorderDisp = getBorders(tool.parentTool);
						newTop = staticNeighbors.after.statCache.absY - tool.parentTool.statCache.absY - parentBorderDisp.top;
					}
					
					staticNeighbors.after.cssPropList.addProperty("margin-top", newTop + "px");

				}

			}
			
			return function (layoutType, updateEditor) {
				if (this.layoutType === layoutType) {
					return;
				}

				if (layoutType === "static") {
					makeLayoutStatic(this);
					this.cssPropList.removeProperty("left");
					this.cssPropList.removeProperty("top");
				} else if (layoutType === "absolute") {
					makeLayoutAbsolute(this);
					this.cssPropList.removeProperty("margin-left");
					this.cssPropList.removeProperty("margin-top");
				}
				
				// We don't want the user to change the position directly from the attribute edtior.
				this.$element.css("position", layoutType);
				this.layoutType = layoutType;
				
			};

		}()),
		getBeforeAfterStaticTools:function () {
			var parentChildrenTools = this.parentTool.childrenTools,
				beforeStaticTool,
				afterStaticTool,
				toolIndex;
			
			for (var i = 0, j = parentChildrenTools.length; i < j; i++) {
				if (!toolIndex && this === parentChildrenTools[i]) {
					toolIndex = i;
					continue;
				}
				
				if (toolIndex === undefined) {
					if (parentChildrenTools[i].layoutType === "static") {
						beforeStaticTool = parentChildrenTools[i];
					}
				} else {
					if (i > toolIndex && parentChildrenTools[i].layoutType === "static") {
						afterStaticTool = parentChildrenTools[i];
						break;
					}
				}
			
			}
			
			return {
				before: beforeStaticTool,
				after: afterStaticTool
			};
		}
	};
	
	// Expose GenericTool to the global object
	window.GenericTool = GenericTool;

}());