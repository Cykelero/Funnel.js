// provides Funnel

// needs +Instance.js

var Funnel = (function() {

// Exposed
var exposed = function(firstSignature) {
	var instance = new FunnelInstance();
	return instance.getRemote()(firstSignature);
};

// Internal
var internal = {};

return exposed;
})();
