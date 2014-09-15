// Dependencies: jQuery, DIVTREE.ui, Utils

DIVTREE.toolBench = function () {
	"use strict";
	var $ToolBenchCont = $("#DT_toolBenchCont"),
	
		// Besides being useful for organizing the tools, all statically 
		// placed elements must be placed before absolutely placed elements
		// in IE7 and below or else top margins will be ignored...
		$ToolCont = $('<div id="DT_toolCont"></div>'),
		Keys = DIVTREE.ui.keys,
		UI = DIVTREE.ui,
		ToolBenchDisplaceY = $ToolBenchCont.offset().top;

	return {
		hoveredToolEl: undefined,
		tools: [],
		selectedTools: [],
		toolTypes: ["boxTool", "imgTool", "textTool"],
		toolBenchTool: {
			masterTool: true,
			id: "DT_toolBenchCont",
			element: $ToolCont.get(0),
			$element: $ToolCont,
			$childrenCont: $ToolCont,
			childrenTools: [],
			statCache: {
				absX: 0,
				absY: ToolBenchDisplaceY
			},
			append: undefined,
			removeChildTool: undefined,
			hasChildTool: undefined
		},
		init: function () {
			this.initEvents();
			this.marquee.init();
			
			$ToolBenchCont.prepend($ToolCont);
			// Add methods to the toolBenchTool object
			this.toolBenchTool.append = BoxTool.prototype.append;
			this.toolBenchTool.removeChildTool = BoxTool.prototype.removeChildTool;
			this.toolBenchTool.hasChildTool = BoxTool.prototype.hasChildTool;
		},
		initEvents: function () {
			var $mouseStats = $("#DT_mouseStats"),
				toolBench = this;

			$("body").on("mousedown", ".DT_tool", function (e) {
				e.stopPropagation();
				
				DIVTREE.toolBench.handleSelection(this, e);
			}).on("mouseover", ".DT_tool", function (e) {
				e.stopPropagation();
				
				toolBench.hoveredToolEl = this;

				$mouseStats.text(this.getAttribute("id"));
			}).on("mouseout", ".DT_tool", function (e) {
				e.stopPropagation();
				
				toolBench.hoveredToolEl = undefined;
				
				$mouseStats.text("");
			});
			
		},
		getToolFromElement: function (element) {
			for (var i = 0, j = this.tools.length; i < j; i++) {
				if (this.tools[i].element === element) {
					return this.tools[i];
				}
			}
			
			return false;
		},
		handleSelection: function (element, e) {
			var tool = this.getToolFromElement(this.hoveredToolEl),
				selectionLen = this.selectedTools.length;
			
			if (tool.selected) {
				if (Keys.ctrl) {
					tool.deselect();
				} else if (selectionLen > 1) {
					DIVTREE.toolBench.selectionMove.create(e);
				}
			} else {
				if (selectionLen > 0 && !Keys.ctrl && !Keys.shift) {
					this.deselectAll();
					tool.select();
				} else {
					tool.select();
				}
			}
		},
		deselectAll: function () {
			while (this.selectedTools[0]) {
				this.selectedTools[0].deselect();
			}
		},
		marquee: (function () {

			var initPos = {x: 0, y: 0},
				marqueeEl = $("<div class='DT_marquee'></div>").css({
					position: "absolute",
					backgroundColor: "blue",
					opacity: 0.6,
					"z-index": "9999"
				}).get(0),
				
				createMarquee = function (e) {
					initPos.x = e.pageX;
					initPos.y = e.pageY - ToolBenchDisplaceY;
					
					Utils.disableDocSelection();
					$(document).mousemove(resizeMarquee).mouseup(releaseMarquee);
					
					marqueeEl.style.width = "0px";
					marqueeEl.style.height = "0px";
					marqueeEl.style.left = initPos.x + "px";
					marqueeEl.style.top = initPos.y + "px";
					
					$ToolBenchCont.append(marqueeEl);
					
				},
				
				resizeMarquee = function (e) {
					var x = e.pageX,
						y = e.pageY - ToolBenchDisplaceY,
						dx, dy, w, h;

					if (Keys.space) {
						dx = x - initPos.x;
						dy = y - initPos.y;
						w = $(marqueeEl).width();
						h =  $(marqueeEl).height();
							
						if (dx < 0) {
							marqueeEl.style.left = x + "px";
							initPos.x = x + w;
						} else {
							dx = x - w;
							initPos.x = dx;
							marqueeEl.style.left = dx + "px";
						}
						if (dy < 0) {
							marqueeEl.style.top = y + "px";
							initPos.y = y + h;
						} else {
							dy = y - h;
							initPos.y = dy;
							marqueeEl.style.top = dy + "px";
						}
					} else {
						dx = x - initPos.x;
						dy = y - initPos.y;
						
						marqueeEl.style.width = Math.abs(dx) + "px";
						marqueeEl.style.height = Math.abs(dy) + "px";
						
						if (dx < 0) {
							marqueeEl.style.left = x + "px";
						} else {
							marqueeEl.style.left = initPos.x + "px";
						}
						
						if (dy < 0) {
							marqueeEl.style.top = y + "px";
						} else {
							marqueeEl.style.top = initPos.y + "px";
						}
					}
					
				},
				
				releaseMarquee = function (e) {
					var $marquee = $(marqueeEl),
						offset = $marquee.offset();
					
					$marquee.remove();
						
					Utils.enableDocSelection();
					$(document).unbind("mousemove", resizeMarquee).unbind("mouseup", releaseMarquee);
					
					DIVTREE.toolBench.marquee.release({
						x1: offset.left,
						x2: offset.left + $marquee.width(),
						y1: offset.top,
						y2: offset.top + $marquee.height()
					});
				};

			return {
				init: function () {
					$ToolBenchCont.mousedown(function (e) {
						if (e.target === this) {
							createMarquee(e);
						}
					});
				},
				release: function (ui) {
					var i = DIVTREE.toolBench.tools.length,
						tool;
						
					while (i) {
						i -= 1;
						tool = DIVTREE.toolBench.tools[i];
						
						if (tool.statCache.absX2 > ui.x1 &&
							tool.statCache.absX < ui.x2 &&
							tool.statCache.absY2 > ui.y1 &&
							tool.statCache.absY < ui.y2) {
							if (Keys.ctrl) {
								tool.deselect();
							} else {
								tool.select();
							}
						} else {
							if (!Keys.ctrl && !Keys.shift) {
								tool.deselect();
							}
						}
					
					}
					
				}
			};
			
		}()),
		selectionMove: (function () {
			var initMousePos = {x: 0, y: 0},
				moveSelection = [],
				
				getLastSelectedParentTool = (function () {
					var topSelectedParent;
					
					return function (tool) {
						var tempSelectedTool,
							tempTool;
					
						if (tool.parentTool && !tool.parentTool.masterTool) {
							if (tool.parentTool.selected) {
								topSelectedParent = tool.parentTool;
							}
							
							tempTool = getLastSelectedParentTool(tool.parentTool);
							if (!tempTool) {
								if (topSelectedParent) {
									tempSelectedTool = topSelectedParent;
									topSelectedParent = undefined;
									return tempSelectedTool;
								}
							} else {
								return tempTool;
							}
							
						}
						
						return false;
					};
				
				}()),
				
				areStaticParentsBeingInfluenced = function (testingTool, fullRangeStatic) {
					var a;
					
					if (testingTool.parentTool) {
						if (testingTool.parentTool.layoutType === "static") {
							a = fullRangeStatic.length;
							while (a) {
								a -= 1;
								if (testingTool.parentTool.parentTool === fullRangeStatic[a].parentTool && testingTool.parentTool.index > fullRangeStatic[a].index) {
									return fullRangeStatic[a];
								}
							}

						}
							
						return areStaticParentsBeingInfluenced(testingTool.parentTool, fullRangeStatic);
					} else {
						return false;
					}
				},
				
				getMovableSelection = function () {
					var i = DIVTREE.toolBench.selectedTools.length,
						a,
						testingTool,
						parentMatch,
						$tempElement,
						absPositionedTools = [],
						fullRangeStatic = [],
						marginLeftStatic = [];
					
					while (i) {
						i -= 1;
						testingTool = DIVTREE.toolBench.selectedTools[i];
						
						if (!getLastSelectedParentTool(testingTool)) {
							
							if (testingTool.layoutType === "static") {
								a = fullRangeStatic.length;
								parentMatch = false;
								
								while (a) {
									a -= 1;
									
									if (testingTool.parentTool === fullRangeStatic[a].parentTool) {
										parentMatch = true;
										
										if (testingTool.index < fullRangeStatic[a].index) {
											marginLeftStatic.push(fullRangeStatic[a]);
											fullRangeStatic[a] = testingTool;
										} else {
											marginLeftStatic.push(testingTool);
										}
										
										break;
									}
								}
								
								if (!parentMatch) {
									fullRangeStatic.push(testingTool);
								}

							} else {
								absPositionedTools.push(testingTool);
							}
						
						}
						
					}
					
					a = fullRangeStatic.length;
					while (a) {
						a -= 1;
						
						if (areStaticParentsBeingInfluenced(fullRangeStatic[a], fullRangeStatic)) {
							marginLeftStatic.push(fullRangeStatic[a]);
							fullRangeStatic.splice(a, 1);
						} else {
							$tempElement = $(fullRangeStatic[a].element);
							
							moveSelection.push({
								tool: fullRangeStatic[a],
								initPos: {
									left: parseInt($tempElement.css("margin-left") || 0, 10),
									top: parseInt($tempElement.css("margin-top") || 0, 10)
								},
								element: fullRangeStatic[a].element
							});
						}
					}
					
					a = marginLeftStatic.length;
					while (a) {
						a -= 1;
						
						moveSelection.push({
							tool: marginLeftStatic[a],
							initPos: {
								left: parseInt($(marginLeftStatic[a].element).css("margin-left") || 0, 10),
								top: false
							},
							element: marginLeftStatic[a].element
						});
					}
					
					a = absPositionedTools.length;
					while (a) {
						a -= 1;

						if (areStaticParentsBeingInfluenced(absPositionedTools[a], fullRangeStatic)) {
							moveSelection.push({
								tool: absPositionedTools[a],
								initPos: {
									left: parseInt($(absPositionedTools[a].element).css("left") || 0, 10),
									top: false
								},
								element: absPositionedTools[a].element
							});
						} else {
							moveSelection.push({
								tool: absPositionedTools[a],
								initPos: $(absPositionedTools[a].element).position(),
								element: absPositionedTools[a].element
							});
						}
					}
				};
		
			return {
				create: function (e) {
					initMousePos.x = e.pageX;
					initMousePos.y = e.pageY;
					
					getMovableSelection();
					
					Resizable.makeHandlesVisible(false);
					Draggable.activeDraggable.stop(e, true);
					Utils.disableDocSelection();
					$(document).mousemove(DIVTREE.toolBench.selectionMove.move).mouseup(DIVTREE.toolBench.selectionMove.stop);
				},
				move: function (e) {
					var i = moveSelection.length,
						selectedObj;

					while (i) {
						i -= 1;
						selectedObj = moveSelection[i];
						
						if (selectedObj.tool.layoutType === "static") {
							selectedObj.element.style.marginLeft = selectedObj.initPos.left + (e.pageX - initMousePos.x) + "px";
							
							if (selectedObj.initPos.top !== false) {
								selectedObj.element.style.marginTop = selectedObj.initPos.top + (e.pageY - initMousePos.y) + "px";
							}
						} else {
							selectedObj.element.style.left = selectedObj.initPos.left + (e.pageX - initMousePos.x) + "px";
							
							if (selectedObj.initPos.top !== false) {
								selectedObj.element.style.top = selectedObj.initPos.top + (e.pageY - initMousePos.y) + "px";
							}
						}

					}
				},
				stop: function () {
					var i = moveSelection.length,
						focusTool = UI.focusToolEditor.focusTool;

					while (i) {
						i -= 1;
						moveSelection[i].tool.updateStatCache();
					}
					moveSelection = [];
					
					Resizable.updateHandles(focusTool.element, focusTool.statCache);
					Resizable.makeHandlesVisible(true);

					Utils.enableDocSelection();
					$(document).unbind("mousemove", DIVTREE.toolBench.selectionMove.move).unbind("mouseup", DIVTREE.toolBench.selectionMove.stop);
				}
			};
		
		}()),
		getNearestBoxToolParent: function (childTool) {
			if (childTool.parentTool instanceof BoxTool || childTool.parentTool.masterTool) {
				return childTool.parentTool;
			} else {
				return DIVTREE.toolBench.getNearestBoxToolParent(childTool.parentTool);
			}
		},
		createTool: (function () {
		
			// Save memory by creating reference functions to point to
			function select () {
				this.tool.select();
			}
			
			function deselect () {
				this.tool.deselect();
			}
			
			function append (newItem) {
				this.tool.append(newItem.tool);
			}
			
			function before (newItem) {
				newItem.tool.insertBefore(this.tool);
			}
		
			return function (toolType, absX, absY) {
				var id,
					newTool,
					hoveredTool,
					parentOutlinerItem,
					boxToolParent;
				
				switch (toolType) {
					case "boxTool":
						id = "DT_boxTool_" + this.tools.length;
						newTool = new BoxTool(id, 50, 50, this.tools.length);
						break;
					case "imgTool":
						id = "DT_imgTool_" + this.tools.length;
						newTool = new ImgTool(id, 50, 50, this.tools.length);
						break;
					case "textTool":
						id = "DT_textTool_" + this.tools.length;
						newTool = new TextTool(id, 50, 50, this.tools.length);
						break;
				}
				
				if (this.hoveredToolEl) {
					hoveredTool = DIVTREE.toolBench.getToolFromElement(this.hoveredToolEl);
					if (hoveredTool instanceof BoxTool) {
						hoveredTool.append(newTool, absX, absY);
						parentOutlinerItem = hoveredTool.outlinerItem;
					} else {
						boxToolParent = DIVTREE.toolBench.getNearestBoxToolParent(hoveredTool);
						boxToolParent.append(newTool, absX, absY);
						if (!boxToolParent.masterTool) {
							parentOutlinerItem = boxToolParent.outlinerItem;
						}
					}
				} else {
					this.toolBenchTool.append(newTool, absX, absY);
				}
				
				newTool.updateStatCache();
				newTool.outlinerItem = UI.outliner.addItem({
					name: id,
					tool: newTool,
					parentItem: parentOutlinerItem,
					select: select,
					deselect: deselect,
					append: append,
					before: before
				});
				
				this.tools.push(newTool);
			}
		
		}())
	
	};
};