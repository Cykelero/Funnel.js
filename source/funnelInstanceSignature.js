// needs +Pattern.js
// needs injector.js

var FunnelInstanceSignature = (function() {

var common = {};

// Exposed
common.exposed = function(signatureString, options) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.generated = null;
	internal.filterFunctions = [];
	
	internal.options = options;
	
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
	
	// Internal methods
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
			injectedValues._all = args;
			
			// Call the action function
			return info.action.call(getCurrentKeyValue, injectedValues);
		};
		
		var getCurrentKeyValue = function() {
			return args[currentKeyName];
		};
		
		var thisObject = {args: args};
		
		info.keys.forEach(function(key) {
			currentKeyName = key;
			info.behavior.call(thisObject, key, preparedAction, info.extra);
		});
	};
	
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

common.exposed.addFilterFunction = function(name, behavior) {
	var filterFunctions = common.internal.filterFunctions;
	if (!filterFunctions[name]) {
		filterFunctions[name] = behavior;
	} else {
		throw new Error("There is already a filter function named “" + name + "”.");
	}
};

// Internal
common.internal = {};

common.internal.filterFunctions = {
	set: function(key, action) {
		this.args[key] = action();
	},
	default: function(key, action) {
		if (this.args[key] === undefined) this.args[key] = action();
	},
	in: function(key, action, extra) {
		var allowedValues = action(),
			defaultIndex = parseInt(extra[0]) || 0;
		
		if (allowedValues.indexOf(this.args[key]) == -1) {
			this.args[key] = allowedValues[defaultIndex];
		}
	}
};

return common.exposed;
})();
