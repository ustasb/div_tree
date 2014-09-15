// Dependencies: jQuery, Utils

(function (undefined) {

	"use strict";
	var	ItemPadding = 10,
		ItemLength = 10,
		MouseIsDown = false,
		ItemIcon = {
			active: false,
			len: 30,
			item: undefined,
			initPos: {x: 0, y: 0},
			initMousePos: {x: 0, y: 0},
			$element: undefined
		},
		ScrollBarHeight = 10,
		ScrollData = {
			active: false,
			initX: 0,
			initMouseX: 0,
			menu: undefined
		};

	function DragDropMenu(opts) {
		this.$element = $(opts.element);
		this.delay = opts.delay || 0;
		this.width = opts.width;
		this.height = opts.height;
		this.items = [];
		this.$itemCont = undefined;
		this.$ddmWrapper = undefined;
		this.$scrollBar = undefined;
		
		this.scrollHandleWidth = 0;
		this.scrollMultiplier = 0;

		ItemLength = this.height - (ItemPadding * 2);
		
		this.initUI();
		return this;
	}

	function MenuItem(opts) {
		this.parentMenu = opts.menu;
		this.name = opts.name;
		this.$element = undefined;
		this.cbSelect = opts.select;
		this.cbStart = opts.start;
		this.cbMove = opts.move;
		this.cbStop = opts.stop;
		
		this.initUI();
		return this;
	}
		
	$(document).mousemove(function (e) {
		if (ScrollData.active) {
			ScrollData.menu.scroll(e);
		}
		
		if (ItemIcon.active) {
			MenuItem.moveItemIcon(e);
		}
	}).mouseup(function (e) {
		ScrollData.active = false;
		MouseIsDown = false;
		
		if (ItemIcon.active) {
			MenuItem.killItemIcon(e);
			ItemIcon.active = false;
		}
	});
	
	MenuItem.createItemIcon = function (e, item) {
		ItemIcon.active = true;
	
		ItemIcon.$element = $('<div class="DDM_itemIcon"></div>');
		ItemIcon.item = item;
		
		ItemIcon.initMousePos.x = e.pageX;
		ItemIcon.initMousePos.y = e.pageY;
		ItemIcon.initPos.x = e.pageX - ItemIcon.len;
		ItemIcon.initPos.y = e.pageY - ItemIcon.len;
		
		ItemIcon.$element.css({
			position: "absolute",
			left: e.pageX - ItemIcon.len,
			top: e.pageY - ItemIcon.len,
			width: ItemIcon.len,
			height: ItemIcon.len,
			zIndex: 9900
		}).appendTo("body");
		
		if (ItemIcon.item.cbStart) {
			ItemIcon.item.cbStart({
				element: ItemIcon.$element.get(0),
				itemName: ItemIcon.item.name,
				mouseX: e.pageX, 
				mouseY: e.pageY
			});
		}
	};
	
	MenuItem.moveItemIcon = function (e) {
		var offset = 3,
			left = ItemIcon.initPos.x + (e.pageX - ItemIcon.initMousePos.x) - offset,
			top = ItemIcon.initPos.y + (e.pageY - ItemIcon.initMousePos.y) - offset;
		
		ItemIcon.$element.css({
			top: top,
			left: left
		}).appendTo("body");
		
		if (ItemIcon.item.cbMove) {
			ItemIcon.item.cbMove({
				element: ItemIcon.$element.get(0),
				itemName: ItemIcon.item.name, 
				mouseX: e.pageX, 
				mouseY: e.pageY
			});
		}
	};
	
	MenuItem.killItemIcon = function (e) {
		ItemIcon.$element.remove();
		
		Utils.enableDocSelection();
		
		if (ItemIcon.item.cbStop) {
			ItemIcon.item.cbStop({
				element: ItemIcon.$element.get(0),
				itemName: ItemIcon.item.name, 
				mouseX: e.pageX,
				mouseY: e.pageY
			});
		}
		
		ItemIcon.active = false;
	};

	MenuItem.prototype = {
		initUI: function () {
			this.$element = $('<div id="DDM_menuItem_' + this.name + '"class="DDM_menuItem"></div>');

			this.$element.css({
				position: "absolute",
				left: this.parentMenu.getItemsWidth(),
				top: ItemPadding,
				width: ItemLength,
				height: ItemLength,
				cursor: "pointer"
			}).appendTo(this.parentMenu.$itemCont);
		},
		select: function (e) {
			if (this.cbSelect) {
				this.cbSelect();
			}
			
			Utils.disableDocSelection();
			
			var item = this;
			setTimeout(function () {
				if (MouseIsDown) {
					MenuItem.createItemIcon(e, item);
				} else {
					Utils.enableDocSelection();
				}
			}, this.parentMenu.delay);
		}
	};
	
	DragDropMenu.prototype = {
		initUI: function () {
			this.$ddmWrapper = $('<div class="DDM_wrapper"></div>');	
			this.$itemCont = $('<div class="DDM_itemCont"></div>');

			this.$itemCont.css({
				position: "absolute",
				width: "100%",
				height: "100%"
			}).appendTo(this.$ddmWrapper);
			
			this.$ddmWrapper.css({
				position: "relative",
				width: "100%",
				height: "100%",
				overflow: "hidden"
			}).appendTo(this.$element);
			
			this.$element.css({
				"-webkit-user-select": "none",
				"-khtml-user-select": "none",
				"-moz-user-select": "none",
				"-o-user-select": "none",
				"user-select": "none"
			});
			
			this.resize();
			
			var thisMenu = this;
			this.$itemCont.on("mousedown", ".DDM_menuItem", function (e) {
				MouseIsDown = true;
				for (var i = 0, j = thisMenu.items.length; i < j; i++) {
					if (thisMenu.items[i].$element.get(0) === this) {
						thisMenu.items[i].select(e);
						break;
					}
				}
			});
		},
		resize: function (width, height) {
			if (width) {
				this.width = width;
			}
			if (height) {
				this.height = height;
			}
			this.$element.height(this.height).width(this.width);
			this.updateScrollBar();
		},
		getItemsWidth: function () {
			if (this.items[0]) {
				return this.items.length * (ItemLength + ItemPadding) + ItemPadding;
			} else {
				return ItemPadding;
			}
		},
		addItem: function (opts) {
			var item = new MenuItem({
				menu: this,
				name: opts.name,
				select: opts.select,
				start: opts.start,
				move: opts.move,
				stop: opts.stop
			});
			
			this.items.push(item);
			
			this.updateScrollBar();
			
			return item;
		},
		updateScrollBar: function () {
			var itemsCombWidth = this.getItemsWidth();
			
			if (itemsCombWidth > this.width) {
				this.scrollMultiplier = itemsCombWidth / this.width;
				this.scrollHandleWidth = Math.round(this.width / this.scrollMultiplier);
				
				if (!this.$scrollBar) {
					var $scrollBg = $('<div class="DDM_scrollBg"></div>'),
						thisMenu = this;

					this.$scrollBar = $('<div class="DDM_scrollBar"></div>');
					
					this.$scrollBar.mousedown(function (e) {
						ScrollData.active = true;
						ScrollData.menu = thisMenu;
						ScrollData.initX = thisMenu.$scrollBar.position().left;
						ScrollData.initMouseX = e.pageX;
					});
					
					$scrollBg.css({position:"absolute", bottom:0, left:0, height: ScrollBarHeight, width: "100%"});
					$scrollBg.appendTo(this.$ddmWrapper);
					this.$scrollBar.css({position:"absolute", bottom:0, left:0, height: ScrollBarHeight});
					this.$scrollBar.appendTo(this.$ddmWrapper);
				}
				
				this.$scrollBar.width(this.scrollHandleWidth);
				this.$itemCont.children(".DDM_menuItem").css("top", ItemPadding / 2);
			
			} else if (this.$scrollBar) {
				this.$scrollBar.remove();
				this.$scrollBar = undefined;
				this.$ddmWrapper.children(".DDM_scrollBg").remove();
				this.$itemCont.children(".DDM_menuItem").css("top", ItemPadding);
			}
		},
		scroll: function (e) {
			var left = ScrollData.initX + (e.pageX - ScrollData.initMouseX);

			if (left < 0) {
				left = 0;
			} else if (left + this.scrollHandleWidth > this.width) {
				left = this.width - this.scrollHandleWidth;
			}
		
			this.$scrollBar.css("left", left);
			this.$itemCont.css("left", -left * this.scrollMultiplier);
		},
		removeItem: function (item) {
			var i = this.items.length;
			
			while (i) {
				i -= 1;
				if (this.items[i] === item) {
					this.items[i].$element.remove();
					this.items.splice(i, 1);
					this.updateScrollBar();
				}
			}
			
		}
	};
	
	// Expose DragDropMenu to the global object
	window.DragDropMenu = DragDropMenu;
	
}());