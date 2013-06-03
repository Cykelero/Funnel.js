
var CacheRepository = (function() {

// Exposed
var exposed = {};

exposed.get = function(storeId, objectId) {
	var store = internal.stores[storeId];
	
	if (!store) return null;
	
	return store[objectId];
};

exposed.set = function(storeId, objectId, value) {
	var store = internal.stores[storeId];
	
	if (!store) store = internal.stores[storeId] = {};
	
	store[objectId] = value;
};

// Internal
var internal = {};

internal.stores = {};

return exposed;
})();
