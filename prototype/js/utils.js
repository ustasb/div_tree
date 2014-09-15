// Dependencies: jQuery, jQueryUI

var Utils = (function ($) {
	
	return {
		disableDocSelection: function () {
			
			$(document.body).addClass("unselectable").disableSelection();
			$("input").css('webkit-user-select', 'none');
			
		},
		enableDocSelection: function () {
			
			$(document.body).removeClass("unselectable").enableSelection();
			$("input").css('webkit-user-select', '');
			
		},
		// Re-appends elements while maintaining the absolute position of the child element
		appendElements: function (childEl, parentEl, mouseAbsX, mouseAbsY) {
			var $child = $(childEl),
				$parent = $(parentEl),
				borderOffsetX = parseInt($parent.css("border-left-width"), 10) || 0,
				borderOffsetY = parseInt($parent.css("border-top-width"), 10) || 0,
				childAbsPos,
				parentAbsPos = $parent.offset();

			// If given, the element has not yet been appended to the page
			if (mouseAbsX && mouseAbsY) {
				childAbsPos = {left: mouseAbsX, top: mouseAbsY};
			} else {
				childAbsPos = $child.offset();
			}
			
			childAbsPos.left -= parentAbsPos.left + borderOffsetX;
			childAbsPos.top -= parentAbsPos.top + borderOffsetY;
			
			childEl.style.left = childAbsPos.left + "px";
			childEl.style.top = childAbsPos.top + "px";
			
			parentEl.appendChild(childEl);
		}
	};

}(jQuery));