// needs kg3.js

var FunnelInstanceSignaturePattern = (function() {

var signaturePatterns = {
	// Root
	root: function(stringSignature) {
		return signaturePatterns.namedValueList(stringSignature);
	},
	
	// Named value list
	namedValueList: KG3.patternUsingPattern(function() {
		return signaturePatterns.nameTypePairs(arglistPatterns.setNameTypePair);
	}, function(result) {
		this.return({
			matches: true,
			takes: result.takes,
			produces: arglistPatterns.mapArrayToObject(result.produces)
		});
	}, this),
	
	// Name/type pairs
	nameTypePairs: function(innerGeneratedPattern) {
		return KG3.patternUsingPattern(function() {
			return KG3.meta.repeat(
				signaturePatterns.innerNameTypePairs(innerGeneratedPattern),
				"|",
				true,
				1
			);
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: KG3.meta.either(result.produces)
			});
		}, true)
	},
	
	innerNameTypePairs: function(innerGeneratedPattern) {
		return KG3.patternUsingPattern(function() {
			return KG3.meta.repeat(
				KG3.meta.whsp(KG3.meta.either([
					signaturePatterns.nameTypePair(innerGeneratedPattern),
					signaturePatterns.enclosedNameTypePairs(innerGeneratedPattern)
				])),
				",",
				true,
				1
			);
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: KG3.meta.list(result.produces)
			});
		}, true)
	},
	
	enclosedNameTypePairs: function(innerGeneratedPattern) {
		return KG3.patternUsingPattern(function() {
			return KG3.meta.list([
				"(",
				KG3.meta.whsp(signaturePatterns.nameTypePairs(innerGeneratedPattern)),
				")"
			]);
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: result.produces[1]
			});
		}, true);
	},
	
	nameTypePair: function(generatedPattern) {
		return KG3.patternUsingPattern(function() {
			return KG3.meta.list([signaturePatterns.attributeName, KG3.meta.whsp(":"), signaturePatterns.attributeType]);
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: generatedPattern(result.produces[0], result.produces[2])
			});
		}, true)
	},
	
	attributeName: KG3.meta.either([
		/[a-zA-Z_$][a-zA-Z_$\d]*/,
		KG3.patternUsingPattern(/`([^`]|\\`)*`/, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: result.produces.slice(1, -1)
			});
		}, true)
	]),
	
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
		KG3.patternUsingPattern(/\w+!?!?/, function(result) {
			var type = result.produces;
			
			var bang = type.slice(-1) == "!",
				kabang = type.slice(-2, -1) == "!";
			
			if (bang) {
				type = type.slice(0, -1);
				
				if (kabang) {
					type = type.slice(0, -1);
				}
			}
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getValueOfType(type, !bang, !kabang)
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
				KG3.meta.optional(KG3.meta.whsp("/", 1)),
				"]"
			])
		}, function(result) {
			var strictMatch = !!result.produces[2];
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getArrayWithFilter(result.produces[1], strictMatch)
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
		}, true),
		// Empty object
		KG3.patternUsingPattern(/\{\s*\}/, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getAnyObject
			});
		}, true),
		// Type-constrained object
		KG3.patternUsingPattern(function() {
			return KG3.meta.list([
				"{",
				KG3.meta.optional(KG3.meta.whsp(signaturePatterns.attributeType)),
				"}"
			])
		}, function(result) {
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getObjectWithTypeFilter(result.produces[1])
			});
		}, true),
		// Key-constrained object
		KG3.patternUsingPattern(function() {
			return KG3.meta.list([
				"{",
				KG3.meta.optional(KG3.meta.whsp(signaturePatterns.nameTypePairs(arglistPatterns.getKeyWithFilter))),
				KG3.meta.optional(KG3.meta.whsp("/", 1)),
				"}"
			])
		}, function(result) {
			var filter = result.produces[1],
				strict = !!result.produces[2];
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getObjectWithKeyFilter(filter, strict)
			});
		}, true),
		// // Specific string
		KG3.patternUsingPattern(KG3.meta.either([
			/"([^"]|\\")*"/,
			/'([^']|\\')*'/
		]), function(result) {
			var stringToMatch = result.produces.slice(1, -1);
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getValueEqualTo(stringToMatch)
			});
		}, true),
		// // Specific number
		KG3.patternUsingPattern(KG3.meta.either([
			/(\+|\-)\d*.\d*/
		]), function(result) {
			var numberToMatch = parseFloat(result.produces);
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: arglistPatterns.getValueEqualTo(numberToMatch)
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
		}, true),
		// // Specific count
		KG3.patternUsingPattern(KG3.meta.list([
			"{",
			KG3.meta.whsp(/\d/),
			"}"
		]), function(result) {
			var count = parseInt(result.produces[1]);
			
			this.return({
				matches: true,
				takes: result.takes,
				produces: function(typePattern) {
					return KG3.meta.repeat(typePattern, true, count, count);
				}
			});
		}, true)
	]
};

