
var Remote = (function() {

// Exposed
var exposed = {};

exposed.make = function(self, baseFunction, methods) {
	var remote = function() {
		return executeMethod(baseFunction, arguments);
	};
	
	for (var m in methods) {
		if (methods.hasOwnProperty(m)) {
			remote[m] = (function(m) {
				return function() {
					return executeMethod(methods[m], arguments);
				};
			})(m);
		}
	}
	
	var executeMethod = function(method, args) {
		var returned = method.apply(self, args);
		
		if (returned === undefined) {
			return remote;
		} else {
			return returned;
		}
	};
	
	return remote;
};

return exposed;
})();
