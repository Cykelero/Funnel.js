// provides Funnel

// needs +Instance.js

Funnel = (function() {

// Exposed
var exposed = function(firstSignature) {
	var instance = new FunnelInstance();
	return instance.getRemote()(firstSignature);
};

return exposed;
})();
