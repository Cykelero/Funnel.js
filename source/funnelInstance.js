// needs remote.js
// needs +Signature.js


var FunnelInstance = (function() {

var common = {};

// Exposed
common.exposed = function() {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.currentSignature = null;
	internal.signatures = [];
	internal.nakedFunction = null;
	
	internal.remote = null;
	
	// Exposed methods
	exposed.getRemote = function() {
		return internal.remote;
	};
	
	// Internal methods
	internal.getAugmentedFunction = function() {
		var augmented = function() {
			// Use the `naked` attribute of this function to access the wrapped code
			return internal.callWithArguments(this, arguments);
		};
		augmented.naked = internal.nakedFunction;
		
		return augmented;
	};
	
	internal.callWithArguments = function(self, args) {
		for (var i = 0 ; i < internal.signatures.length ; i++) {
			var mappedArguments = internal.signatures[i].applyTo(self, args);
			if (mappedArguments) {
				return internal.nakedFunction.call(self, mappedArguments); // [todo] write (and make use of) Injector.js
			};
		}
		return null; // [todo] define how to define fail behavior.
	};
	
	var baseRemoteMethod = function(arg) {
		if (typeof(arg) == "string") {
			// Creating a new FunnelInstanceSignature
			internal.currentSignature = new FunnelInstanceSignature(arg);
			internal.signatures.push(internal.currentSignature);
		} else if (typeof(arg) == "function") {
			// Finalizing; returning the augmented function
			internal.nakedFunction = arg;
			return internal.getAugmentedFunction();
		}
	};
	
	var remoteMethods = {
		set: function(a, b) {
			var parameters = common.internal.formatFunctionParameters(a, b);
			
			internal.currentSignature.addPostProcess("set", {
				attributeNames: parameters.attributeNames,
				valueProvider: parameters.valueProvider
			});
		}
	};
	
	// Init
	internal.remote = Remote.make(this, baseRemoteMethod, remoteMethods);
};

// Internal
common.internal = {};

return common.exposed;
})();