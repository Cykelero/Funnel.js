// needs kg3.js

var FunnelInstanceSignaturePattern = (function() {

var signaturePatterns = {
	// Root
	root: function(stringSignature) {
		return signaturePatterns.namedValueList(stringSignature);
	},
	
	// Named value list
	namedValueList: KG3.patternUsingPattern(function() {
		return signaturePatterns.nameTypePairs;
	}, function(result) {
		this.return({
			matches: true,
			takes: result.takes,
			produces: arglistPatterns.mapArrayToObject(result.produces)
		});
	}, this),
	
	// Name/type pairs
	nameTypePairs: KG3.patternUsingPattern(function() {
		return KG3.meta.repeat(KG3.meta.whsp(KG3.meta.either([signaturePatterns.nameTypePair])), ","); // , signaturePatterns.eitherNameTypePairs
	}, function(result) {
		var produced = [];
		
		var resultProduct = result.produces;
		for (var i = 0 ; i < resultProduct.length ; i++) {
			produced.push.apply(produced, resultProduct[i]);
		}
		
		this.return({
			matches: true,
			takes: result.takes,
			produces: produced
		});
	}, true),
	
	nameTypePair: KG3.patternUsingPattern(function() {
		return KG3.meta.list([signaturePatterns.attributeName, KG3.meta.whsp(":"), signaturePatterns.attributeType]);
	}, function(result) {
		this.return({
			matches: true,
			takes: result.takes,
			produces: [arglistPatterns.setNameTypePair(result.produces[0], result.produces[2])]
		});
	}, true),
	
	attributeName: /[a-zA-Z_]\w*/,
	
	// Types
	attributeType: KG3.patternUsingPattern(function() {
		return KG3.meta.repeat(
			signaturePatterns.innerAttributeType,
			KG3.meta.whsp("|"),
			true,
			1
		);
	}, function(result) {
		this.return({
			matches: true,
			takes: result.takes,
			produces: KG3.meta.either(result.produces)
		});
	}, true),
	
	innerAttributeType: KG3.patternUsingPattern(function() {
		return KG3.meta.repeat(
			KG3.meta.list([
				KG3.meta.either(signaturePatterns.attributeTypes),
				KG3.meta.optional(KG3.meta.whsp(KG3.meta.either(signaturePatterns.quantifiers), 1))
			]),
			KG3.meta.whsp(","),
			true,
			1
		);
	}, function(result) {
		var typePatternList = result.produces,
			producedList = [],
			produced;
		
		for (var i = 0 ; i < typePatternList.length; i++) {
			var listElement = typePatternList[i];
			
			var typePattern = listElement[0],
				quantifier = listElement[1];
			 
			if (quantifier) {
				typePattern = quantifier(typePattern);
			}
			
			producedList.push(typePattern);
		}
		
		if (producedList.length == 1) {
			produced = producedList[0];
		} else {
			produced = KG3.meta.list(producedList);
		}
		
		this.return({
			matches: true,
			takes: result.takes,
			produces: produced
		});
	}, true),
	
	attributeTypes: [
		// Those patterns match type definitions, and return type getter patterns
		// // Native type
		KG3.patternUsingPattern(/\w+/, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getValueOfType([result.produces])
			});
		}, true),
		// // Complete type, enclosed in parentheses
		KG3.patternUsingPattern(function() {
			return KG3.meta.list([
				"(",
				KG3.meta.whsp(signaturePatterns.attributeType),
				")"
			]);
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: result.produces[1]
			});
		}, true),
		// Array
		KG3.patternUsingPattern(function() {
			return KG3.meta.list([
				"[",
				KG3.meta.optional(KG3.meta.whsp(signaturePatterns.attributeType)),
				"]"
			])
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getArrayWithFilter(result.produces[1])
			});
		}, true),
		// Mapped array
		KG3.patternUsingPattern(function() {
			return KG3.meta.list([
				"[",
				signaturePatterns.namedValueList,
				KG3.meta.optional(KG3.meta.whsp("/", 1)),
				"]"
			])
		}, function(result) {
			var strictMatch = !!result.produces[2];
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getArrayAsObject(result.produces[1], strictMatch)
			});
		}, true)
	],
	quantifiers: [
		// Those patterns merely return wrappers, ready to be filled with patterns
		// // Optional
		KG3.patternUsingPattern("?", function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: function(typePattern) {
					return KG3.meta.optional(typePattern);
				}
			});
		}, true),
		// // Weak repeated
		KG3.patternUsingPattern("*", function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: function(typePattern) {
					return KG3.meta.repeat(typePattern, true, 0);
				}
			});
		}, true),
		// // Repeated
		KG3.patternUsingPattern("+", function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: function(typePattern) {
					return KG3.meta.repeat(typePattern, true, 1);
				}
			});
		}, true),
		// // Specific repeated
		KG3.patternUsingPattern(KG3.meta.list([
			"{",
			KG3.meta.whsp(/\d*/),
			",",
			KG3.meta.whsp(/\d*/),
			"}"
		]), function(result) {
			var source = result.produces;
			
			var min = source[1],
				max = source[3];
			
			if (min.length) {
				min = parseInt(min);
			} else {
				min = 0;
			}
			
			if (max.length) {
				max = parseInt(max);
			} else {
				max = Number.POSITIVE_INFINITY;
			}
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: function(typePattern) {
					return KG3.meta.repeat(typePattern, true, min, max);
				}
			});
		}, true)
	]
};

