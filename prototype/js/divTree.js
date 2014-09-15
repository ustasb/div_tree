var DIVTREE = {
	ui: undefined,
	toolBench: undefined,
	init: function () {
		this.ui = DIVTREE.ui();
		this.toolBench = DIVTREE.toolBench();
		
		this.ui.init();
		this.toolBench.init();
	}
};