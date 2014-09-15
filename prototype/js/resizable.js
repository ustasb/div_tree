// Dependencies: jQuery, Utils

(function (containerID, undefined) {
	
	"use strict";
	var InitAbsMousePos = {x: 0, y: 0},
		$HandleCont = $('<div id="RESIZ_handleCont"></div>'),
		ResizableClass = "RESIZ_resizableElement",
		ContainerOffsetTop = 0,
		ResizableObjs = [],
		ResizableObj,
		IsStatic = false,
		Handles = {},
		HandleLen = 10,
		MouseMove = function (e) {
			ResizableObj.resize(e);
		},
		MouseUp = function (e) {
			ResizableObj.stop(e);
			ResizableObj = undefined;
		};
		
	(function () {
		var handles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"],
			$container = containerID ? $("#" + containerID) : $("body"),
			$tempHandle;
			
			ContainerOffsetTop = $container.offset().top;
			
		for (var i = 0, j = handles.length; i < j; i++) {
			$tempHandle = $("<div class='RESIZ_handle RESIZ_h_" + handles[i] + "'></div>");
			$HandleCont.append($tempHandle);
			
			Handles[handles[i]] = $tempHandle.get(0);
		}

		$container.append($HandleCont);
	}());
		
	$HandleCont.on("mousedown", ".RESIZ_handle", function (e) {
		InitAbsMousePos.x = e.pageX;
		InitAbsMousePos.y = e.pageY;
		
		ResizableObj = Resizable.getResizableFromElement(Resizable.target);
		ResizableObj.start(this);
	}).hide();
	
	function Resizable (args) {
		this.element = args.element;
		this.cbStart = args.start;
		this.cbResize = args.resize;
		this.cbStop = args.stop;
		this.minDimen = {
			width: args.minWidth || 0,
			height: args.minHeight || 0
		};
		
		this.initPos = {relX: 0, relY: 0, absX: 0, absY: 0};
		this.initDimensions = {width: 0, height: 0, outerWidth: 0, outerHeight: 0};
		this.handleNumeric = undefined;
		
		this.pubUI = {
			element: this.element,
			initPos: this.initPos,
			initDimen: this.initDimensions,
			handleLbl: undefined,
			x: 0,
			y: 0,
			width: 0, 
			height: 0
		};
		
		this.init();
		return this;
	}
	
	Resizable.target = undefined;
	
	Resizable.makeHandlesVisible = function (visible) {
		visible ? $HandleCont.show() : $HandleCont.hide();
	};
	
	Resizable.updateHandles = function (element, posCache) {
		Handles.n.style.left = Handles.s.style.left = posCache.absX + ((posCache.absX2 - posCache.absX) / 2) - (HandleLen / 2) + "px";
		Handles.w.style.left = Handles.sw.style.left = Handles.nw.style.left = posCache.absX + "px";
		Handles.e.style.left = Handles.se.style.left = Handles.ne.style.left = posCache.absX2 - HandleLen + "px";
		
		Handles.n.style.top = Handles.ne.style.top = Handles.nw.style.top = posCache.absY - ContainerOffsetTop + "px";
		Handles.e.style.top = Handles.w.style.top = posCache.absY + ((posCache.absY2 - posCache.absY) / 2) - (HandleLen / 2) - ContainerOffsetTop + "px";
		Handles.se.style.top = Handles.s.style.top = Handles.sw.style.top = posCache.absY2 - HandleLen - ContainerOffsetTop + "px";
		
		Resizable.target = element;
	};
	
	Resizable.getResizableFromElement = function (element) {
		for (var i = 0, j = ResizableObjs.length; i < j; i++) {
			if (ResizableObjs[i].element === element) {
				return ResizableObjs[i];
			}
		}
	};
		
	Resizable.destroy = function (element) {
		var resizableObj = Resizable.getResizableFromElement(element);
		resizableObj.destroy();
	};
	
	// A quicker way to test what handle is being used than regular expressions. 
	// North is positive, South is negative, East is even, West is odd.
	Resizable.getNumericHandle = function (handleLbl) {
		switch (handleLbl) {
			case "h_n":
				return 1;
			case "h_ne":
				return 12;
			case "h_nw":
				return 13;
			case "h_e":
				return 2;
			case "h_w":
				return -2;
			case "h_s":
				return -1;
			case "h_se":
				return -12;
			case "h_sw":
				return -13;
		}
	};
	
	Resizable.activeResizable = false;
	
	Resizable.prototype = {
		init: function () {
			$(this.element).addClass(ResizableClass);
			
			ResizableObjs.push(this);
		},
		destroy: function () {
			$(this.element).removeClass(ResizableClass).children(".RESIZ_handle").remove();

			for (var i = 0, j = ResizableObjs.length; i < j; i++) {
				if (ResizableObjs[i] === this) {
					ResizableObjs.splice(i, 1);
				}
			}
		},
		start: function (handleElement) {
			var $element = $(this.element),
				handleLbl = $(handleElement).attr("class").match(/h_\w\w?/, "")[0],
				absPos = $element.offset(),
				relPos;
				
			Resizable.activeResizable = this;
			
			Utils.disableDocSelection();
			$(document).mousemove(MouseMove).mouseup(MouseUp);
			
			this.pubUI.handleLbl = handleLbl;
			this.handleNumeric = Resizable.getNumericHandle(handleLbl);
			this.initPos.absX = absPos.left;
			this.initPos.absY = absPos.top - ContainerOffsetTop;
			
			IsStatic = /static/.test($element.css("position"));
			if (IsStatic) {
				this.initPos.relX = parseInt($element.css("marginLeft"), 10);
				this.initPos.relY = parseInt($element.css("marginTop"), 10);
			} else {
				relPos = $element.position();
				this.initPos.relX = relPos.left;
				this.initPos.relY = relPos.top;
			}
			
			this.initDimensions.width = $element.width();
			this.initDimensions.height = $element.height();
			this.initDimensions.outerWidth = $element.outerWidth();
			this.initDimensions.outerHeight = $element.outerHeight();
			
			if (this.cbStart) {
				this.cbStart(this.pubUI);
			}
		},
		resizeNorth: function (mouseDy) {
			var newHeight = this.initDimensions.height + (-1 * mouseDy),
				newOuterHeight = this.initDimensions.outerHeight + (-1 * mouseDy),
				handleTop = this.initPos.absY + mouseDy,
				newY = this.initPos.relY + mouseDy;
				
			if (newHeight < this.minDimen.height) {
				newY += newHeight - this.minDimen.height;
				newHeight = newOuterHeight = this.minDimen.height;
				handleTop = this.initPos.absY + this.initDimensions.outerHeight;
			}
			
			this.pubUI.y = newY;
			this.pubUI.height = newHeight;
			
			if (IsStatic) {
				this.element.style.marginTop = newY + "px";
			} else {
				this.element.style.top = newY + "px";
			}
			this.element.style.height = newHeight + "px";
			
			Handles.n.style.top = Handles.ne.style.top = Handles.nw.style.top = handleTop + "px";
			Handles.w.style.top = Handles.e.style.top = handleTop + (newOuterHeight / 2) - (HandleLen / 2) + "px";
		},
		resizeEast: function(mouseDx) {
			var newWidth = this.initDimensions.width + mouseDx,
				newOuterWidth = this.initDimensions.outerWidth + mouseDx,
				handleLeft = this.initPos.absX + newOuterWidth;
			
			if (newWidth < this.minDimen.width) {
				newWidth = newOuterWidth = this.minDimen.width;
				handleLeft = this.initPos.absX;
			}
			
			this.pubUI.width = newWidth;
			this.element.style.width = newWidth + "px";
			
			Handles.e.style.left = Handles.ne.style.left = Handles.se.style.left = handleLeft - HandleLen + "px";
			Handles.s.style.left = Handles.n.style.left = handleLeft - (newOuterWidth / 2) - (HandleLen / 2) + "px";
		},
		resizeSouth: function(mouseDy) {
			var newHeight = this.initDimensions.height + mouseDy,
				newOuterHeight = this.initDimensions.outerHeight + mouseDy,
				handleTop = this.initPos.absY + newOuterHeight;
				
			if (newHeight < this.minDimen.height) {
				newHeight = newOuterHeight = this.minDimen.height;
				handleTop = this.initPos.absY;
			}
			
			this.pubUI.height = newHeight;
			this.element.style.height = newHeight + "px";
			
			Handles.s.style.top = Handles.se.style.top = Handles.sw.style.top = handleTop - HandleLen + "px";
			Handles.w.style.top = Handles.e.style.top = handleTop - (newOuterHeight / 2) - (HandleLen / 2) + "px";
		},
		resizeWest: function(mouseDx) {
			var newWidth = this.initDimensions.width + (-1 * mouseDx),
				newOuterWidth = this.initDimensions.outerWidth + (-1 * mouseDx),
				handleLeft = this.initPos.absX + mouseDx,
				newX = this.initPos.relX + mouseDx;

			if (newWidth < this.minDimen.width) {
				newX += newWidth - this.minDimen.width;
				newWidth = newOuterWidth = this.minDimen.width;
				handleLeft = this.initPos.absX + this.initDimensions.outerWidth;
			}
			
			this.pubUI.x = newX;
			this.pubUI.width = newWidth;
			
			if (IsStatic) {
				this.element.style.marginLeft = newX + "px";
			} else {
				this.element.style.left = newX + "px";
			}
			this.element.style.width = newWidth + "px";
			
			Handles.w.style.left = Handles.nw.style.left = Handles.sw.style.left = handleLeft + "px";
			Handles.s.style.left = Handles.n.style.left = handleLeft + (newOuterWidth / 2) - (HandleLen / 2) + "px";
		},
		resize: function (e) {
			var mouseDx = e.pageX - InitAbsMousePos.x,
				mouseDy = e.pageY - InitAbsMousePos.y;

			switch (this.handleNumeric) {
				case 1:
					this.resizeNorth(mouseDy);
					break;
				case 12:
					this.resizeNorth(mouseDy);
					this.resizeEast(mouseDx);
					break;
				case 2:
					this.resizeEast(mouseDx);
					break;
				case -12:
					this.resizeSouth(mouseDy);
					this.resizeEast(mouseDx);
					break;
				case -1:
					this.resizeSouth(mouseDy);
					break;
				case -13:
					this.resizeSouth(mouseDy);
					this.resizeWest(mouseDx);
					break;			
				case -2:
					this.resizeWest(mouseDx);
					break;
				case 13:
					this.resizeNorth(mouseDy);
					this.resizeWest(mouseDx);
					break;
			}
			
			if (this.cbResize) {
				this.cbResize(this.pubUI);
			}
		},
		stop: function (e) {
			Utils.enableDocSelection();
			$(document).unbind("mousemove", MouseMove).unbind("mouseup", MouseUp);
			
			Resizable.activeResizable = false;
		
			if (this.cbStop) {
				this.cbStop(this.pubUI);
			}
		}
	};

	// Expose Resizable to the global object
	window.Resizable = Resizable;
	
} ("DT_toolBenchCont"));