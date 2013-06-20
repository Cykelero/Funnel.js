// provides Funnel

// needs +InstanceFactory.js
// needs +InstanceSignature.js

Funnel = (function() {

// Exposed
var exposed = function(firstSignature) {
	return internal.defaultFactory.getRemote()(firstSignature);
};

exposed.withOptions = function(options) {
	var factory = new FunnelInstanceFactory(options);
	return factory.getRemote();
};

// // Extension
exposed.add = {};

exposed.add.filterFunction = function(name, behavior) {
	FunnelInstanceSignature.addFilterFunction(name, behavior);
};

// Internal
var internal = {};

internal.defaultFactory = new FunnelInstanceFactory();

return exposed;
})();