var arglistPatterns = {
	mapArrayToObject: function(pairGenerator) {
		// nameTypePairs is an array of patterns which take elements from the array, and output {name value} objects
		return KG3.patternUsingPattern(pairGenerator, function(result) {
			var produced = {};
			
			crawlPairs(result.produces);
			function crawlPairs(list) {
				list.forEach(function(item) {
					if (typeof(item.name) == "string") {
						produced[item.name] = item.value;
					} else {
						crawlPairs(item);
					}
				});
			};
			
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
	
	getValueOfType: function(filterType, allowUndefined, allowNull) {
		return KG3.pattern(function(data, position) {
			var value = data[position],
				valueType = typeof(value);
				
			var matches = false,
				isSpecific = false;
			
			switch (filterType) {
				// Generic
				case "any":
					matches = true;
					break;
				case "flat":
					matches = (value === null)
						|| (valueType != "object");
					break;
				// Precise numbers
				case "float":
					matches = (valueType == "number" && !isNaN(value));
					break;
				case "finite":
					matches = (valueType == "number") && isFinite(value);
					break;
				case "integer":
					matches = (valueType == "number" && value % 1 == 0);
					break;
				case "natural":
					matches = (valueType == "number" && value % 1 == 0 && value >= 0);
					break;
				// Specific values
				case "true":
					matches = !!value;
					isSpecific = true;
					break;
				case "false":
					matches = !value;
					isSpecific = true;
					break;
				case "null":
					matches = (value === null);
					isSpecific = true;
					break;
				case "undefined":
					matches = (value === undefined);
					isSpecific = true;
					break;
				default:
					matches = (valueType == filterType);
			}
			
			if (!isSpecific) {
				if (value === undefined) {
					if (allowUndefined) {
						matches = true;
					} else {
						matches = false;
					}
				}
				if (value === null) {
					if (allowNull) {
						matches = true;
					} else {
						matches = false;
					}
				}
			}
			
			if (matches) {
				this.return({
					matches: true,
					takes: 1,
					produces: value
				});
			} else {
				this.returnFail();
			}
		});
	},
	getValueEqualTo: function(toMatch) {
		return KG3.pattern(function(data, position) {
			var value = data[position];
			
			if (value === toMatch) {
				this.return({
					matches: true,
					takes: 1,
					produces: value
				});
			} else {
				this.returnFail();	
			}
		});
	},
	getArrayWithFilter: function(filter, strict) {
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
					if (result.matches) {
						if (!strict || result.takes == value.length) {
							success = true;
							break;
						}
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
	},
	getAnyObject: function() {
		return KG3.pattern(function(data, position) {
			this.returnFail();
			
			var value = data[position];
			
			if (typeof(value) != "object") return;
			if (value.__proto__ == Array.prototype) return;
			
			this.return({
				matches: true,
				takes: 1,
				produces: value
			});
		});
	},
	getObjectWithTypeFilter: function(filter) {
		return KG3.pattern(function(data, position) {
			this.returnFail();
			
			var value = data[position];
			
			if (typeof(value) != "object") return;
			if (value.__proto__ == Array.prototype) return;
			
			for (var p in value) {
				if (value.hasOwnProperty(p)) {
					var prop = value[p];
					if (!filter([prop]).getNext().matches) return;
				}
			}
			
			this.return({
				matches: true,
				takes: 1,
				produces: value
			});
		});
	},
	getObjectWithKeyFilter: function(filter, strict) {
		return KG3.pattern(function(data, position) {
			this.returnFail();
			
			var value = data[position];
			
			if (typeof(value) != "object") return;
			if (value.__proto__ == Array.prototype) return;
			
			var result = filter(value).getNext();
			
			if (!result.matches) return;
			
			if (strict) {
				var allowedKeys = [];
				
				// Flatten key list
				crawlKeys(result.produces);
				function crawlKeys(list) {
					list.forEach(function(item) {
						if (typeof(item) == "string") {
							allowedKeys.push(item);
						} else {
							crawlKeys(list);
						}
					});
				}
				
				// Check for disallowed keys
				for (var p in value) {
					if (value.hasOwnProperty(p)) {
						if (allowedKeys.indexOf(p) == -1) return;
					}
				}
			}
			
			this.return({
				matches: true,
				takes: 1,
				produces: value
			});
		});
	},
	getKeyWithFilter: function(name, typeFilter) {
		return KG3.pattern(function(data, position) {
			var value = data[name],
				preparedFilter = typeFilter([value]),
				filterResult = preparedFilter.getNext();
			
			var matches;
			
			if (value === undefined) {
				// Value is undefined: match only if the type is optional
				matches = false;
				do {
					matches = (filterResult.matches && !filterResult.takes);
					if (matches) break;
					filterResult = preparedFilter.getNext();
				} while (filterResult.matches);
			} else {
				// Value is defined: match only if the type doesn't make use of its (potential) optionality
				if (filterResult.matches && filterResult.takes > 0) {
					matches = true;
				} else {
					matches = false;
				}
			}
			
			if (matches) {
				this.return({
					matches: true,
					takes: null,
					produces: name
				});
			} else {
				this.returnFail();
			}
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
