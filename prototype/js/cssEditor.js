var CssEditor = (function ($, undefined) {
	"use strict";
	
	function CssEditor(opts) {
		this.name = opts.name;
		this.lists = [];
		this.$listCont = $('<ul class="CSSED_listCont"></ul>');
		this.styleCont = undefined;
		this.activeList = undefined;
		
		this.init(opts.$container);
		return this;
	}
	
	CssEditor.prototype = {
		init: (function () {
			
			function createCssStyleCont(editor) {
				editor.styleCont = $('<style id="CSSED_styleCont_' + editor.name + '" type="text/css"></style>').get(0);
				document.head.appendChild(editor.styleCont);
			}
		
			function initEvents(editor) {
				editor.$listCont.on("click", ".CSSED_propertyDestroy", function () {
					var propertyName = $(this).next(".CSSED_centerCont").children(".CSSED_propertyName").text();
					editor.activeList.removeProperty(propertyName);
					DIVTREE.ui.rightBarScroll.updateVertical();
				}).on("focusout", ".CSSED_propertyValue", function () {
					var propertyName = $(this).siblings(".CSSED_propertyName").text();
					editor.activeList.addProperty(propertyName, this.value);
				});
			}
		
			return function ($container) {
				var editor = this;
				
				this.$listCont.sortable({
					stop: function (e, ui) {
						var propertyName1 = ui.item.find(".CSSED_propertyName").text(),
							propertyName2 = ui.item.next(".CSSED_propertyItem").find(".CSSED_propertyName").text() || false;

						editor.activeList.restructPropertyList(propertyName1, propertyName2);
					}
				}).appendTo($container);
				
				createCssStyleCont(this);
				initEvents(this);
			};
		
		}()),
		addIDList: function (element) {
			var listInstance = new IDList(this, element);
		
			this.lists.push(listInstance);
			
			return listInstance;
		},
		addClassList: function (className) {
			var listInstance = new ClassList(this, className);
			
			this.lists.push(listInstance);
			
			return listInstance;
		},
		hasList: function (list) {
			var i = this.lists.length;
			
			while (i) {
				i -= 1;
				if (this.lists[i] === list) {
					return true;
				}
			}
			
			return false;
		},
		populateWithList: function (list) {
			if (this.activeList === list) {
				return;
			}

			this.activeList = list;
			this.$listCont.empty();

			for (var i = 0, j = list.properties.length; i < j; i++) {
				list.properties[i].draw();
			}
		}
	
	};
	
	var IDList, ClassList;
	
	(function () {
		// Keep the List class private
		function List(editor) {
			this.parentEditor = editor;
			this.properties = [];
			return this;
		}
		
		List.prototype = {
			// Overwrites duplicates
			addProperty: function (propertyName, val) {
				var i = this.properties.length,
					property;
				
				// Sanitize value argument
				val = (val !== undefined || val === 0) ? val.toString() : "";

				while (i) {
					i -= 1;
					if (this.properties[i].getName() === propertyName) {
						
						// Only update the property and CSS if a value is given
						if (val !== "") {
						
							if (this.properties[i].getVal() !== val) {
								this.properties[i].setVal(val);
								this.updateCss(this.properties[i]);
							}
							
						}

						return this.properties[i];
					}
				}

				property = new CssProperty({
					list: this,
					name: propertyName,
					val: val
				});
				
				this.properties.push(property);
				this.updateCss(property);
				
				return property;
			},
			getPropertyFromName: function (propertyName) {
				var i = this.properties.length;
				
				while (i) {
					i -= 1;
					if (this.properties[i].getName() === propertyName) {
						return this.properties[i];
					}
				}
				
				return false;
			},
			hasProperty: function (propertyName) {
				return this.getPropertyFromName(propertyName) ? true : false;
			},
			removeProperty: function (propertyName, preventCssUpdate) {
				var i = this.properties.length,
					tempProperty;
				
				while (i) {
					i -= 1;
					if (this.properties[i].getName() === propertyName) {
						tempProperty = this.properties[i];
						
						// Delete the property from the properties list because the ClassList updateCss method
						// updates CSS definitions based on what's inside the properties list. Thus, if we don't
						// want the definitions to include a property, we must remove it from the properties list
						// before calling 'updateCss.'
						this.properties.splice(i, 1);
						tempProperty.remove();

						if (!preventCssUpdate) {
							tempProperty.setVal("");
							this.updateCss(tempProperty);
						}

						break;
					}
				}
			},
			updateStyleContCss: function (fullCssStr) {
				var allCss = this.parentEditor.styleCont.innerHTML,
					oldCss = allCss,
					thisCss = this.createCssString(fullCssStr),
					regExp;
					
				fullCssStr = fullCssStr.replace(".", "\\.");
				regExp = new RegExp(fullCssStr + " {(.*?)}\n", "g");
				
				// If 'replace' returns the same as the oldCss value, either the regExp wasn't found (1) or
				// thisCss was the same and the list's already existing CSS string (2). We only want to add
				// a new CSS string if it doesn't aready exist. Thus, if oldCss.match(regExp) returns true, we
				// know that (2) occured and thisCss should not be added.
				allCss = allCss.replace(regExp, thisCss);
				if (allCss === oldCss && !oldCss.match(regExp)) {
					allCss += thisCss;
				}
				
				this.parentEditor.styleCont.innerHTML = allCss;
			},
			createCssString: function (fullCssStr) {
				fullCssStr += " { ";
				
				for (var i = 0, j = this.properties.length; i < j; i++) {
					fullCssStr += this.properties[i].getName() + ":" + this.properties[i].getVal() + "; ";
				}
				
				return fullCssStr + "}\n";
			},
			restructPropertyList: function (propertyName1, propertyName2) {
				var movingProperty = this.getPropertyFromName(propertyName1);
					
				this.removeProperty(propertyName1, true);
				
				if (propertyName2) {
					for (var i = 0, j = this.properties.length; i < j; i++) {
						if (this.properties[i].getName() === propertyName2) {
							this.properties.splice(i, 0, movingProperty);
							break;
						}
					}
				} else {
					this.properties.push(movingProperty);
				}
			}
		
		};
		
		// Create IDList class
		IDList = function (editor, element) {
			List.call(this, editor);
			this.$element = $(element);
		};
		IDList.prototype = new List();
		IDList.prototype.constructor = IDList;
		
		IDList.prototype.updateCss = function (property) {
			// An empty string as a value will remove the property from the element
			if (property) {
				this.$element.css(property.getName(), property.getVal());
			} else {
				for (var i = 0, j = this.properties.length; i < j; i++) {
					this.$element.css(this.properties[i].getName(), this.properties[i].getVal());
				}
			}
		};
		
		IDList.prototype.updateStyleContCss = function () {
			List.prototype.updateStyleContCss.call(this, "#" + this.$element.attr("id"));
		};

		// Create ClassList class
		ClassList = function (editor, className) {
			List.call(this, editor);
			this.className = className;
			this.elements = [];
			
			// Write the empty CSS class definition
			this.updateCss();
		};
		ClassList.prototype = new List();
		ClassList.prototype.constructor = ClassList;

		ClassList.prototype.updateCss = function () {
			this.updateStyleContCss();
		};
		
		ClassList.prototype.updateStyleContCss = function () {
			List.prototype.updateStyleContCss.call(this, "." + this.className);
		};
		
		ClassList.prototype.addElementToList = function (element) {
			var i = this.elements.length;
			
			while (i) {
				i -= 1;
				if (this.elements[i] === element) {
					return;
				}
			}
			
			this.elements.push(element);
			$(element).addClass(this.className);
		};
		
		ClassList.prototype.removeElementFromList = function (element) {
			var i = this.elements.length;
			
			while (i) {
				i -= 1;
				if (this.elements[i] === element) {
					this.elements.splice(i, 1);
					$(element).removeClass(this.className);
					break;
				}
			}
		};
		
		ClassList.prototype.updateClassName = function (newName) {
			var allCss = this.parentEditor.styleCont.innerHTML,
				regExp = new RegExp("\\." + this.className, "g");

			$(this.elements).removeClass(this.className).addClass(newName);
			
			allCss = allCss.replace(regExp, "." + newName);
			this.parentEditor.styleCont.innerHTML = allCss;
			
			this.className = newName;
		};
		
	}());
	
	var CssProperty;
	
	(function () {
	
		function buildProperty(property) {
			var height = 30,
				$property = $('<li class="CSSED_propertyItem"></li>'),
				$centerCont = $('<div class="CSSED_centerCont"></div>'),
				$destroy = $('<div class="CSSED_propertyDestroy"></div>'),
				$propertyName = $('<span class="CSSED_propertyName">' + property.getName() + '</span>'),
				$propertyVal = $('<input type="text" value="' + property.getVal() + '" class="CSSED_propertyValue" />');
			
			$centerCont.append($propertyVal, $propertyName);
			$property.css("height", height);
			$propertyVal.css("height", height);
			$destroy.css({width:height - 10, height: height - 10});
			$property.append($destroy, $centerCont);
			
			property.$propertyVal = $propertyVal;
			property.$propertyElement = $property;
		}
	
		CssProperty = function (opts) {
			var name = opts.name,
				val = opts.val;
			
			this.getName = function () { return name; };
			this.getVal = function () { return val; };
			this.setVal = function (newVal) {
				val = newVal;
				
				if (this.isParentListActive()) {
					this.$propertyVal.val(newVal);
				}

				return val;
			};
			
			this.parentList = opts.list;
			this.$propertyVal = undefined;
			this.$propertyElement = undefined;
			buildProperty(this);
			
			this.draw();
			return this;
		};
		
		CssProperty.prototype = {
			isParentListActive: function () {
				return (this.parentList === this.parentList.parentEditor.activeList);
			},
			focus: function () {
				if (this.isParentListActive()) {
					this.$propertyVal.focus();
				}
			},
			remove: function () {
				if (this.isParentListActive()) {
					this.$propertyElement.remove();
				}
			},
			draw: function () {
				if (this.isParentListActive()) {
					this.$propertyVal.val(this.getVal());
					this.parentList.parentEditor.$listCont.append(this.$propertyElement);
				}
			}
		};
		
	}());
	
	return CssEditor;

}(jQuery));