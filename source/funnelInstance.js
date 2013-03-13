// needs remote.js
// needs +Signature.js


var FunnelInstance = (function() {

var common = {};

// Exposed
common.exposed = function() {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.signatures = [];
	internal.naked = null;
	
	internal.remote = null;
	
	// Exposed methods
	exposed.getRemote = function() {
		return internal.remote;
	};
	
	// Internal methods
	internal.getAugmented = function() {
		var augmented = function() {
			// Use the `naked` attribute of this function to see the wrapped code
			return internal.callWithArguments(this, arguments);
		};
		augmented.naked = internal.naked;
		
		return augmented;
	};
	
	internal.callWithArguments = function(self, args) {
		for (var i = 0 ; i < internal.signatures.length ; i++) {
			var mappedArguments = internal.signatures[i].applyTo(self, args);
			if (mappedArguments) {
				return internal.naked.call(self, mappedArguments); // actually I have to inject stuff, but fukkit for now
			};
		}
		return null; // meh. I have to define how to define fail behavior.
	};
	
	// Init
	internal.currentSignature = null;
	internal.remote = Remote.make(this, function(arg) {
		if (typeof(arg) == "string") {
			// Creating a new FunnelInstanceSignature
			internal.currentSignature = new FunnelInstanceSignature(arg);
			internal.signatures.push(internal.currentSignature);
		} else if (typeof(arg) == "function") {
			// Returning the augmented function
			internal.naked = arg;
			return internal.getAugmented();
		}
	}, {
		set: function(a, b) {
			var parameters = common.internal.formatFunctionParameters(a, b);
			
			internal.currentSignature.addPostProcess("set", {
				attributeNames: parameters.attributeNames,
				valueProvider: parameters.valueProvider
			});
		}
	});
};

// Internal
common.internal = {};

return common.exposed;
})();
