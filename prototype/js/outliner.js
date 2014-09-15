// Dependencies: jQuery, DIVTREE.ui, BoxTool, Utils

(function (undefined) {

	"use strict";
	var ItemHeight = 25,
		Keys, // Set to the custom DIVTREE.ui.keys global in the outliner's constructor
		ReposItemIcon = {
			active: false,
			element: $('<div class="OUTLINER_hoverIcon"></div>').get(0),
			len: 20,
			initPos: {x: 0, y: 0},
			initMousePos: {x: 0, y: 0},
			hoveredItemMenu: undefined,
			insertPos: undefined,
			create: undefined,
			move: undefined,
			destroy: undefined
		};
	
	function Outliner(opts) {
		this.$container = $(opts.container);
		this.$itemContainer = $('<div class="OUTLINER_itemCont"></div>');

		this.items = [];
		this.selectedItems = [];
		
		Keys = DIVTREE.ui.keys;
		
		this.init();
		return this;
	}
	
	function OutlinerItem(opts) {
		var name = opts.name || "OutlinerItem";
		this.getName = function () { return name; };
		this.setName = function (newName) {
			name = newName;
			this.$element.children(".OUTLINER_itemMenu").children(".OUTLINER_itemName").text(newName);
		};
		
		this.tool = opts.tool;
		this.outliner = opts.outliner;
		this.$parentContainer = opts.parentContainer;
		this.selectCallback = opts.select;
		this.deselectCallback = opts.deselect;
		this.appendCallback = opts.append;
		this.beforeCallback = opts.before;
		
		this.$element = $('<div class="OUTLINER_item"></div>');
		this.$itemContainer = $('<div class="OUTLINER_childItemsCont"></div>');
		this.index = this.outliner.items.length;
		this.selected = false;
		
		this.init();
		return this;
	}
	
	ReposItemIcon.create = function (e) {
		ReposItemIcon.active = true;
		
		ReposItemIcon.initPos.x = e.pageX - ReposItemIcon.len;
		ReposItemIcon.initPos.y = e.pageY - ReposItemIcon.len;
		
		ReposItemIcon.initMousePos.x = e.pageX;
		ReposItemIcon.initMousePos.y = e.pageY;
		
		$(ReposItemIcon.element).css({
			position: "absolute",
			left: ReposItemIcon.initPos.x,
			top: ReposItemIcon.initPos.y,
			width: ReposItemIcon.len,
			height: ReposItemIcon.len,
			backgroundColor: "green",
			zIndex: 9999
		}).appendTo(document.body);
		
		Utils.disableDocSelection();
		$(document).mousemove(ReposItemIcon.move).mouseup(ReposItemIcon.destroy);
	};
	
	ReposItemIcon.move = function (e) {

		ReposItemIcon.element.style.left = ReposItemIcon.initPos.x + (e.pageX - ReposItemIcon.initMousePos.x) + "px";
		ReposItemIcon.element.style.top = ReposItemIcon.initPos.y + (e.pageY - ReposItemIcon.initMousePos.y) + "px";
		
		if (ReposItemIcon.hoveredItemMenu) {
			var offset = $(ReposItemIcon.hoveredItemMenu).offset(),
				dy = e.pageY - offset.top;

			if (e.pageX > offset.left) {
				if (dy >= 0 && dy <= 7) {
					ReposItemIcon.hoveredItemMenu.style.borderTopWidth = "2px";
					ReposItemIcon.hoveredItemMenu.style.borderBottomWidth = "0px";
					ReposItemIcon.element.style.backgroundColor = "green";
					ReposItemIcon.insertPos = "before";
				} else if (dy >= 0 && e.pageY < offset.top + ItemHeight) {
					ReposItemIcon.hoveredItemMenu.style.borderTopWidth = "2px";
					ReposItemIcon.hoveredItemMenu.style.borderBottomWidth = "2px";
					ReposItemIcon.element.style.backgroundColor = "green";
					ReposItemIcon.insertPos = "append";
				} else {
					ReposItemIcon.hoveredItemMenu.style.borderTopWidth = "0px";
					ReposItemIcon.hoveredItemMenu.style.borderBottomWidth = "0px";
					ReposItemIcon.element.style.backgroundColor = "red";
					ReposItemIcon.hoveredItemMenu = undefined;
				}
			} else {
				ReposItemIcon.hoveredItemMenu.style.borderTopWidth = "0px";
				ReposItemIcon.hoveredItemMenu.style.borderBottomWidth = "0px";
				ReposItemIcon.element.style.backgroundColor = "red";
				ReposItemIcon.hoveredItemMenu = undefined;
			}
		}
	};
	
	ReposItemIcon.destroy = function (e) {
		ReposItemIcon.active = false;
		
		if (ReposItemIcon.hoveredItemMenu) {
			ReposItemIcon.hoveredItemMenu.style.borderTopWidth = "0px";
			ReposItemIcon.hoveredItemMenu.style.borderBottomWidth = "0px";
		}
		
		$(ReposItemIcon.element).remove();
		
		Utils.enableDocSelection();
		$(document).unbind("mousemove", ReposItemIcon.move).unbind("mouseup", ReposItemIcon.destroy);
	};
	
	OutlinerItem.prototype = {
		init: function () {
			var $menu = $('<div class="OUTLINER_itemMenu"></div>'),
				$expandCollapse = $('<div class="OUTLINER_expandCollapse"></div>'),
				$name = $('<div class="OUTLINER_itemName"></div>');
			
			this.$element.append($menu, this.$itemContainer);
			
			$menu.css("height", ItemHeight).append($expandCollapse, $name);
			$expandCollapse.css({width: ItemHeight, height: ItemHeight}).text("-");
			$name.css({marginLeft: ItemHeight, height: ItemHeight}).text(this.getName());
			this.$itemContainer.css("paddingLeft", ItemHeight);
			
			this.$parentContainer.append(this.$element);

			this.outliner.updateScrollBars();
		},
		shiftSelect: function () {
			var index = this.index,
				lastSelectedIndex = this.outliner.selectedItems[this.outliner.selectedItems.length - 1].index;
				
			if (lastSelectedIndex < index) {
				while (lastSelectedIndex < index) {
					lastSelectedIndex += 1;
					this.outliner.items[lastSelectedIndex].select();
				}
			} else {
				while (lastSelectedIndex > index) {
					lastSelectedIndex -= 1;
					this.outliner.items[lastSelectedIndex].select();
				}
			}
			
		},
		handleSelection: function () {
			if (!Keys.ctrl && !Keys.shift) {
				this.outliner.deselectAll();
				this.select();
			} else if (Keys.ctrl) {
				if (!this.selected) {
					this.select();
				} else {
					this.deselect();
				}
			} else if (Keys.shift) {
				this.shiftSelect();
				this.select();
			}
		},
		select: function () {
			if (!this.selected) {
				var i = this.outliner.selectedItems.length;
				
				this.$element.children(".OUTLINER_itemMenu").addClass("OUTLINER_itemSelected");
				this.selected = true;
				
				this.outliner.selectItem(this);

				if (this.selectCallback) {
					this.selectCallback();
				}
			}
		},
		deselect: function () {
			if (this.selected) {
				this.$element.children(".OUTLINER_itemMenu").removeClass("OUTLINER_itemSelected");
				this.selected = false;
				
				this.outliner.deselectItem(this);
				
				if (this.deselectCallback) {
					this.deselectCallback();
				}
			}
		},
		appendChildItem: function (newItem, insertPos) {
			insertPos = insertPos || "append";
		
			switch (insertPos) {
			case "append":
				this.$itemContainer.append(newItem.$element);
				if (this.appendCallback) {
					this.appendCallback(newItem);
				}
				break;
			case "before":
				newItem.$element.insertBefore(this.$element);
				if (this.beforeCallback) {
					this.beforeCallback(newItem);
				}
				break;
			}
			
		},
		destroy: function () {
			var outlinerItems = this.outliner.items,
				i = outlinerItems.length;
			
			while (i) {
				i -= 1;
				if (outlinerItems[i] === this) {
					outlinerItems.splice(i, 1);
				}
			}
			
			this.$element.remove();
		}
	};
	
	Outliner.prototype = {
		init: function () {
			this.$itemContainer.appendTo(this.$container);

			this.initEvents();
		},
		getItemFromElement: function (element) {
			var i = this.items.length;
			
			while (i) {
				i -= 1;
				if (this.items[i].$element.get(0) === element) {
					return this.items[i];
				}
			}
		},
		deselectAll: function () {
			while (this.selectedItems[0]) {
				this.selectedItems[0].deselect();
			}
		},
		initEvents: function () {
			var outliner = this,
				mouseDownItem;
				
			this.$itemContainer.on("click", ".OUTLINER_itemName", function (e) {
				var item = outliner.getItemFromElement(this.parentNode.parentNode);
				item.handleSelection();
			}).on("mousedown", ".OUTLINER_itemName", function (e) {
				Utils.disableDocSelection();

				var itemElement = this.parentNode.parentNode,
					item = outliner.getItemFromElement(itemElement);
				
				mouseDownItem = itemElement;
				
				if (item.selected && !Keys.ctrl && !Keys.shift) {
					ReposItemIcon.hoveredItemMenu = this.parentNode;
					ReposItemIcon.create(e);
				}
			}).on("mouseup", ".OUTLINER_itemMenu", function () {
				// Let the mouseup event bubble up to the body to trigger ReposItemIcon.destroy.
				
				var itemElement = this.parentNode,
					item;
					
				if (ReposItemIcon.active && mouseDownItem !== itemElement) {
					item = outliner.getItemFromElement(itemElement);
					
					// Only BoxTools support children
					if (item.tool instanceof BoxTool) {
					
						for (var i = 0, j = outliner.selectedItems.length; i < j; i++) {
							if (outliner.selectedItems[i] !== item && !jQuery.contains(outliner.selectedItems[i].$itemContainer.get(0), item.$element.get(0))) {
								item.appendChildItem(outliner.selectedItems[i], ReposItemIcon.insertPos);
							}
						}
						
						outliner.indexItems();
						outliner.updateScrollBars();
					}
				}
			}).on("mouseenter", ".OUTLINER_itemMenu", function (e) {
				if (ReposItemIcon.active) {
					if (ReposItemIcon.hoveredItemMenu && ReposItemIcon.hoveredItemMenu !== this) {
						ReposItemIcon.hoveredItemMenu.style.borderTopWidth = "0px";
						ReposItemIcon.hoveredItemMenu.style.borderBottomWidth = "0px";
					}
					
					ReposItemIcon.hoveredItemMenu = this;
				}
			}).on("mousedown", ".OUTLINER_expandCollapse", function (e) {
				var	$button = $(this),
					$itemContainer = $button.parent().parent().children(".OUTLINER_childItemsCont");
				
				if (!$itemContainer.is(":empty")) {
					if ($itemContainer.is(":visible")) {
						$button.text("+");
						$itemContainer.hide();
					} else {
						$button.text("-");
						$itemContainer.show();
					}
				}
				
				outliner.updateScrollBars();

			});
		},
		indexItems: function () {
			var item,
				index = 0,
				outliner = this,
				indexedItemArray = [],
				
				indexChildren = function ($element) {
					var children = $element.children(".OUTLINER_item").get();
					
					for (var i = 0, j = children.length; i < j; i++) {
						item = outliner.getItemFromElement(children[i]);
						item.index = index;
						index += 1;
						indexedItemArray.push(item);
						indexChildren(item.$itemContainer);
					}
				};
			
			indexChildren(this.$itemContainer);

			this.items = indexedItemArray;
		},
		getLeftMostPos: function () {
			var i = this.items.length,
				tempLeft = 0,
				leftMost = 0;
			
			while (i) {
				i -= 1;
				tempLeft = this.items[i].$element.offset().left;
				if (tempLeft > leftMost) {
					leftMost = tempLeft;
				}
			}
			
			return leftMost;
		},
		updateScrollBars: function () {
			if (this.$container.is(":visible")) {
				var outlinerLeftDisp = Math.abs(parseInt($("#DT_outlinerCont").css("left"), 10)) || 0,
					maxLeftPos = this.getLeftMostPos() + outlinerLeftDisp;
				
				DIVTREE.ui.rightBarScroll.update(maxLeftPos);
			}
		},
		selectItem: function (item) {
			// Sort the selectedItems array by item index
			for (var i = 0, j = this.selectedItems.length; i < j; i++) {
				if (item.index < this.selectedItems[i].index) {
					this.selectedItems.splice(i, 0, item);
					return;
				}
			}
			
			this.selectedItems.push(item);
		},
		deselectItem: function (item) {
			var i = this.selectedItems.length;
			
			while (i) {
				i -= 1;
				if (this.selectedItems[i] === item) {
					this.selectedItems.splice(i, 1);
				}
			}
		},
		addItem: function (opts) {
			opts = opts || {};
			
			var item = new OutlinerItem({
				outliner: this,
				name: opts.name || "OutlinerItem" + this.items.length,
				select: opts.select,
				deselect: opts.deselect,
				append: opts.append,
				before: opts.before,
				tool: opts.tool,
				parentContainer: (opts.parentItem && opts.parentItem.$itemContainer) || this.$itemContainer
			});
			
			this.items.push(item);

			this.indexItems();
			
			return item;
		},
		removeItem: function (item) {
			item.destroy();
		},
		destroy: function () {
			this.$itemContainer.remove();
			this.items = [];
		}
	};
	
	// Expose Outliner to the global object
	window.Outliner = Outliner;
	
}());