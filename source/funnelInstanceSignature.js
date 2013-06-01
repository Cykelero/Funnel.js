// needs +Pattern.js
// needs injector.js

var FunnelInstanceSignature = (function() {

var common = {};

// Exposed
common.exposed = function(signatureString) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.generated = null;
	internal.filterFunctions = [];
	
	// Exposed methods
	exposed.addFilterFunction = function(name, keys, action, extra) {
		var injectableAction = Injector.prepare(action);
		
		internal.filterFunctions.push({
			behavior: common.internal.filterFunctions[name],
			keys: keys,
			action: injectableAction,
			extra: extra
		});
	};
	
	exposed.applyTo = function(self, args) {
		var mappedArguments = internal.generated(args);
		
		if (!mappedArguments) return null;
		
		internal.filterFunctions.forEach(function(info) {
			internal.executeFilterFunction(mappedArguments, info);
		});
		
		return mappedArguments;
	};
	
	internal.executeFilterFunction = function(args, info) {
		var currentKeyName = null;
		
		var preparedAction = function(extraInjectedValues) {
			var injectedValues;
			
			// Prepare the injected values
			injectedValues = {};
			
			for (var key in args) {
				injectedValues[key] = args[key];
			}
			
			if (extraInjectedValues) {
				for (var key in extraInjectedValues) {
					injectedValues["_" + key] = extraInjectedValues[key];
				}
			}
			
			injectedValues._name = currentKeyName;
			injectedValues._args = args;
			
			// Call the action function
			return info.action.call(getCurrentKeyValue, injectedValues);
		};
		
		function getCurrentKeyValue() {
			return args[currentKeyName];
		};
		
		var thisObject = {args: args};
		
		info.keys.forEach(function(key) {
			currentKeyName = key;
			info.behavior.call(thisObject, key, preparedAction, info.extra);
		});
	};
	
	// Internal methods
	
	// Init
	internal.generated = FunnelInstanceSignaturePattern(signatureString);
	
};

common.exposed.getFilterFunctionNames = function() {
	var names = [];
	
	for (var name in common.internal.filterFunctions) {
		names.push(name);
	}
	
	return names;
};

// Internal
common.internal = {};

common.internal.filterFunctions = {
	set: function(key, action) {
		this.args[key] = action();
	}
};

return common.exposed;
})();
