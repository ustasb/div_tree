// Depends on jQuery Mouse Wheel by Brandon Aaron

var UI = (function ($, undefined) {
	"use strict";
	
	var $window = $(window),
		$document = $(document),
		$topBar = $("#DT_topBar"),
		$bottomBar = $("#DT_bottomBar"),
		// Scroll Objects
		outlinerScrollObj,
		attrEditorScrollObj,
		classEditorScrollObj,
		classBoxScrollCont;
		
	function ScrollCont($scrollCont) {
		this.$scrollCont = $scrollCont;
		this.$scrollingCont = $scrollCont.children(".DT_scrollingCont");
		this.$contentCont = this.$scrollingCont.children(".DT_scrollContentCont");
		this.$handleX = $scrollCont.children(".DT_scrollHandleContX").children(".DT_scrollHandle");
		this.$handleY = $scrollCont.children(".DT_scrollHandleContY").children(".DT_scrollHandle");
		this.handleLen = {x: 0, y: 0};
		this.scrollBarLen = {x: 0, y: 0};
		this.multiplier = {x: 0, y: 0};
		this.initEvents();
	}

	ScrollCont.prototype = (function () {
		var handleContLen = $(".DT_scrollHandleContY").width(),
			initMousePos = {x: 0, y: 0},
			initHandleSideDisp;

		return {
			initEvents: function () {
				var	scrollCont = this;
				
				this.$scrollCont.mousewheel(function (e, delta) {
					if (scrollCont.$handleY.is(":visible")) {
						initMousePos.y = 0;
						initHandleSideDisp = parseInt(scrollCont.$handleY.css("top"), 10);
						scrollCont.scrollY({pageY: delta * -15});
					} else {
						if (scrollCont.$handleX.is(":visible")) {
							initMousePos.x = 0;
							initHandleSideDisp = parseInt(scrollCont.$handleX.css("left"), 10);
							scrollCont.scrollX({pageX: delta * -15});
						}
					}
				});
				
				// Create a function so that the unbind can find and remove it.
				function mouseScrollX(e) {
					scrollCont.scrollX(e);
				}
				
				this.$handleX.mousedown(function (e) {
					// Prevent document from creating any selection
					e.preventDefault();
					
					initMousePos.x = e.pageX;
					initHandleSideDisp = parseInt(scrollCont.$handleX.css("left"), 10);
					$document.mousemove(mouseScrollX).mouseup(function () {
						$document.unbind("mousemove", mouseScrollX);
					});
				});
				
				function mouseScrollY(e) {
					scrollCont.scrollY(e);
				}
				
				this.$handleY.mousedown(function (e) {
					// Prevent document from creating any selection
					e.preventDefault();
					
					initMousePos.y = e.pageY;
					initHandleSideDisp = parseInt(scrollCont.$handleY.css("top"), 10);
					$document.mousemove(mouseScrollY).mouseup(function () {
						$document.unbind("mousemove", mouseScrollY);
					});
				});
				
			},
			scrollX: function (e) {
				var dx = e.pageX - initMousePos.x,
					left = initHandleSideDisp + dx;
				
				if (left < 0) {
					left = 0;
				} else if (left + this.handleLen.x > this.scrollBarLen.x) {
					left = this.scrollBarLen.x - this.handleLen.x;
				}
				
				this.$handleX.css("left", left);
				this.$scrollingCont.css("left", left * -this.multiplier.x);
			},
			scrollY: function (e) {
				var dy = e.pageY - initMousePos.y,
					top = initHandleSideDisp + dy;

				if (top < 0) {
					top = 0;
				} else if (top + this.handleLen.y > this.scrollBarLen.y) {
					top = this.scrollBarLen.y - this.handleLen.y;
				}
				
				// Chrome needs the extra fraction of a pixel... Math.ceil(top)
				this.$handleY.css("top", top);
				this.$scrollingCont.css("top", top * -this.multiplier.y);
			},
			fillVertSpace: function () {
				var parentHeight = this.$scrollCont.parent().height(),
					siblingsHeight = this.$scrollCont.siblings().outerHeight() || 0,
					vertBorder = parseInt(this.$scrollCont.css("border-top-width"), 10) + parseInt(this.$scrollCont.css("border-bottom-width"), 10);

				this.$scrollCont.height(parentHeight - siblingsHeight - vertBorder);
			},
			update: function (contentWidth, contentHeight) {
				var newLeft,
					newTop,
					contentLenX,
					contentLenY;

				contentLenX = contentWidth || this.$contentCont.width() - handleContLen;
				contentLenY = contentHeight || this.$contentCont.height();
				this.scrollBarLen.y = this.$scrollCont.height();
				
				// Will the hortizontal scrollbar need to be created?
				this.scrollBarLen.x = this.$scrollCont.width();
				if (this.$handleX && contentLenX > this.scrollBarLen.x - handleContLen) {
					// If yes, add the length of the scrollbar to the content because the vertical scroll will need to scroll further
					contentLenY += handleContLen;
					
					// Will the vertical scrollbar need to be created?
					if (contentLenY > this.scrollBarLen.y) {
						this.scrollBarLen.x -= handleContLen;
					}
					
					this.$handleX.parent(".DT_scrollHandleContX").width(this.scrollBarLen.x);
					
					if (contentLenX > this.scrollBarLen.x) {
						this.multiplier.x = contentLenX / this.scrollBarLen.x;
						this.handleLen.x = this.scrollBarLen.x / this.multiplier.x;
						newLeft = parseInt(this.$scrollingCont.css("left"), 10) / -this.multiplier.x;
						
						if (newLeft + this.handleLen.x > this.scrollBarLen.x) {
							newLeft = this.scrollBarLen.x - this.handleLen.x;
							this.$scrollingCont.css("left", newLeft * -this.multiplier.x);
						}
						
						this.$handleX.css("left", newLeft);
						this.$handleX.width(this.handleLen.x);
						this.$handleX.parent(".DT_scrollHandleContX").show();
					} else {
						this.$scrollingCont.css("left", 0);
						this.$handleX.parent(".DT_scrollHandleContX").hide();
					}
					
				} else {
					this.$scrollingCont.css("left", 0);
					this.$handleX.parent(".DT_scrollHandleContX").hide();
				}

				// Add the width of the bottom scrollbar because if present, it will hide content behind it
				if (contentLenY > this.scrollBarLen.y) {
						
					this.multiplier.y = contentLenY / this.scrollBarLen.y;
					this.handleLen.y = this.scrollBarLen.y / this.multiplier.y;
					newTop = parseInt(this.$scrollingCont.css("top"), 10) / -this.multiplier.y;
					
					if (newTop + this.handleLen.y > this.scrollBarLen.y) {
						newTop = this.scrollBarLen.y - this.handleLen.y;
						this.$scrollingCont.css("top", newTop * -this.multiplier.y);
					}
					
					this.$handleY.css("top", newTop);
					this.$handleY.height(this.handleLen.y);
					
					// Resize the scrolling container to accommodate the space needed for the vertical scrollbar
					this.$scrollingCont.width(this.$scrollCont.width() - handleContLen);
					
					this.$handleY.parent(".DT_scrollHandleContY").show();
				} else {
					this.$scrollingCont.width("100%");
					this.$scrollingCont.css("top", 0);
					this.$handleY.parent(".DT_scrollHandleContY").hide();
				}
			}
		};
		
	}());

	function prepareDropMenu() {
		var $openMenu,
			callback,
			callbackObj = UI.callbacks.dragMenu;
		
		// Hide the open menu if the mouse is pressed anywhere outside the open menu
		function closeMenu() {
			$openMenu.click();
		}
		
		$(".DT_dropMenu > li").mousedown(function (e) {
			// Prevent the closeMenu from being called twice (prevents bubbling)
			e.stopPropagation();
			
			// Prevent user from accidentally selecting text if double clicked
			e.preventDefault();
		}).click(function (e) {
			
			if ($openMenu) {
				$openMenu.children("ul").hide();
				$openMenu.css("background-color", "");
				$document.unbind("mousedown", closeMenu);
				
				if ($openMenu.get(0) === this) {
					$openMenu = undefined;
					return;
				}
			}
			
			$openMenu = $(this);
			$openMenu.children("ul").show();
			$openMenu.css("background-color", "#616161");
			$document.bind("mousedown", closeMenu);
			
		}).mouseenter(function (e) {
			if ($openMenu && $openMenu.get(0) !== this) {
				$(this).click();
			}
		});
		
		// Bind callbacks
		for (callback in callbackObj) {
			if (callbackObj.hasOwnProperty(callback)) {
				$("#DT_" + callback + "Button").click((function () {
					var tempCB = callback;
					
					return function () {
						if (typeof callbackObj[tempCB] === "function") {
							callbackObj[tempCB]();
						}
					};
				
				}()));
			}
		}
	}
	
	function prepareRightBar() {
		var	$viewport = $("#DT_viewportCont"),
			$rightBar = $("#DT_rightBar"),
			$menusCont = $("#DT_menusCont"),
			$menuName = $("#DT_menuName"),
			// Menus
			$openMenu,
			$outliner = $("#DT_outliner"),
			$attrEditor = $("#DT_attrEditor"),
			$classEditor = $("#DT_classEditor");
			
		function updateOpenMenuScrollObj(method) {
			switch($openMenu) {
			case $outliner:
				outlinerScrollObj[method](UI.menus.outliner.getContentWidth());
				break;
			case $attrEditor:
				attrEditorScrollObj[method]();
				break;
			case $classEditor:
				classEditorScrollObj[method]();
				break;
			}
		}
		
		// Resize the DT_menusCont on page resize
		$window.resize(function () {
			// Temporarily hide the flickering scrollbar when resizing to prevent the $bottomBar from being undervalued
			//document.body.style.overflow = "hidden";
			
			// The padding is for aesthetic purposes
			var bottomPadding = 5;
			
			if ($rightBar.is(":visible")) {
				$viewport.width($bottomBar.width() - $rightBar.outerWidth());
			}
			
			// Use $bottomBar and not $rightBar to get the height. If you query the height of a hidden element,
			// you won't get the result. (In the case of $rightBar, you get the window's height.)
			$menusCont.height($bottomBar.height() - $menuName.outerHeight(true) - bottomPadding);
			
			//document.body.style.overflow = "";
		});

		// Handle the right bar's resize-w handle
		(function () {
			var minRBWidth = 300,
				maxRBWidth = 800,
				$mstrMenuCont = $("#DT_mstrMenuCont"),
				// Resize the scrollCont when the scrollbar is present and the width can no longer be 100%
				$scrollingCont = $(".DT_scrollingCont"),
				initWidths = {
					viewport: 0,
					rightBar: 0,
					mstrMenuCont: 0,
					scrollingCont: 0
				},
				initAbsMouseX;
			
			function removeEvents() {
				$document.unbind("mousemove", resize).unbind("mouseup", removeEvents);
			}
			
			function resize(e) {
				var dx = e.pageX - initAbsMouseX,
					rightBarWidth = initWidths.rightBar - dx;
				
				if (rightBarWidth < minRBWidth) {
					dx = initWidths.rightBar - minRBWidth;
				} else if (rightBarWidth > maxRBWidth) {
					dx = initWidths.rightBar - maxRBWidth;
				}
				
				$viewport.width(initWidths.viewport + dx);
				$rightBar.width(initWidths.rightBar - dx);
				$mstrMenuCont.width(initWidths.mstrMenuCont - dx);
				$scrollingCont.width(initWidths.scrollingCont - dx);
				
				updateOpenMenuScrollObj("update");
				if ($openMenu === $classEditor) {
					UI.menus.classBox.update();
				}
			}
			
			$("#DT_leftResizeBar").mousedown(function (e) {
				// Kill any selection events
				e.preventDefault();
				
				initAbsMouseX = e.pageX;
				
				initWidths.viewport = $viewport.width();
				initWidths.rightBar = $rightBar.width();
				initWidths.mstrMenuCont = $mstrMenuCont.width();
				initWidths.scrollingCont = $scrollingCont.filter(":visible").width();
				
				$document.mousemove(resize).mouseup(removeEvents);
			});
		
		}());

		// Handle notes resize handle
		(function () {
			var minHeight = 80,
				initMouseY,
				$textArea,
				$scrollCont,
				textAreaHeight,
				scrollContHeight;
			
			function resize(e) {
				var dy = e.pageY - initMouseY;
				
				if (textAreaHeight - dy < minHeight) {
					
					if (textAreaHeight - dy < minHeight / 2) {
						dy = textAreaHeight + $textArea.siblings().combOuterHeight();
						
						$textArea.hide();
						$textArea.siblings(".DT_notesTitle").hide();
					} else {
						$textArea.show();
						$textArea.siblings(".DT_notesTitle").show();
					}

				} else if (scrollContHeight + dy < minHeight) {
					dy = minHeight - scrollContHeight;
				}
				
				// Because the texarea has a box-sizing of border-box, padding and border are included into the height.
				// Therefore, we need to compensate by adding the border and padding values back.
				$textArea.height(textAreaHeight - dy + $textArea.vertBorderPadding());
				$scrollCont.height(scrollContHeight + dy);

				updateOpenMenuScrollObj("update");
			}
			
			function removeEvents() {
				$document.unbind("mousemove", resize).unbind("mouseup", removeEvents);
			}
			
			$(".DT_notesResizeHandle").mousedown(function (e) {
				// Prevent selection
				e.preventDefault();
			
				var $this = $(this);
				initMouseY = e.pageY;
				
				$textArea = $this.siblings("textarea");
				$scrollCont = $this.parent(".DT_notesCont").siblings(".DT_scrollCont");
				
				if ($textArea.is(":visible")) {
					textAreaHeight = $textArea.height();
				} else {
					textAreaHeight = -$textArea.siblings().combOuterHeight();
				}

				scrollContHeight = $scrollCont.height();
				
				$document.mousemove(resize).mouseup(removeEvents);
			});
		
		}());
		
		// Prepare menu accordions
		(function () {
			// Grab the first find as the height is the same for all
			var toolNameHeight = $(".DT_focusItemName").first().outerHeight(true),
				$accordions = $(".DT_accordionCont");
			
			$accordions.on("click", ".DT_accordionItemHead", function () {
				$(this).siblings(".DT_accordionItemBody").toggle();
				updateOpenMenuScrollObj("update");
			});
			
			$window.resize(function () {
				$accordions.each(function () {
					var $this = $(this);
					$this.height($menusCont.height() - $this.prevAll().combOuterHeight(true));
				});
				
				updateOpenMenuScrollObj("fillVertSpace");
				updateOpenMenuScrollObj("update");
			});
			
		}());
		
		// Handle menu opening
		(function () {
			function openRightBar() {
				$rightBar.show();
				$viewport.width($bottomBar.width() - $rightBar.outerWidth());
			}
			
			function closeRightBar() {
				$rightBar.hide();
				$viewport.width("100%");
			}
			
			function toggleMenu($menu, menuName) {
				if ($openMenu) {
					$openMenu.hide();
					
					if ($openMenu === $menu) {
						$openMenu = undefined;
						closeRightBar();
						return false;
					}
				}
				
				openRightBar();
				$openMenu = $menu;
				$openMenu.show();
				$menuName.children("span").text(menuName);
				return true;
			}
			
			$("#DT_closeRightBar").click(function () {
				toggleMenu($openMenu);
			});

			UI.callbacks.dragMenu.outliner = function () {
				if (toggleMenu($outliner, "Outliner")) {
					outlinerScrollObj.update(UI.menus.outliner.getContentWidth());
					outlinerScrollObj.fillVertSpace();
				}
			};
			
			UI.callbacks.dragMenu.attrEditor = function () {
				if (toggleMenu($attrEditor, "Attribute Editor")) {
					attrEditorScrollObj.update();
					attrEditorScrollObj.fillVertSpace();
				}
			};
			
			UI.callbacks.dragMenu.classEditor = function () {
				if (toggleMenu($classEditor, "Class Editor")) {
					classEditorScrollObj.update();
					classEditorScrollObj.fillVertSpace();
					UI.menus.classBox.update();
				}
			};
			
		}());
	}
	
	function prepareOutliner() {
		var	$itemCont = $("#DT_outliner ul:first-child"),
			selectedItems = [],
			items = [];
		
		function getItemFromLI(element) {
			var i = items.length;
			while (i) {
				i -= 1;
				if (items[i].$li.get(0) === element) {
					return items[i];
				}
			}
		}
		
		function indexOutlinerItems() {
			var tempItem,
				index = 0,
				indexedItems = [],
				indexChildren = function ($childCont) {
					var children = $childCont.children("li").get();
					
					for (var i = 0, j = children.length; i < j; i++) {
						tempItem = getItemFromLI(children[i]);
						tempItem.index = index;
						index += 1;
						indexedItems.push(tempItem);
						indexChildren(tempItem.$childCont);
					}
				};
			
			indexChildren($itemCont);

			items = indexedItems;
		}
		
		function selectItem(item) {
			item.select();
		
			// Sort the selectedItems array by item index
			for (var i = 0, j = selectedItems.length; i < j; i++) {
				if (item.index < selectedItems[i].index) {
					selectedItems.splice(i, 0, item);
					return;
				}
			}
			
			selectedItems.push(item);
		}
		
		function deselectItem(item) {
			item.deselect();
			selectedItems.splice(selectedItems.indexOf(item), 1);
		}
		
		function deselectAll() {
			var i = selectedItems.length;

			while (i) {
				i -= 1;
				selectedItems[i].deselect();
			}
			
			selectedItems = [];
		}
		
		function shiftSelect(item, lastSelectedItem) {
			var index = item.index,
				lastSelectedIndex = lastSelectedItem.index;
				
			if (lastSelectedIndex < index) {
				while (lastSelectedIndex < index) {
					lastSelectedIndex += 1;
					selectItem(items[lastSelectedIndex]);
				}
			} else {
				while (lastSelectedIndex > index) {
					lastSelectedIndex -= 1;
					selectItem(items[lastSelectedIndex]);
				}
			}
		}
		
		function handleSelection(item, lastSelectedItem) {
			if (UI.keys.shift) {
				if (lastSelectedItem) {
					shiftSelect(item, lastSelectedItem);
				}
				selectItem(item);
			} else if (UI.keys.ctrl) {
				if (!item.selected) {
					selectItem(item);
				} else {
					deselectItem(item);
				}
			} else {
				deselectAll();
				selectItem(item);
			}
		}
		
		
		function OutlinerItem(tool, parentItem) {
			this.$li = createItem(tool);
			this.$childCont = this.$li.children(".DT_outlinerItemChildren");
			this.$head = this.$li.children(".DT_outlinerItemHead");
			this.tool = tool;
			this.selected = false;
			this.index = undefined;
			
			items.push(this);
			
			if (parentItem) {
				parentItem.append(this);
				indexOutlinerItems();
			} else {
				$itemCont.append(this.$li);
				// Indices are zero-based
				this.index = items.length - 1;
			}
		}
		
		OutlinerItem.prototype = {
			updateName: function (name) {
				this.$head.children("span").text(name);
			},
			append: function (childItem) {
				this.$childCont.append(childItem.$li);
			},
			before: function (item) {
				this.$li.before(item.$li);
			},
			select: function () {
				if (this.selected) {
					return;
				}
				this.selected = true;
				
				this.$head.addClass("DT_selected");

				if (typeof UI.menus.outliner.select === "function") {
					UI.menus.outliner.select(this);
				}
			},
			deselect: function () {
				if (!this.selected) {
					return;
				}
				this.selected = false;

				this.$head.removeClass("DT_selected");

				if (typeof UI.menus.outliner.deselect === "function") {
					UI.menus.outliner.deselect(this);
				}
			}
		};
		
		function createItem(name) {
			var $li = $(document.createElement("li")),
				$head = $(document.createElement("div")).addClass("DT_outlinerItemHead"),
				$before	= $(document.createElement("div")).addClass("DT_outlinerBefore"),
				$toggle = $(document.createElement("div")).addClass("DT_toggleOutlinerItem"),
				span = $(document.createElement("span")).text(name),
				$lineConnect = $(document.createElement("div")).addClass("DT_itemConnectLine"),
				$childCont = $(document.createElement("ul")).addClass("DT_outlinerItemChildren");
			
			$toggle.text("-");
			
			$head.append($before, $toggle, span, $lineConnect);
			return $li.append($head, $childCont);
		}
		
		(function () {
			var draggingItems = false,
				method = "append",
				lastSelectedItem,
				beginHead;
			
			function mouseup() {
				draggingItems = false;
				$document.unbind("mouseup", mouseup);
			}
		
			$("#DT_outliner ul").on("click", ".DT_toggleOutlinerItem", function () {
				var $this = $(this),
					$childrenCont = $this.parent(".DT_outlinerItemHead").siblings(".DT_outlinerItemChildren");
				
				if (!$childrenCont.is(":empty")) {
					if ($childrenCont.is(":visible")) {
						$childrenCont.hide();
						$this.text("+");
					} else {
						$childrenCont.show();
						$this.text("-");
					}
				}
			}).on("click", ".DT_outlinerItemHead", function (e) {
				if (e.target.className !== "DT_toggleOutlinerItem") {
					var item = getItemFromLI(this.parentNode);
					handleSelection(item, lastSelectedItem);
					lastSelectedItem = item;
				}
			}).on("mousedown", ".DT_outlinerItemHead", function (e) {
				// Prevent selection
				e.preventDefault();
				
				if ($(this).hasClass("DT_selected")) {
					draggingItems = true;
					beginHead = this;
					$itemCont.addClass("DT_userIsDragging");
					$document.mouseup(mouseup);
				}
			}).on("mouseup", ".DT_outlinerItemHead", function () {
				$itemCont.removeClass("DT_userIsDragging");
				
				if (draggingItems && beginHead !== this) {
					var item = getItemFromLI(this.parentNode);
					
					draggingItems = false;
					
					for (var i = 0, j = selectedItems.length; i < j; i++) {
						// Make sure we're not trying to append an item to itself and also that we're not trying to append a parent to a child
						if (selectedItems[i] !== item && !jQuery.contains(selectedItems[i].$childCont.get(0), item.$li.get(0))) {
							item[method](selectedItems[i]);
						}
					}
					
					this.style.borderColor = "";
					indexOutlinerItems();
				}
			}).on("mouseover", ".DT_outlinerBefore", function (e) {
				if (draggingItems) {
					method = "before";
					this.parentNode.style.borderTopColor = "black";
				}
			}).on("mouseover", ".DT_outlinerItemHead", function (e) {
				// Prevent bubbling from DT_itemConnectLine from triggering this event handler
				// I don't like e.stopPropagation. It's messy and interferes with normal event flow.
				if (draggingItems && !/DT_outlinerBefore|DT_itemConnectLine/.test(e.target.className)) {
					method = "append";
					this.style.borderTopColor = "black";
					this.style.borderBottomColor = "black";
				}
			}).on("mouseout", ".DT_outlinerItemHead", function () {
				this.style.borderColor = "";
			});

		}());
		
		return {
			items: items,
			getContentWidth: function () {
				return $itemCont.parent(".DT_scrollContentCont").width() - 4850;
			},
			newItem: function (tool, parentItem) {
				return new OutlinerItem(tool, parentItem);
			}
		};
	}
	
	function prepareClassBox() {
		var $classBox = $("#DT_classBox"),
			classBox = (function () {
				var marginLeft = 10,
					top = 20,
					listSize = 74,
					clumpSize = 20,
					$itemCont = $("#DT_classBox .DT_scrollContentCont"),
					items = [],
					selectedItems = [];
					
				$("#DT_newClass").click(function () {
					UI.menus.classBox.newClass("class" + items.length);
				});
				
				$("#DT_destroyClass").click(function () {
					UI.menus.classBox.destroyClass(selectedItems[0]);
				});

				function ClassItem(name) {
					this.name = name;
					
					this.$el = $('<div class="DT_classBoxItem"></div>');
					this.$preview = $('<div class="DT_classBoxPreview DT_borderBox"></div>');
					this.$name = $('<div class="DT_classBoxItemName DT_borderBox">' + name + '</div>');
					
					this.$el.append(this.$name, this.$preview);
					this.$preview.css("background-color", "#" + ( 0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
					
					this.selected = false;
					items.push(this);
					classBox.append(this);
				}
				
				ClassItem.prototype = {
					select: function () {
						this.selected = true;
						this.$el.addClass("DT_selected");
					},
					deselect: function () {
						this.selected = false;
						this.$el.removeClass("DT_selected");
					},
					destroy: function () {
						this.$el.remove();
					}
				};

				return {
					newClass: function (name) {
						var item = new ClassItem(name);
						this.update();
						return item;
					},
					destroyClass: function (item) {
						var selectedIndex = selectedItems.indexOf(item);
						
						if (selectedIndex !== -1) {
							selectedItems.splice(selectedIndex, 1);
						}
						
						items.splice(items.indexOf(item), 1);
			
						item.destroy();
						
						this.rebuild();
					},
					rebuild: function () {
						var left = marginLeft;
					
						for (var i = 0, j = items.length; i < j; i++) {
							items[i].$el.css({
								top: top,
								left: left
							});
							
							left += marginLeft + listSize;
						}
					},
					update: function () {
						var listWidth = this.getListWidth();
						
						// Will the scrollbar be created?
						if (listWidth > $classBox.width()) {
							if (top !== 6) {
								top = 6;
								this.rebuild();
							}
						} else if (top !== 13) {
							top = 13;
							this.rebuild();
						}
						
						classBoxScrollCont.update(this.getListWidth());
					},
					deselectAll: function () {
						var i = selectedItems.length;
						
						while (i) {
							i -= 1;
							selectedItems[i].deselect();
						}
						
						selectedItems = [];
					},
					shiftSelect: function (item) {
						var lastSelectedItem = selectedItems[selectedItems.length - 1],
							i = items.length;
						
						if (item === lastSelectedItem) {
							return;
						}
						
						while (i) {
							i -= 1;
							if (items[i] === lastSelectedItem) {
								while (i) {
									i -= 1;
									if (items[i] === item) {
										return;
									}
									this.selectItem(items[i]);
								}

							}
							if (items[i] === item) {
								while (i) {
									i -= 1;
									if (items[i] === lastSelectedItem) {
										return;
									}
									this.selectItem(items[i]);
								}
							}
						}
					},
					selectItem: function (item) {
						if (item.selected) {
							return false;
						}
						item.select();
						selectedItems.push(item);
						return item;
					},
					deselectItem: function (item) {
						if (!item.selected) {
							return false;
						}
						item.deselect();
						selectedItems.splice(selectedItems.indexOf(item), 1);
						return item;
					},
					handleSelection: function (item) {
						if (UI.keys.shift) {
							if (selectedItems.length > 0) {
								this.shiftSelect(item);
							}
							this.selectItem(item);
						} else if (UI.keys.ctrl) {
							if (!item.selected) {
								this.selectItem(item);
							} else {
								this.deselectItem(item);
							}
						} else {
							this.deselectAll();
							this.selectItem(item);
						}
					},
					getItemFromEl: function (element) {
						var i = items.length;
						
						while (i) {
							i -= 1;
							if (items[i].$el.get(0) === element) {
								return items[i];
							}
						}
						
						return false;
					},
					append: function (classItem) {
						var left = items.length * marginLeft + (items.length - 1) * listSize;

						classItem.$el.css({
							left: left,
							top: top,
							width: listSize,
							height: listSize
						}).appendTo($itemCont);
						
					},
					getListWidth: function () {
						return marginLeft + items.length * (marginLeft + listSize);
					}
				};
		}());
		
		$("#DT_layoutType").hover(function() {
			$(this).children().stop(true, true).fadeIn();
		}, function() {
			$(this).children().stop(true, true).fadeOut();
		});
		
		$classBox.on("click", ".DT_classBoxItem", function () {
			var item = classBox.getItemFromEl(this);
			UI.menus.classBox.handleSelection(item);
		});
		
		return classBox;
	}
	
	function prepareAutoCompleteList() {
		var cssProperties = ["azimuth", "background-attachment", "background-color", "background-image", "background-position", "background-repeat", "background", "border-collapse", "border-color", "border-spacing", "border-style", "border-top", "border-right", "border-bottom", "border-left", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "border-top-style", "border-right-style", "border-bottom-style", "border-left-style", "border-top-width", "border-right-width", "border-bottom-width", "border-left-width", "border-width", "border", "bottom", "caption-side", "clear", "clip", "color", "content", "counter-increment", "counter-reset", "cue-after", "cue-before", "cue", "cursor", "direction", "display", "elevation", "empty-cells", "float", "font-family", "font-size", "font-style", "font-variant", "font-weight", "font", "height", "left", "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type", "list-style", "margin-right", "margin-left", "margin-top", "margin-bottom", "margin", "max-height", "max-width", "min-height", "min-width", "orphans", "outline-color", "outline-style", "outline-width", "outline", "overflow", "padding-top", "padding-right", "padding-bottom", "padding-left", "padding", "page-break-after", "page-break-before", "page-break-inside", "pause-after", "pause-before", "pause", "pitch-range", "pitch", "play-during", "position", "quotes", "richness", "right", "speak-header", "speak-numeral", "speak-punctuation", "speak", "speech-rate", "stress", "table-layout", "text-align", "text-decoration", "text-indent", "text-transform", "top", "unicode-bidi", "vertical-align", "visibility", "voice-family", "volume", "white-space", "widows", "width", "word-spacing", "z-index"];
		
		$("#DT_toolCssPropertyInput").autocomplete({
			source: cssProperties,
			delay: 0,
			autoFocus: true,
			appendTo: "#DT_attrEditor",
			select: function (e, ui) {
				ui.item.value = "";
			}
		});
		
		$("#DT_classCssPropertyInput").autocomplete({
			source: cssProperties,
			delay: 0,
			autoFocus: true,
			appendTo: "#DT_classEditor",
			select: function (e, ui) {
				ui.item.value = "";
			}
		});
	}

	return {
		init: function () {
			$window.resize(function () {
				$bottomBar.height($window.height() - $topBar.outerHeight());
			});
			
			outlinerScrollObj = new ScrollCont($("#DT_outliner .DT_scrollCont"));
			attrEditorScrollObj = new ScrollCont($("#DT_attrEditor .DT_accordionCont .DT_scrollCont"));
			classEditorScrollObj = new ScrollCont($("#DT_classEditor .DT_accordionCont .DT_scrollCont"));
			classBoxScrollCont = new ScrollCont($("#DT_classBox .DT_scrollCont"));
			
			prepareDropMenu();
			prepareRightBar();
			
			prepareAutoCompleteList();
			
			this.keys.init();
			this.menus.outliner = prepareOutliner();
			this.menus.classBox = prepareClassBox();
			
			// Fake a resize and build the UI
			$window.resize();
		},
		menus: {
			outliner: undefined,
			classBox: undefined
		},
		callbacks: {
			dragMenu: {
				newPage: undefined,
				openPage: undefined,
				save: undefined,
				saveAs: undefined,
				"export": undefined,
				undo: undefined,
				redo: undefined,
				cut: undefined,
				copy: undefined,
				paste: undefined,
				selectAll: undefined,
				outliner: undefined,
				attrEditor: undefined,
				classEditor: undefined,
				showGrid: undefined,
				gridSize: undefined,
				snapping: undefined,
				preview: undefined,
				docs: undefined,
				tutorials: undefined,
				about: undefined
			},
			outlinerItem: {
				select: undefined,
				deselect: undefined
			}
		},
		keys: {
			ctrl: false,
			shift: false,
			space: false,
			del: false,
			init: function () {
				// Handle Keyboard Shortcuts
				var lastKeyFired = false;
				$document.keydown(function (e) {
					if (lastKeyFired === e.keyCode) {
						return;
					}

					lastKeyFired = e.keyCode;
					UI.keys.toggleKeys(e, true);
					
				}).keyup(function (e) {
					lastKeyFired = false;
					UI.keys.toggleKeys(e, false);
				});
				
				$window.blur(function () {
					UI.keys.allOff();
				});
			},
			toggleKeys: function (e, on) {
				
				switch (e.keyCode) {
				case 17:
					this.ctrl = on;
					break;
				case 16:
					this.shift = on;
					break;
				case 32:
					this.space = on;
					break;
				case 46:
					this.del = on;
					break;
				}
				
			},
			allOff: function () {
				var key;

				for (key in this) {
					if (this.hasOwnProperty(key) && (typeof this[key] !== "function")) {
						this[key] = false;
					} 
				}
			}
		}
	};

}(jQuery));