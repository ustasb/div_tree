// Dependencies on the Farbtastic jQuery plugin

var ColorWheel = (function ($, undefined) {
	"use strict";
	
	var $container = $('<div class="CW_container"></div>'),
		$farbtastic = $('<div class="CW_farbtastic"></div>'),
		$ctrlCont = $('<div class="CW_controls"></div>'),
		$colorInput = $('<input class="CW_colorInput" name="color" type="text" value="#808080" />'),
		$cancel = $('<div class="CW_cancel"></div>'),
		$done = $('<button class="CW_done" type="button">Done</button>'),
		doneCallback;
		
		function close() {
			$container.detach();
		}
		
		function done() {
			var hexColor = $colorInput.val();
			
			close();
			
			if (doneCallback) {
				doneCallback(hexColor);
				doneCallback = undefined;
			}
		}
		
		// Build and bind events
		$cancel.click(close);
		$done.click(done);
		$ctrlCont.append($colorInput, $done);
		
		$farbtastic.farbtastic($colorInput);
		$container.append($cancel, $farbtastic, $ctrlCont);
		
	return {
		create: function (opts) {
		
			// If the wheel is already active, close it and create a new instance
			if ($container.is(":visible")) {
				close();
			}
			
			$container.css({
				left: opts.x,
				top: opts.y,
				zIndex: opts.zIndex || "auto"
			}).appendTo("body");
			
			doneCallback = opts.done;
			
			return $container;
		},
		done: done
	};

}(jQuery));