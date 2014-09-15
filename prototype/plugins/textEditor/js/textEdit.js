var TextEditor = (function ($, Utils, ColorWheel, Rangy, undefined) {
	"use strict";
	
	var nonValueButtons = [
			{name: "bold", cmd: "bold"},
			{name: "italic", cmd: "italic"},
			{name: "underline", cmd: "underline"},
			{name: "center", cmd: "justifyCenter"},
			{name: "justifyLeft", cmd: "justifyLeft"},
			{name: "justifyRight", cmd: "justifyRight"},
			{name: "orderedList", cmd: "insertOrderedList"},
			{name: "unorderedList", cmd: "insertUnorderedList"}
		];
	
	function TextEditor(opts) {
		this.isOn = false;
		this.openMenu = undefined;
		this.rangySelection = undefined;
		this.$container = $(opts.container);
		this.$buttonCont = $('<div class="TE_buttonCont"></div>');
		this.$popOutMenuCont = $('<div class="TE_popOutMenuCont"></div>');
		this.activeTextSpace = opts.textSpace;

		this.init(opts);
	}
	
	TextEditor.prototype = {
		init: function (opts) {
			this.isOn = true;
			
			this.constructUI();
			this.addLinkButtons();
			this.addFontNameButton();
			this.addTextColoringButtons(true, true);
			
			if (this.activeTextSpace) {
				this.activeTextSpace.contentEditable = "true";
			}
		},
		off: function () {
			if (!this.isOn) {
				return this;
			}
			
			this.$buttonCont.append('<div class="TE_disabled"></div>');
			
			if (this.activeTextSpace) {
				this.activeTextSpace.contentEditable = "false";
			}
			
			this.isOn = false;
			return this;
		},
		on: function () {
			if (this.isOn) {
				return this;
			}
			
			this.$buttonCont.children(".TE_disabled").remove();
			
			if (this.activeTextSpace) {
				this.activeTextSpace.contentEditable = "true";
			}
			
			this.isOn = true;
			return this;
		},
		changeTextSpace: function (textSpace) {
			if (this.activeTextSpace) {
				this.activeTextSpace.contentEditable = "false";
			}
			
			this.activeTextSpace = textSpace;
			if (this.isOn) {
				textSpace.contentEditable = "true";
			}
		},
		closeOpenMenu: function () {
			if (!this.$openMenu) {
				return;
			}

			this.$openMenu.detach();
			this.$openMenu = undefined;
		},
		executeCommand: function (cmd, val) {
			if (this.rangySelection !== undefined) {
				Rangy.restoreSelection(this.rangySelection);
				document.execCommand(cmd, false, val || null);
			}
		},
		constructUI: function () {
			var editor = this,
				$tempButton;

			this.$buttonCont.append(this.$popOutMenuCont);
			
			this.$container.css({
				width: 220,
				height: 45,
				backgroundColor: "green"
			}).addClass("TE_textEditWrapper").append(this.$buttonCont);
			
			// Save the current selection when a button is pressed
			this.$buttonCont.on("mousedown", ".TE_button", function (e) {
				editor.rangySelection = Rangy.saveSelection();
			});
			
			// Add non-value buttons
			for (var i = 0, j = nonValueButtons.length; i < j; i++) {
				$tempButton = $('<div class="TE_' + nonValueButtons[i].name + 'Button TE_button"></div>');
				
				$tempButton.click((function () {
					var tempCmd = nonValueButtons[i].cmd;
					
					return function () {
						editor.executeCommand(tempCmd);
					};
					
				}())).appendTo(this.$buttonCont);
			}
			
		},
		addFontNameButton: (function () {
		
			var fonts = [
				{name: "Arial", family: "sans-serif"},
				{name: "Arial Black", family: "sans-serif"},
				{name: "Gadget", family: "sans-serif"},
				{name: "Helvetica", family: "sans-serif"},
				{name: "Comic Sans Ms", family: "cursive"},
				{name: "Courier New", family: "monospace"},
				{name: "Georgia", family: "serif"},
				{name: "Impact", family: "sans-serif"},
				{name: "Charcoal", family: "sans-serif"},
				{name: "Lucida Console", family: "monospace"},
				{name: "Lucida Sans Unicode", family: "sans-serif"},
				{name: "Lucida Grande", family: "sans-serif"},
				{name: "Palatino", family: "serif"},
				{name: "Palatino Linotype", family: "serif"},
				{name: "Book Antiqua", family: "serif"},
				{name: "Tahoma", family: "sans-serif"},
				{name: "Times New Roman", family: "serif"},
				{name: "Times", family: "serif"},
				{name: "Geneva", family: "sans-serif"},
				{name: "Trebuchet MS", family: "sans-serif"},
				{name: "Verdana", family: "sans-serif"},
				{name: "New York", family: "serif"}
			];
			
			function populateFonts($fontOptsCont) {
				var tempFontStr;
				
				for (var i = 0; i < fonts.length; i++) {
					tempFontStr = fonts[i].name + ", " + fonts[i].family;
					$fontOptsCont.append('<div class="TE_fontOpt" style="font-family: ' + tempFontStr + ';">' + fonts[i].name + '</div>');
				}
			}
			
			return function () {
				var editor = this,
					$fontCont = $('<div class="TE_fontCont"></div>'),
					$fontContAbsPosAnchor = $('<div class="TE_fontContAbsPosAnchor"></div>'),
					$currentFont = $('<div class="TE_currentFont"></div>'),
					$fontOptsButton = $('<div class="TE_fontOptsButton TE_button" ></div>'),
					$fontOptsCont = $('<div class="TE_fontOptsCont"></div>'),
					$fontOpts = $('<div class="TE_fontOpts"></div>'),
					$scrollCont = $('<div class="TE_fontOptsScrollCont"></div>'),
					$scrollHandle = $('<div class="TE_fontOptsScrollHandle"></div>');
					
				$scrollCont.append($scrollHandle);
				$fontOptsCont.append($fontOpts, $scrollCont);
				
				$fontCont.append($fontContAbsPosAnchor);
				$fontContAbsPosAnchor.append('<div style="float:left; width:45px; background-color:blue;" >&nbsp;Font:&nbsp;</div>', $fontOptsButton, $currentFont);
				$currentFont.attr("style", "font-family: " + fonts[0].name + ", " + fonts[0].family + ";").text(fonts[0].name);
				
				this.$buttonCont.append($fontCont);
				
				populateFonts($fontOpts);
				
				$fontOptsButton.click(function () {
					if ($fontOptsCont.is(":visible")) {
						editor.closeOpenMenu();
					} else {
						editor.closeOpenMenu();
						editor.$openMenu = $fontOptsCont;
						$fontOptsCont.appendTo($fontContAbsPosAnchor);
						
						// Resize the scroll handle
						var fontOptsContHeight = $fontOptsCont.height();

						$scrollHandle.css({
							top: 0,
							height: (fontOptsContHeight / $fontOpts.height()) * fontOptsContHeight
						});
					}
				});

				$fontOpts.on("click", ".TE_fontOpt", function () {
					var fontStyle = $(this).attr("style"),
						fontName = fontStyle.match(/[^font\-family \:][^,]+/)[0];
					
					if ($.browser.msie) {
						// For some reason, rangy fails in IE if the selection isn't restored before executing the text command
						Rangy.restoreSelection(editor.rangySelection);
					}
					
					$currentFont.attr("style", fontStyle).attr("title", fontName).text(fontName);
					editor.closeOpenMenu();
					
					// Get rid of "font-family" and the semicolon. I'm sure there's a better regExp for this...
					fontStyle = fontStyle.replace(/[!(font\-family:\s?)]+/, "").replace(";", "");
					
					editor.executeCommand("fontName", fontStyle);
				});

				$scrollHandle.mousedown(function (e) {
					var dy,
						initMouseY = e.pageY,
						initHandleTop = parseInt($scrollHandle.css("top"), 10),
						containerHeight = $fontOptsCont.height(),
						handleHeight = $scrollHandle.height(),
						scrollMultiplier = $fontOpts.height() / containerHeight,
						mousemove = function (e) {
							dy = e.pageY - initMouseY;
							
							if (initHandleTop + dy < 0) {
								dy = -initHandleTop;
							} else if (initHandleTop + dy + handleHeight > containerHeight) {
								dy = containerHeight - (initHandleTop + handleHeight);
							}
							
							$fontOpts.css("top", (initHandleTop + dy) * -scrollMultiplier);
							
							$scrollHandle.css("top", initHandleTop + dy);
						},
						mouseup = function () {
							$(document).unbind("mousemove", mousemove).unbind("mouseup", mouseup);
							Utils.enableDocSelection();
						};
						
					Utils.disableDocSelection();
					$(document).mousemove(mousemove).mouseup(mouseup);
				});
			};
		
		}()),
		addTextColoringButtons: (function () {
			var editor;
		
			function getColor(e) {
				var $setColor = $(this).prev(),
					colorWheelWidth = 216,
					offset = editor.$container.offset();
				
				editor.closeOpenMenu();
				editor.$openMenu = ColorWheel.create({
					x: offset.left + editor.$container.width() - colorWheelWidth,
					y: offset.top + editor.$container.height(),
					done: function (hexColor) {
						editor.$openMenu = undefined;
						$setColor.css("background-color", hexColor);
						$setColor.click();
					}
				});
			}
			
			function setColor() {
				var hexColor = $(this).css("background-color"),
					cmd = (/TE_setBgColor/.test(this.className)) ? ($.browser.msie ? "backcolor" : "hilitecolor") : "foreColor";
					
				editor.executeCommand(cmd, hexColor);
			}
			
			return function (addBgColorButton, addTextColorButton) {
				editor = this;	
					
				if (addBgColorButton) {
					var $bgColorCont = $('<div class="TE_textBgColorCont"></div>'),
						$setBgColor = $('<div class="TE_setBgColor TE_button"></div>'),
						$getBgColor = $('<div class="TE_getBgColor TE_button"></div>');
					
					$bgColorCont.append($setBgColor, $getBgColor);
					$getBgColor.click(getColor);
					$setBgColor.click(setColor);
					
					this.$buttonCont.append($bgColorCont);
				}
				
				if (addTextColorButton) {
					var $textColorCont = $('<div class="TE_textColorCont"></div>'),
						$setColor = $('<div class="TE_setColor TE_button"></div>'),
						$getColor = $('<div class="TE_getColor TE_button"></div>');

					$textColorCont.append($setColor, $getColor);
					$getColor.click(getColor);
					$setColor.click(setColor);
					
					this.$buttonCont.append($textColorCont);
				}
				
			};
			
		}()),
		addLinkButtons: function () {
			var editor = this,
				$addLink = $('<div class="TE_addLinkButton TE_button"></div>'),
				$addLinkPromptCont = $('<div class="TE_addLinkPromptCont"></div>'),
				$addLinkExit = $('<div class="TE_addLinkExit"></div>'),
				$linkURL = $('<label for="TE_linkURL">URL:</label><input id="TE_linkURL" type="text" value="http://" /><br />'),
				$linkTitle = $('<label for="TE_linkTitle">Title:</label><input id="TE_linkTitle" type="text" /><br />'),
				$linkDone = $('<button type="button">Add Link</button>'),
				$removeLink = $('<div class="TE_removeLinkButton TE_button"></div>');
			
			$addLinkPromptCont.append($addLinkExit, '<span>Add/Edit Link</span><br />', $linkURL, $linkTitle, $linkDone);
			this.$buttonCont.append($addLink, $removeLink);

			$addLink.click(function () {
				editor.closeOpenMenu();
			
				editor.$openMenu = $addLinkPromptCont;
				editor.$popOutMenuCont.append($addLinkPromptCont);
			});
			
			$addLinkExit.click(function () {
				editor.closeOpenMenu();
			});
			
			$linkDone.click(function () {
				var url = $linkURL[1].value;
			
				if (url !== "" && !/http:\/\//.test(url)) {
					editor.executeCommand("createLink", url);
				}
				
				editor.closeOpenMenu();
			});
			
			$removeLink.click(function () {
				editor.executeCommand("unlink");
			});
			
		}
		
	};
	
	return TextEditor;

}(jQuery, Utils, ColorWheel, rangy));