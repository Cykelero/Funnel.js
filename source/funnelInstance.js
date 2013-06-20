// needs remote.js
// needs injector.js
// needs +Signature.js

var FunnelInstance = (function() {

var common = {};

// Exposed
common.exposed = function(options) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.remote = null;
	
	internal.currentSignature = null;
	internal.signatures = [];
	
	internal.nakedFunction = null;
	internal.injectableFunction = null;
	internal.failHandler = null;
	internal.augmentedFunction = null
	
	internal.options = options;
	
	// Exposed methods
	exposed.getRemote = function() {
		return internal.remote;
	};
	
	var baseRemoteMethod = function(arg1, arg2) {
		if (typeof(arg1) == "string") {
			internal.addSignature(arg1);
		} else if (typeof(arg1) == "function") {
			internal.setFunneledFunction(arg1);
			if (typeof(arg2) == "function") internal.setFailHandler(arg2);
			internal.makeAugmentedFunction();
			
			return exposed.getAugmentedFunction()
		}
	};
	
	exposed.getAugmentedFunction = function() {
		return internal.augmentedFunction;
	};
	
	// Internal methods
	internal.addSignature = function(signatureString) {
		var newSignature = new FunnelInstanceSignature(signatureString, internal.options)
		
		internal.signatures.push(newSignature);
		internal.currentSignature = newSignature;
	};
	
	internal.addFilterFunction = function(name, args) {
		var keys, action, extra;
		
		var arg0 = args[0],
			arg1 = args[1],
			type0 = typeof(arg0),
			type1 = typeof(arg1);
		
		if (type0 == "function") {
			keys = [arg0.name];
			action = arg0;
			extra = args.slice(1);
		} else {
			if (type0 == "string") {
				keys = [arg0];
			} else {
				keys = arg0;
			}
			
			if (type1 == "function") {
				action = arg1;
			} else {
				action = function() {
					return arg1
				};
			}
			extra = args.slice(2);
		}
		
		internal.currentSignature.addFilterFunction(name, keys, action, extra);
	};
	
	internal.setFunneledFunction = function(func) {
		internal.nakedFunction = func;
		internal.injectableFunction = Injector.prepare(func);
	};
	
	internal.setFailHandler = function(func) {
		internal.failHandler = Injector.prepare(func);
	};
	
	internal.callWithArguments = function(self, args) {
		var success = false,
			returnedValue = null;
		
		for (var i = 0 ; i < internal.signatures.length ; i++) {
			var signature = internal.signatures[i];
			var mappedArguments = signature.applyTo(self, args);
			
			if (mappedArguments) {
				// The signature matches: execute the fonction
				var injectedArguments = {};
				
				for (var key in mappedArguments) {
					if (mappedArguments.hasOwnProperty(key)) {
						injectedArguments[key] = mappedArguments[key];
					}
				}
				
				injectedArguments._all = mappedArguments;
				injectedArguments._original = Array.prototype.slice.call(args, 0);
				
				var args = internal.options.useInjection
					? injectedArguments
					: [injectedArguments._all, injectedArguments._original];
				
				returnedValue = internal.injectableFunction.call(self, args);
				
				success = true;
				break;
			};
		};
		
		if (success) {
			return returnedValue;
		} else {
			if (internal.failHandler) {
				var injectedArguments = {_original: Array.prototype.slice.call(args, 0)};
				
				var args = internal.options.useInjection
					? injectedArguments
					: [injectedArguments._original];
				
				return internal.failHandler.call(self, args);
			} else {
				return null;
			}
		}
	};
	
	internal.makeAugmentedFunction = function() {
		var augmented = function() {
			// Use the `naked` attribute of this function to access the wrapped code
			return internal.callWithArguments(this, arguments);
		};
		augmented.naked = internal.nakedFunction;
		
		internal.augmentedFunction = augmented;
		return augmented;
	};
	
	// Init
	var remoteMethods = {};
	
	var filterFunctionNames = FunnelInstanceSignature.getFilterFunctionNames();
	filterFunctionNames.forEach(function(name) {
		remoteMethods[name] = function() {
			var argumentsAsArray = Array.prototype.slice.call(arguments, 0);
			internal.addFilterFunction(name, argumentsAsArray);
		};
	});
	
	internal.remote = Remote.make(this, baseRemoteMethod, remoteMethods);
};

return common.exposed;
})();
