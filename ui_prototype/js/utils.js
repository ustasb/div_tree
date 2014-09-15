(function ($) {
	
	$.fn.combOuterHeight = function (includeMargin) {
		var height = 0,
			i = this.length;
		
		includeMargin = includeMargin || false;
		
		while (i) {
			i -= 1;
			height += this.eq(i).outerHeight(includeMargin);
		}
		
		return height;
	};
	
	$.fn.vertBorderPadding = function (includeMargin) {
		var border = parseInt(this.css("border-top-width"), 10) + parseInt(this.css("border-bottom-width"), 10),
			padding = parseInt(this.css("padding-top"), 10) + parseInt(this.css("padding-bottom"), 10);
		return border + padding;
	};	
	
	$.fn.horizBorderPadding = function (includeMargin) {
		var border = parseInt(this.css("border-left-width"), 10) + parseInt(this.css("border-right-width"), 10),
			padding = parseInt(this.css("padding-left"), 10) + parseInt(this.css("padding-right"), 10);
		return border + padding;
	};


	if (!Array.prototype.indexOf) {  
		Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {  
			"use strict";  
			if (this == null) {  
				throw new TypeError();
			}  
			var t = Object(this);  
			var len = t.length >>> 0;  
			if (len === 0) {  
				return -1;  
			}  
			var n = 0;  
			if (arguments.length > 0) {
				n = Number(arguments[1]);  
				if (n != n) { // shortcut for verifying if it's NaN  
					n = 0;  
				} else if (n != 0 && n != Infinity && n != -Infinity) {  
					n = (n > 0 || -1) * Math.floor(Math.abs(n));  
				}  
			}  
			if (n >= len) {  
				return -1;  
			}  
			var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);  
			for (; k < len; k++) {  
				if (k in t && t[k] === searchElement) {  
					return k;  
				}  
			}  
			return -1;  
		}  
	}

}(jQuery));