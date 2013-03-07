ask: Funnel
	("parameters: {for: string, as?: string, default?: any, ofType?: string}")
		.set(function ofType(parameters) {
			if (typeof(parameters.default) == "undefined") {
				return this;
			} else {
				return null;
			}
		})
(function(parameters) {
	[...]
});

define: Funnel
	("name: string, value: any")
		.set(function pairs(name, value) {
			var pairs = {};
			pairs[name] = value;
			return pairs;
		})
	("pairs: object")
(function(pairs) {
	[...]
});

filter: Funnel
	("booleanJoin?: string, condition: any")
		.in("booleanJoin", ["or", "and"])
(function(pairs) {
	[...]
});

rank: Funnel
	("scoringMethod?: string, score: number, condition: any")
		.in("scoringMethod", ["sum", "first"])
(function(pairs) {
	[...]
});
