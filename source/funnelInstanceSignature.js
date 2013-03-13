// needs +Pattern.js

var FunnelInstanceSignature = (function() {

var common = {};

// Exposed
common.exposed = function(signatureString) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.generated = null;
	
	// Exposed methods
	exposed.applyTo = function(self, args) {
		return internal.generated(args);
	};
	
	// Internal methods
	
	// Init
	internal.generated = FunnelInstanceSignaturePattern(signatureString);
	
};

// Internal
common.internal = {};

return common.exposed;
})();
