// needs funnelInstance.js

var FunnelInstanceFactory = (function() {

var common = {};

// Exposed
common.exposed = function(options) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.options = {};
	
	// Exposed methods
	exposed.getRemote = function() {
		return internal.make;
	};
	
	// Internal methods
	internal.make = function(firstSignature) {
		var instance = new FunnelInstance(internal.options);
		return instance.getRemote()(firstSignature);
	};
	
	// Init
	var defaults = common.internal.defaultOptions;
	for (var name in defaults) {
		if (!defaults.hasOwnProperty(name)) continue;
		
		internal.options[name] = defaults[name];
	};
	
	for (var name in options) {
		if (!options.hasOwnProperty(name)) continue;
		
		internal.options[name] = options[name];
	};
};

// Internal
common.internal = {};

common.internal.defaultOptions = {
	defaultToStrictTypes: false,
	useInjection: true
};

return common.exposed;
})();
