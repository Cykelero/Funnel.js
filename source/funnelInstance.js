// needs remote.js
// needs injector.js
// needs +Signature.js

var FunnelInstance = (function() {

var common = {};

// Exposed
common.exposed = function() {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.remote = null;
	
	internal.currentSignature = null;
	internal.signatures = [];
	internal.nakedFunction = null;
	internal.injectableFunction = null;
	
	// Exposed methods
	exposed.getRemote = function() {
		return internal.remote;
	};
	
	var baseRemoteMethod = function(arg) {
		if (typeof(arg) == "string") {
			internal.addSignature(arg);
		} else if (typeof(arg) == "function") {
			internal.setFunneledFunction(arg);
			return internal.makeAugmentedFunction();
		}
	};
	
	// Internal methods
	internal.addSignature = function(signatureString) {
		var newSignature = new FunnelInstanceSignature(signatureString)
		
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
		} else if (type0 == "string") {
			keys = [arg0];
			action = (type1 == "function")
				? arg1
				: function() { return arg1 };
			extra = args.slice(2);
		} else if (type0 == "object") {
			keys = arg0;
			action = (type1 == "function")
				? arg1
				: function() { return arg1 };
			extra = args.slice(2);
		}
		
		internal.currentSignature.addFilterFunction(name, keys, action, extra);
	};
	
	internal.setFunneledFunction = function(func) {
		internal.nakedFunction = func;
		internal.injectableFunction = Injector.prepare(func);
	};
	
	internal.callWithArguments = function(self, args) {
		internal.signatures.forEach(function(signature) {
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
				
				return internal.injectableFunction.call(self, injectedArguments);
			};
		});
		
		// No signature matched
		
		return null;
	};
	
	internal.makeAugmentedFunction = function() {
		var augmented = function() {
			// Use the `naked` attribute of this function to access the wrapped code
			return internal.callWithArguments(this, arguments);
		};
		augmented.naked = internal.nakedFunction;
		
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
