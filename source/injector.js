
var Injector = (function() {

// Exposed
var exposed = {};

exposed.prepare = function(func) {
	var requested;
	
	// Detect requested args
	var functionSource = func.toString();
	
	// // Minifier-resilient syntax
	var argumentListHint = /^[^(]+\([^)]*\)\s*\{\s+\/([^\/]*)\/\s*;/.exec(functionSource);
	if (argumentListHint) {
		requested = argumentListHint[1].split(/\s*,\s*/);
	}
	
	// // Classic syntax
	if (!requested) {
		var argumentString = /^[^(]+\(([^)]*)\)/.exec(functionSource)[1];
		
		requested = argumentString.split(/\s*,\s*/);
	}
	
	// Create injectable function
	var injectable = function(values) {
		// Use the `naked` attribute of this function to access the wrapped code
		
		var valueList = [];
		requested.forEach(function(argName) {
			valueList.push(values[argName]);
		});
		return func.apply(this, valueList);
	};
	
	injectable.naked = func;
	injectable.expected = requested;
	
	return injectable;
};

return exposed;
})();
