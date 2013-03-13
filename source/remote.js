
var Remote = (function() {

// Exposed
var exposed = {};

exposed.make = function(self, baseFunction, methods) {
	var remote = function() {
		var returned = baseFunction.apply(self, arguments);
		if (returned === undefined) {
			return remote;
		} else {
			return returned;
		}
	};
	
	for (var m in methods) {
		if (methods.hasOwnProperty(m)) {
			remote[m] = function() {
				var returned = methods[m].apply(self, arguments);
				if (returned === undefined) {
					return remote;
				} else {
					return returned;
				}
			};
		}
	}
	
	return remote;
};

// Internal
var internal = {};

return exposed;
})();
