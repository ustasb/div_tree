// Dependencies: jQuery, Utils

(function (undefined) {
	
	"use strict";
	var DraggableClass = "DRAG_draggableElement",
		InitAbsMousePos = {x: 0, y: 0},
		DraggableObjs = [],
		DraggingObj = {},
		IsStatic = false,
		Started = false,
		MouseMove = function (e) {
			// Has the mouse actually moved?
			if (!Started && InitAbsMousePos.x - e.pageX + InitAbsMousePos.y - e.pageY === 0) {
				return;
			}
			
			if (!Started) {
				if (DraggingObj.cbStart) {
					DraggingObj.cbStart(DraggingObj.pubUI);
				}
				
				Started = true;
			}
			
			DraggingObj.move(e);
		},
		MouseUp = function (e) {
			DraggingObj.stop(e);
			DraggingObj = undefined;
			Started = false;
		};
	
	$("body").on("mousedown", ".DRAG_draggableElement", function (e) {
		DraggingObj = Draggable.getDraggableFromElement(this);
		DraggingObj.start(e);
	});
	
	function Draggable (args) {
		this.element = args.element;
		this.cbStart = args.start;
		this.cbMove = args.move;
		this.cbStop = args.stop;
		
		this.initRelPos = {x: 0, y: 0};
		
		this.pubUI = {
			element: this.element,
			initPos: this.initRelPos,
			width: 0,
			height: 0,
			x: 0,
			y: 0
		};
		
		this.init();
		return this;
	}
	
	Draggable.activeDraggable = false;
	
	Draggable.getDraggableFromElement = function (element) {
		for (var i = 0, j = DraggableObjs.length; i < j; i++) {
			if (DraggableObjs[i].element === element) {
				return DraggableObjs[i];
			}
		}
	};
	
	Draggable.forceNewDraggable = function (element, event) {
		$(document).unbind("mousemove", MouseMove).unbind("mouseup", MouseUp);
		
		DraggingObj = Draggable.getDraggableFromElement(element);
		DraggingObj.start(event);
	};
	
	Draggable.prototype = {
		constructor: Draggable,
		version: "0.1",
		init: function () {
			$(this.element).css("position", "absolute").addClass(DraggableClass);
			
			DraggableObjs.push(this);
		},
		destroy: function () {
			$(this.element).removeClass(DraggableClass);
			
			for (var i = 0, j = DraggableObjs.length; i < j; i++) {
				if (DraggableObjs[i] === this) {
					DraggableObjs.splice(i, 1);
				}
			}
		},
		start: function (e) {
			var $element = $(this.element),
				displacedHeight = 0,
				draggablePos,
				$tool;
				
			Draggable.activeDraggable = this;
			
			Utils.disableDocSelection();
			$(document).mousemove(MouseMove).mouseup(MouseUp);
			
			IsStatic = /static/.test($element.css("position"));
			if (IsStatic) {
				this.initRelPos.x = parseInt($element.css("margin-left"), 10);
				this.initRelPos.y = parseInt($element.css("margin-top"), 10);
			} else {
				draggablePos = $element.position();
				this.initRelPos.x = draggablePos.left;
				this.initRelPos.y = draggablePos.top;
			}
			
			InitAbsMousePos.x = e.pageX;
			InitAbsMousePos.y = e.pageY;
			
			this.pubUI.width = $element.width();
			this.pubUI.height = $element.height();
		},
		move: function (e) {
			this.pubUI.x = this.initRelPos.x + (e.pageX - InitAbsMousePos.x);
			this.pubUI.y = this.initRelPos.y + (e.pageY - InitAbsMousePos.y);
			
			if (IsStatic) {
				this.element.style.marginLeft = this.pubUI.x + "px";
				this.element.style.marginTop = this.pubUI.y + "px";
			} else {
				this.element.style.left = this.pubUI.x + "px";
				this.element.style.top = this.pubUI.y + "px";
			}
		
			if (this.cbMove) {
				this.cbMove(this.pubUI);
			}
		},
		stop: function (e, preventCallback) {
			Utils.enableDocSelection();
			$(document).unbind("mousemove", MouseMove).unbind("mouseup", MouseUp);
			
			Draggable.activeDraggable = false;
			
			if (this.cbStop && !preventCallback) {
				this.cbStop(this.pubUI);
			}
		}
	};
	
	//Expose Draggable to the global object
	window.Draggable = Draggable;
	
}());