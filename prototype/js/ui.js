// Dependencies: jQuery, jQueryUI, DIVTREE.toolBench, Utils

DIVTREE.ui = function () {
	"use strict";
	
	var $toolBenchCont = $("#DT_toolBenchCont"),
		$window = $(window),
		topMenuBarHeight = $("#DT_topMenuBar").height(),
		resizeToolBench = function () {
			$toolBenchCont.height($window.height() - topMenuBarHeight);
			DIVTREE.ui.rightBarScroll.zeroScroll();
			DIVTREE.ui.rightBarScroll.updateVertical();
		},
		cssProperties = [
			'azimuth',
			'background-attachment',
			'background-color',
			'background-image',
			'background-position',
			'background-repeat',
			'background',
			'border-collapse',
			'border-color',
			'border-spacing',
			'border-style',
			'border-top',
			'border-right',
			'border-bottom',
			'border-left',
			'border-top-color',
			'border-right-color',
			'border-bottom-color',
			'border-left-color',
			'border-top-style',
			'border-right-style',
			'border-bottom-style',
			'border-left-style',
			'border-top-width',
			'border-right-width',
			'border-bottom-width',
			'border-left-width',
			'border-width',
			'border',
			'bottom',
			'caption-side',
			'clear',
			'clip',
			'color',
			'content',
			'counter-increment',
			'counter-reset',
			'cue-after',
			'cue-before',
			'cue',
			'cursor',
			'direction',
			'display',
			'elevation',
			'empty-cells',
			'float',
			'font-family',
			'font-size',
			'font-style',
			'font-variant',
			'font-weight',
			'font',
			'height',
			'left',
			'letter-spacing',
			'line-height',
			'list-style-image',
			'list-style-position',
			'list-style-type',
			'list-style',
			'margin-right',
			'margin-left',
			'margin-top',
			'margin-bottom',
			'margin',
			'max-height',
			'max-width',
			'min-height',
			'min-width',
			'orphans',
			'outline-color',
			'outline-style',
			'outline-width',
			'outline',
			'overflow',
			'padding-top',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'padding',
			'page-break-after',
			'page-break-before',
			'page-break-inside',
			'pause-after',
			'pause-before',
			'pause',
			'pitch-range',
			'pitch',
			'play-during',
			'position',
			'quotes',
			'richness',
			'right',
			'speak-header',
			'speak-numeral',
			'speak-punctuation',
			'speak',
			'speech-rate',
			'stress',
			'table-layout',
			'text-align',
			'text-decoration',
			'text-indent',
			'text-transform',
			'top',
			'unicode-bidi',
			'vertical-align',
			'visibility',
			'voice-family',
			'volume',
			'white-space',
			'widows',
			'width',
			'word-spacing',
			'z-index'
		];
	
	return {
		toolboxMenu: undefined,
		outliner: undefined,
		init: function () {
			resizeToolBench();

			this.initEvents();
			this.create.toolbox();
			this.textEditor.init();
			this.create.outliner();
			this.focusToolEditor.create();
			this.classEditor.create();
			this.rightBarScroll.init();
		},
		initEvents: function () {
			var $sideBar = $("#DT_rightSideBar"),
				keys = DIVTREE.ui.keys,
				$classEditorButton = $("#DT_classEditorButton"),
				$attrEditorButton = $("#DT_attrEditorButton"),
				$outlinerButton = $("#DT_outlinerButton");
			
			if (window.addEventListener) {
				window.addEventListener("resize", resizeToolBench, false);
			} else {
				window.attachEvent("resize", resizeToolBench);
			}
			
			// Handle Keyboard Shortcuts
			var lastKeyFired = false;
			$(document).keydown(function (e) {
				
				if (lastKeyFired === e.keyCode) {
					return;
				}
				
				lastKeyFired = e.keyCode;
				keys.toggleKeys(e, true);

				switch (e.keyCode) {
				case 81: // z
					if (keys.ctrl) {
						$outlinerButton.click();
						return false;
					}
					break;
				case 65: // a
					if (keys.ctrl) {
						$attrEditorButton.click();
						return false;
					}
					break;
				case 90: // q
					if (keys.ctrl) {
						$classEditorButton.click();
						return false;
					}
					break;
				}

			}).keyup(function (e) {
				lastKeyFired = false;
				keys.toggleKeys(e, false);
			});
			
			// Handle Sidebar Buttons
			(function () {
				var $classEditorCont = $("#DT_cssClassEditorCont"),
					$focusToolEditor = $("#DT_focusToolEditor"),
					$outlinerCont = $("#DT_outlinerCont"),
					menus = [$classEditorCont, $focusToolEditor, $outlinerCont];
			
				function toggleMenu ($menu) {
					var i = menus.length;
					if ($menu.is(":visible")) {
						while (i) {
							i -= 1;
							menus[i].hide();
						}
						$sideBar.hide();
					} else {
						while (i) {
							i -= 1;
							if (menus[i] !== $menu) {
								menus[i].hide();
							}
						}
						$sideBar.show();
						$menu.show();
					}
				}
				
				$classEditorButton.click(function () {
					toggleMenu($classEditorCont);
					
					DIVTREE.ui.rightBarScroll.zeroScroll();
					DIVTREE.ui.rightBarScroll.update();
				});
				
				$attrEditorButton.click(function () {
					toggleMenu($focusToolEditor);
					
					DIVTREE.ui.rightBarScroll.zeroScroll();
					DIVTREE.ui.rightBarScroll.update();
				});
				
				$outlinerButton.click(function () {
					toggleMenu($outlinerCont);
					
					DIVTREE.ui.rightBarScroll.zeroScroll();
					DIVTREE.ui.outliner.updateScrollBars();
				});
				
			}());
			
			$("#DT_rightSideBar").resizable({
				handles: "w",
				// When the vertical scrollbar is visible, DT_rightBarScrollCont's width is not 100% and thus needs to be
				// manually resized if the rightSideBar is resized.
				alsoResize: "#DT_rightBarScrollCont",
				minWidth: 300,
				maxWidth: 900,
				resize: (function () {
					var newClassButtonWidth = $("#DT_newClassButton").width();
					
					return function (e, ui) {
						DIVTREE.ui.classEditor.classesDDM.resize(ui.size.width - newClassButtonWidth);
						DIVTREE.ui.outliner.updateScrollBars();
					};

				}()),
				stop: function (e, ui) {
					// Remove inline css added by the jQuery resizable plugin.
					ui.helper.css({
						left: "",
						height: ""
					});
				}
			});
			
			// Handle editor section visibility
			$(".DT_editorSectHead").click(function () {
				$(this).next(".DT_editorSectBody").toggle();
			});
		},
		keys: {
			ctrl: false,
			shift: false,
			space: false,
			del: false,
			toggleKeys: function (e, on) {
				var keys = DIVTREE.ui.keys;

				switch (e.keyCode) {
				case 17:
					keys.ctrl = (on) ? true : false;
					break;
				case 16:
					keys.shift = (on) ? true : false;
					break;
				case 32:
					keys.space = (on) ? true : false;
					break;
				case 46:
					keys.del = (on) ? true : false;
					break;
				}
				
			}
		},
		create: {
			toolbox: function () {
				DIVTREE.ui.toolboxMenu = new DragDropMenu({
					element: document.getElementById("DT_toolbox"),
					width: 300,
					height: 62
				});
				
				var toolTypes = DIVTREE.toolBench.toolTypes,
					animateIconColor = function (icon) {
						if (icon.mouseY < topMenuBarHeight) {
							icon.element.style.backgroundColor = "red";
						} else {
							icon.element.style.backgroundColor = "green";
						}
					},
					stop = function (icon) {
						DIVTREE.toolBench.createTool(icon.itemName, icon.mouseX, icon.mouseY);
					};
				
				for (var i = 0, j = toolTypes.length; i < j; i++) {
					DIVTREE.ui.toolboxMenu.addItem({
						name: toolTypes[i],
						start: animateIconColor,
						move: animateIconColor,
						stop: stop
					});
				}
			},
			outliner: function () {
				DIVTREE.ui.outliner = new Outliner({
					container: document.getElementById("DT_outlinerCont")
				});
			}
		},
		textEditor: (function () {
			var $container = $("#DT_textEditorCont"),
				focusTextTool,
				editor;

			return {
				init: function () {
					editor = new TextEditor({
						container: document.getElementById("DT_textEditor"),
					});

					$("#DT_textEditorToggle").click(function () {
						if (focusTextTool) {
							if (focusTextTool.isEditable === false) {
								editor.changeTextSpace(focusTextTool.element);
								focusTextTool.editable(true);
							} else {
								editor.changeTextSpace("");
								focusTextTool.editable(false);
							}
						}
					});
				},
				updateAccess: function (focusTool) {
					if (focusTool instanceof TextTool) {
						focusTextTool = focusTool;
						$container.show();
					} else {
						focusTextTool = undefined;
						$container.hide();
					}
				}
			};
		
		}()),
		rightBarScroll: (function () {
			var $rightSideBar = $("#DT_rightSideBar"),
				$scrollCont = $("#DT_rightBarScrollCont"),
				$scrollBottomAnchor = $('<div id="DT_scrollBottomAnchor"></div>'),
				$scrollHandleY = $('<div id="DT_rightBarScrollHandleY"></div>'),
				$scrollHandleX = $('<div id="DT_rightBarScrollHandleX"></div>'),
				$outlinerCont = $("#DT_outlinerCont"),
				$scollBgY = $('<div id="DT_rightBarScrollBgY"></div>').append($scrollHandleY),
				$scollBgX = $('<div id="DT_rightBarScrollBgX"></div>').append($scrollHandleX),
				
				rightBarHeight,
				handleHeight,
				scrollMultiplierY,
				initHandlePosY,
				initMouseY,
				
				rightBarWidth,
				handleWidth,
				scrollMultiplierX,
				initHandlePosX,
				initMouseX,

				startDragY = function (e) {
					initHandlePosY = $scrollHandleY.position().top;
					initMouseY = e.pageY;
					
					Utils.disableDocSelection();
					$(document).mousemove(dragHandleY).mouseup(stopDrag);
				},				
				
				startDragX = function (e) {
					initHandlePosX = $scrollHandleX.position().left;
					initMouseX = e.pageX;
					
					Utils.disableDocSelection();
					$(document).mousemove(dragHandleX).mouseup(stopDrag);
				},
				
				dragHandleY = function (e) {
					var handleY = initHandlePosY + (e.pageY - initMouseY);
				
					if (handleY < 0) {
						handleY = 0;
					} else if (handleY + handleHeight > rightBarHeight) {
						handleY = rightBarHeight - handleHeight;
					}
				
					$scrollHandleY.css("top", handleY);
					$scrollCont.css("top", -handleY * scrollMultiplierY);
				},				
				
				dragHandleX = function (e) {
					var handleX = initHandlePosX + (e.pageX - initMouseX);
				
					if (handleX < 0) {
						handleX = 0;
					} else if (handleX + handleWidth > rightBarWidth) {
						handleX = rightBarWidth - handleWidth;
					}
				
					$scrollHandleX.css("left", handleX);
					$outlinerCont.css("left", -handleX * scrollMultiplierX);
				},
				
				stopDrag = function () {
					Utils.enableDocSelection();
					$(document).unbind("mousemove", dragHandleY).unbind("mousemove", dragHandleX).unbind("mouseup", stopDrag);
				};
				
				$scrollHandleY.mousedown(startDragY);
				$scrollHandleX.mousedown(startDragX);

			return {
				init: function () {
					$scrollCont.append($scrollBottomAnchor);
					$rightSideBar.append($scollBgY, $scollBgX);
					
					DIVTREE.ui.rightBarScroll.update();
				},
				updateVertical: function () {
					var scrollContVerticalDisp = Math.abs(parseInt($scrollCont.css("top"), 10)) || 0,
						innerHeight = $scrollBottomAnchor.offset().top + scrollContVerticalDisp - topMenuBarHeight;
					
					rightBarHeight = $rightSideBar.height();
					
					if ($scollBgX.is(":visible")) {
						rightBarHeight -= 15;
					}
					
					if (innerHeight > rightBarHeight) {
						scrollMultiplierY = innerHeight / rightBarHeight;
						handleHeight = Math.round(rightBarHeight / scrollMultiplierY);
						
						$scrollCont.css("width", $rightSideBar.width() - 15);
						$scrollHandleY.css("height", handleHeight);
						$scollBgY.show();
					} else {
						$scollBgY.hide();
						$scrollCont.css("width", "100%");
					}
				},
				updateHorizontal: function (absLeft) {
					rightBarWidth = $rightSideBar.width();
					absLeft -= $rightSideBar.offset().left - 200;
					
					var scrollOverflow, scrollLeft;
					
					if (absLeft > rightBarWidth) {
						scrollMultiplierX = absLeft / rightBarWidth;
						handleWidth = Math.round(rightBarWidth / scrollMultiplierX);
						
						scrollLeft = Math.abs(parseInt($scrollHandleX.css("left"), 10));
						scrollOverflow = (scrollLeft + handleWidth) - rightBarWidth;
						
						if (scrollOverflow > 0) {
							$scrollHandleX.css("left", scrollLeft - scrollOverflow);
							$outlinerCont.css("left", -(scrollLeft - scrollOverflow) * scrollMultiplierX);
						}
						
						$scrollHandleX.css("width", handleWidth);
						$scollBgX.show();
					} else {
						$scollBgX.hide();
						$scrollCont.css("height", "100%");
					}
				},
				zeroScroll: function () {
					$scrollHandleY.css("top", 0);
					$scrollCont.css("top", 0);
					$scrollHandleX.css("left", 0);
					$outlinerCont.css("left", 0);
				},
				update: function (absLeft) {
					this.updateHorizontal(absLeft || 0);
					this.updateVertical();
				}
			};
			
		}()),
		focusToolEditor: (function () {
			var $editorSects = $("#DT_focusToolEditor .DT_editorSect"),
				$focusToolID = $("#DT_focusToolID input"),
				$focusToolClasses = $("#DT_focusToolClasses"),
				$focusToolLayout = $("#DT_focusToolLayout");
			
			// Prepare events
			$focusToolClasses.on("click", ".DT_toolClassItemCheckBox", function () {
				var className = $(this).siblings(".DT_toolClassItemName").text();
				DIVTREE.ui.focusToolEditor.focusTool.toggleClass(className, this.checked);
			}).on("click", ".DT_toolClassItemDestroy", function () {
				var $this = $(this),
					className = $this.siblings(".DT_toolClassItemName").text();
				
				$this.parent(".DT_toolClassItem").remove();
				DIVTREE.ui.focusToolEditor.focusTool.removeClassList(className);
			});
			
			$focusToolLayout.children("input").click(function () {
				DIVTREE.ui.focusToolEditor.focusTool.changeLayout(this.value);
			});
			
			$("#DT_focusToolEditor .DT_getCssProperty input").autocomplete({
				source: cssProperties,
				delay: 0,
				autoFocus: true,
				select: function (e, ui) {
					DIVTREE.ui.focusToolEditor.focusTool.cssPropList.addProperty(ui.item.value).focus();
					ui.item.value = "";
					DIVTREE.ui.rightBarScroll.updateVertical();
				}
			});
			
			$focusToolID.focusout(function () {
				DIVTREE.ui.focusToolEditor.focusTool.updateId(this.value);
			});
			
			return {
				editor: undefined,
				focusTool: undefined,
				create: function () {
					this.editor = new CssEditor({
						name: "DT_focusToolEditor",
						$container: $("#DT_focusToolEditor .DT_cssPropertyCont")
					});
					
					this.updateFocusTool();
				},
				updateFocusTool: (function () {
					var $editorSpan = $("#DT_focusToolID span");
				
					return function () {
						var selectedTools = DIVTREE.toolBench.selectedTools;
						
						if (selectedTools.length > 0) {
							if (this.focusTool !== selectedTools[0]) {
								
								this.focusTool = selectedTools[0];
								DIVTREE.ui.textEditor.updateAccess(this.focusTool);
								this.editor.populateWithList(this.focusTool.cssPropList);
								this.updateToolClassSect();
								
								$editorSpan.text("Tool Name: ");
								$focusToolID.val(this.focusTool.id).show();
								$editorSects.show();
								$focusToolLayout.children('input[value="' + this.focusTool.layoutType + '"]').attr("checked", "checked");
							} else {
								return;
							}
						} else {
							this.focusTool = undefined;
							DIVTREE.ui.textEditor.updateAccess(this.focusTool);
							
							$editorSpan.text("No tool is selected.");
							$focusToolID.hide();
							$editorSects.hide();
						}
						
						DIVTREE.ui.rightBarScroll.updateVertical();
					};
				
				}()),
				updateToolClassSect: (function () {
					var classes = [];
					
					function createClassElement(className) {
						var $class = $('<div class="DT_toolClassItem"></div>'),
							$checkbox = $('<input class="DT_toolClassItemCheckBox" type="checkbox" checked="checked" />'),
							$destroy = $('<div class="DT_toolClassItemDestroy"></div>'),
							$itemName = $('<span class="DT_toolClassItemName">' + className + '</span>');
						
						$class.append($checkbox, $destroy, $itemName);
						
						classes.push({
							name: className,
							$element: $class
						});
						
						$focusToolClasses.append($class);
					}
					
					return function (className, newClassName) {
						if (!this.focusTool) {
							return;
						}
						
						var i, j, $class;
						
						if (newClassName && className) {
							// If a new and old class name are provided, the old class item will be updated
							i = classes.length;
							while (i) {
								i -= 1;
								if (classes[i].name === className) {
									classes[i].name = newClassName;
									classes[i].$element.children(".DT_toolClassItemName").text(newClassName);
									break;
								}
							}
						} else if (className) {
							// If only a class name is provided, a new class list item will be added
							createClassElement(className);
						} else {
							// If no arguments are passed, the entire class list is repopulated
							j = this.focusTool.cssClassLists.length;
							
							$focusToolClasses.empty();
							classes = [];
							
							if (j > 0) {
								for (i = 0; i < j; i++) {
									createClassElement(this.focusTool.cssClassLists[i].className);
								}
							} else {
								$focusToolClasses.append("<span>No classes.</span>");
							}
						}
					};
					
				}())
				
			};
		
		}()),
		classEditor: (function () {
			var $className = $("#DT_selectedClassName input"),
				$editorSects = $("#DT_cssClassEditorCont .DT_editorSect"),
				listCount = 0;

			$("#DT_cssClassEditorCont .DT_getCssProperty input").autocomplete({
				source: cssProperties,
				delay: 0,
				autoFocus: true,
				select: function (e, ui) {
					DIVTREE.ui.classEditor.focusList.addProperty(ui.item.value).focus();
					ui.item.value = "";
					DIVTREE.ui.rightBarScroll.updateVertical();
				}
			});
			
			$("#DT_newClassButton").click(function () {
				var classList = DIVTREE.ui.classEditor.editor.addClassList("DT_class_" + listCount);
				listCount += 1;
				
				DIVTREE.ui.classEditor.classesDDM.addItem({
					name: "cssClassItem",
					select: function () {
						DIVTREE.ui.classEditor.update(classList);
					},
					stop: function () {
						var hoveredEl = DIVTREE.toolBench.hoveredToolEl,
							tool = DIVTREE.toolBench.getToolFromElement(hoveredEl);
						
						// Update the focusToolEditor only if the focus tool doesn't already have class list
						if (tool.addClassList(classList) && tool === DIVTREE.ui.focusToolEditor.focusTool) {
							DIVTREE.ui.focusToolEditor.updateToolClassSect(classList.className);
						}
					}
				});
			});
			
			(function () {
				var oldClassName;
			
				$className.focusin(function () {
					oldClassName = this.value;
				}).focusout(function () {
					DIVTREE.ui.classEditor.focusList.updateClassName(this.value);
					DIVTREE.ui.focusToolEditor.updateToolClassSect(oldClassName, this.value);
				});
				
			}());
			
			return {
				editor: undefined,
				classesDDM: undefined,
				focusList: undefined,
				create: function () {
					this.classesDDM = new DragDropMenu({
						element: document.getElementById("DT_cssClassDDM"),
						delay: 200,
						width: 270,
						height: 62
					});
					
					this.editor = new CssEditor({
						name: "DT_classEditor",
						$container: $("#DT_cssClassEditorCont .DT_cssPropertyCont")
					});
					
					this.update();
				},
				update: (function () {
					var $editorSpan = $("#DT_selectedClassName span");
						
					return function (classList) {
						this.focusList = classList;

						if (this.focusList) {
							$editorSpan.text("Class: ");
							$className.val(this.focusList.className).show();
							$editorSects.show();
							this.editor.populateWithList(this.focusList);
						} else {
							$editorSpan.text("No class is selected.");
							$className.hide();
							$editorSects.hide();
						}

						DIVTREE.ui.rightBarScroll.updateVertical();
					};
					
				}())
			};
			
		}())
	};
};