var arglistPatterns = {
	mapArrayToObject: function(nameTypePairs) {
		// nameTypePairs is an array of patterns which take elements from the array, and output {name value} objects
		return KG3.patternUsingPattern(KG3.meta.list(nameTypePairs), function(result) {
			var resultProduct = result.produces;
			
			var produced = {};
			
			for (var i = 0 ; i < resultProduct.length ; i++) {
				var pair = resultProduct[i];
				produced[pair.name] = pair.value;
			}
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: produced
			});
		}, true);
	},
	
	setNameTypePair: function(name, value) {
		return KG3.patternUsingPattern(value, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: {name: name, value: result.produces}
			});
		}, true);
	},
	
	getValueOfType: function(typeList) {
		return KG3.pattern(function(data, position) {
			this.returnFail();
			
			var value = data[position],
				valueType = typeof(value);
						
			for (var i = 0 ; i < typeList.length ; i++) {
				if (valueType == typeList[i]) {
					this.return({
						matches: true,
						takes: 1,
						produces: value
					});
					break;
				}
			}
		});
	},
	getArrayWithFilter: function(filter) {
		return KG3.pattern(function(data, position) {
			this.returnFail();
			
			var value = data[position];
			
			// Must be an array
			if (value.__proto__ != Array.prototype) return;
			
			// Fulfilling the specified conditions
			if (filter) {
				var preparedFilter = filter(value),
					result = null,
					success = false;
				
				while (preparedFilter.hasNext()) {
					result = preparedFilter.getNext();
					if (result.matches && result.takes == value.length) {
						success = true;
						break;
					}
				}
				
				if (!success) return;
			}
			
			this.return({
				matches: true,
				takes: 1,
				produces: value
			});
		});
	},
	getArrayAsObject: function(mapper, strictMatch) {
		return KG3.pattern(function(data, position) {
			this.returnFail();
			
			var value = data[position];
			
			// Must be an array
			if (value.__proto__ != Array.prototype) return;
			
			// Mapping
			this.usingPatternWithData(mapper, value, 0, function(result) {
				if (strictMatch && result.takes != value.length) {
					this.returnFail();
					return;
				}
				
				this.return({
					matches: true,
					takes: 1,
					produces: result.produces
				});
			}, true);
		});
	}
};

return function(signatureString) {
	var signaturePatternGenerator = signaturePatterns.root(signatureString),
		result = null,
		generated;
	
	do {
		result = signaturePatternGenerator.getNext();
		if (result.takes == signatureString.length) {
			generated = result.produces;
			break;
		}
	} while (signaturePatternGenerator.hasNext());
	
	if (generated) {
		return function(arglist) {
			return generated(arglist).getNext().produces;
		}
	} else {
		return function() {
			return null;
		}
	}
}

})();
