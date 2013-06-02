// provides Funnel

// needs +Instance.js
// needs +InstanceSignature.js

Funnel = (function() {

// Exposed
var exposed = function(firstSignature) {
	var instance = new FunnelInstance();
	return instance.getRemote()(firstSignature);
};

// // Extension
exposed.add = {};

exposed.add.filterFunction = function(name, behavior) {
	FunnelInstanceSignature.addFilterFunction(name, behavior);
};

return exposed;
})();
