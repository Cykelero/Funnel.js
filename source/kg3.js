/* KG3.js 0.4 - Nathan Manceaux-Panot (@Cykelero) */
/* A library to define and apply arbitrary grammars. */

var KG3;

(function() {

/* kG3Pattern.js */

var KG3Pattern = (function() {

var common = {};

// Exposed
common.exposed = function(behavior) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.behavior = behavior;
	
	internal.data = null;
	internal.position = null;
	
	internal.branchingPoints = null;
	internal.hasNext = null;
	internal.reach = null;
	
	
	// Exposed methods
	exposed.init = function(data, position) {
		internal.data = data;
		internal.position = position === undefined ? 0 : position;
		internal.branchingPoints = [];
		internal.hasNext = true;
		
		return exposed;
	};
	
	exposed.getNext = function() {
		internal.reach = null;
		return internal.getNext();
	};
	
	exposed.getReach = function() {
		return internal.reach;
	};
	
	exposed.hasNext = function() {
		return internal.hasNext;
	};
	
	// Internal methods
	internal.getNext = function() {
		if (!internal.hasNext) {
			return {
				matches: false,
				takes: null,
				produces: undefined,
				branches: false
			};
		};
		
		var returnObject;
		internal.hasNext = false;
		
		// Managing branches
		if (internal.branchingPoints.length) {
			while (true) {
				var branchingData = internal.branchingPoints[internal.branchingPoints.length-1];
				
				if (branchingData.hasAlternative) {
					branchingData.index++;
					break;
				} else {
					internal.branchingPoints.pop();
				}
			}
		}
		
		// Execution environment
		var environment = {
			return: function(object) {
				returnObject = object;
			},
			returnFail: function() {
				this.return({
					matches: false,
					takes: null,
					produces: undefined
				});
			},
			returnEmpty: function() {
				this.return({
					matches: true,
					takes: null,
					produces: undefined
				});
			},
			returnPattern: function(pattern, position) {
				this.returnPatternWithData(pattern, internal.data, position);
			},
			returnPatternWithData: function(pattern, data, position) {
				this.usingPatternWithData(pattern, data ? data : internal.data, position, function(result) {
					this.return(result);
				});
			},
			branch: function(behavior) {
				var branchingPoint = {
					behavior: behavior,
					index: 0,
					hasAlternative: null
				}
				
				internal.branchingPoints.push(branchingPoint);
				
				branchingPoint.hasAlternative = !!behavior.call(environment, branchingPoint.index);
				if (branchingPoint.hasAlternative) internal.hasNext = true;
			},
			usingPattern: function(pattern, position, behavior, failBehavior) {
				this.usingPatternWithData(pattern, internal.data, position, behavior, failBehavior);
			},
			usingPatternWithData: function(pattern, data, position, behavior, failBehavior) {
				pattern = common.internal.castToPattern(pattern);
				
				var acceptFails = !failBehavior;
				if (typeof(failBehavior) != "function") failBehavior = null;
				
				var patternInstance = pattern().init(data, position);
				this.branch(function() {
					var result = patternInstance.getNext();
					internal.extendReachTo(patternInstance.getReach());
					
					if (result.matches || acceptFails) {
						behavior.call(this, result);
					} else {
						if (failBehavior) {
							failBehavior.call(this, result);
						} else {
							this.returnFail();
						}
					}
					
					return result.branches || result.matches;
				});
			}
		};
		
		// Proper execution
		if (internal.branchingPoints.length == 0) {
			// First run
			var returnedValue = internal.behavior.call(environment, internal.data, internal.position);
			returnObject = returnObject || returnedValue;
		} else {
			var branchingPoint = internal.branchingPoints[internal.branchingPoints.length-1];
			branchingPoint.hasAlternative = !!branchingPoint.behavior.call(environment, branchingPoint.index);
		}
		
		// Nothing returned?
		if (!returnObject) {
			environment.returnFail();
		}
		
		// Reach calculation
		internal.extendReachTo(internal.position + returnObject.takes);
		
		// Disabling the environment
		common.internal.disable(environment, "The “this” object you calling the {methodName}() method on is no longer valid. If you are trying to pass a context to a custom function, please do so using an argument, or the call() method.");
		
		// hasNext?
		if (!internal.hasNext) {
			for (var i = 0 ; i < internal.branchingPoints.length ; i++) {
				if (internal.branchingPoints[i].hasAlternative) {
					internal.hasNext = true;
					break;
				}
			}
		}
		
		// Return, or retry
		if (returnObject.matches || !internal.hasNext) {
			returnObject.branches = internal.hasNext;
			return returnObject;
		} else {
			// No match, but can still branch: retrying
			return internal.getNext();
		}
	};
	
	internal.extendReachTo = function(reach) {
		internal.reach = Math.max(internal.reach, reach);
	};
};

// Internal
common.internal = {};

common.internal.castToPattern = function(value) {
	if (value && value.isPatternFactory) return value;
	
	if (value instanceof RegExp) {
		// Regular expression
		return function() {
			return new common.exposed(function(data, position) {
				var sliced = data.slice(position),
					regex = new RegExp("^"+value.source);
				
				var matchResults = regex.exec(sliced);
				
				if (matchResults != null) {
					this.return({
						matches: true,
						takes: matchResults[0].length,
						produces: matchResults[0]
					});
				} else {
					this.returnFail();
				}
			});
		}
	} else if (typeof(value) == "function") {
		return common.internal.castToPattern(value());
	} else {
		// Anything else (converted to string)
		var string = value.toString(),
			length = string.length;
		
		return function() {
			return new common.exposed(function(data, position) {
				if (data.substr(position, length) == string) {
					this.return({
						matches: true,
						takes: length,
						produces: string
					});
				} else {
					this.returnFail();
				}
			});
		}
	}
}

common.internal.disable = function(object, message) {
	for (var p in object) {
		if (object.hasOwnProperty(p) && typeof(object[p]) == "function") {
			object[p] = function() {
				throw(new Error(message.replace("{methodName}", p)));
			}
		}
	}
};

return common.exposed;
})();

/* KG3.js */

KG3 = (function() {

// Exposed
var exposed = {},
	KG3 = exposed;

exposed.pattern = function(behavior) {
	var patternFactory = function(data, position) {
		return (new KG3Pattern(behavior)).init(data, position);
	};
	patternFactory.isPatternFactory = true;
	return patternFactory;
}

exposed.patternUsingPattern = function(pattern, behavior, failBehavior) {
	return exposed.pattern(function(data, position) {
		this.usingPattern(pattern, position, behavior, failBehavior);
	});
}

exposed.meta = {
	// Generic
	optional: function(pattern, greedy) {
		if (greedy === undefined) {
			greedy = true;
		} else {
			greedy = !!greedy;
		}
		
		return KG3.pattern(function(data, position) {
			this.branch(function(branchIndex) {
				if (!!branchIndex != greedy) {
					// Want!
					this.returnPattern(pattern, position);
					
				} else {
					// No need, thanks
					this.returnEmpty();
				}
				
				return (branchIndex == 0);
			});
		});
	},
	either: function(patternList) {
		var maxIndex = patternList.length-1;
		return KG3.pattern(function(data, position) {
			this.branch(function(branchIndex) {
				this.returnPattern(patternList[branchIndex], position);
				return branchIndex < maxIndex;
			});
		});
	},
	
	// Lists
	list: function(patternList) {
		if (!patternList || !patternList.length) {
			return KG3.pattern(function() {
				this.returnEmpty();
			});
		}
		
		return KG3.pattern(function(data, position) {
			var produced = [];
			
			var usePatternFromList = function(index, subPosition) {
				this.usingPattern(patternList[index], subPosition, function(result) {
					produced[index] = result.produces;
					
					var nextIndex = index + 1,
						nextPosition = subPosition+result.takes;
					if (nextIndex < patternList.length) {
						usePatternFromList.call(this, nextIndex, nextPosition);
					} else {
						this.return({
							matches: true,
							takes: nextPosition-position,
							produces: produced.slice(0)
						});
					}
				}, true);
			}
			
			usePatternFromList.call(this, 0, position);
		});
	},
	repeat: function(pattern, separatorPattern, greedy, min, max) {
		// separatorPattern can be omitted
		// greedy defaults to -1, which means “take the most possible, no less”
		
		var patternWithSeparator;
		if (separatorPattern && typeof(separatorPattern) != "boolean") {
			patternWithSeparator = KG3.meta.list([separatorPattern, pattern]);
		} else {
			max = min;
			min = greedy;
			greedy = separatorPattern;
			separatorPattern = null;
		}
		
		var onlyTheMost = true;
		if (greedy === undefined) {
			greedy = true;
		} else {
			if (greedy == -1) {
				greedy = true;
			} else {
				greedy = !!greedy;
				onlyTheMost = false;
			}
		}
		
		if (isNaN(min)) min = 0;
		if (isNaN(max)) max = Number.POSITIVE_INFINITY;
		
		min = Math.max(min, 0);
		max = Math.max(max, min);
		
		return KG3.pattern(function(data, position) {
			var produced = [];
			
			var matchOne = function(subPosition, matchCount) {
				var couldGoFurther = false;
				
				this.branch(function(branchIndex) {
					if (!!branchIndex != greedy && matchCount < max) {
						// Should attemp to match a pattern
						var withSeparator = !!separatorPattern && matchCount,
							actualPattern = withSeparator ? patternWithSeparator : pattern;
						
						this.usingPattern(actualPattern, subPosition, function(result) {
							produced.length = matchCount;
							produced.push(withSeparator ? result.produces[1] : result.produces);
							matchOne.call(this, subPosition+result.takes, matchCount+1);
							
							couldGoFurther = true;
						}, true);
					} else {
						// Either at the end, or not trying to match anyway
						if (matchCount >= min && (!onlyTheMost || !couldGoFurther)) {
							// Enough matches
							produced.length = matchCount;
							this.return({
								matches: true,
								takes: subPosition-position,
								produces: produced.slice(0)
							});
						} else {
							// Not enough matches
							this.returnFail();
						}
					}
					return branchIndex == 0 && matchCount < max;
				});
			}
			
			matchOne.call(this, position, 0);
		});
	},
	
	// Strings
	whsp: function(pattern, where, includeLineBreaks) {
		if (typeof(where) != "number") where = 3;
		if (includeLineBreaks === undefined) includeLineBreaks = true;
		
		var whitespacePattern = includeLineBreaks ? /^\s*/ : /^[\t ]*/;
		
		return KG3.pattern(function(data, position) {
			var sliced = data.slice(position),
				preLength = 0;
			
			// Preceding whitespace
			if (where & 1) {
				preLength = whitespacePattern.exec(sliced)[0].length;
				sliced = sliced.slice(preLength);
			}
			
			// Actual pattern
			this.usingPattern(pattern, position+preLength, function(result) {
				var totalWhitespaceLength = preLength;
				
				if (where & 2) {
					// Following whitespace
					var followingSlice = sliced.slice(result.takes);
					totalWhitespaceLength += whitespacePattern.exec(followingSlice)[0].length;
				}
				
				this.return({
					matches: true,
					takes: result.takes+totalWhitespaceLength,
					produces: result.produces
				});
			}, true);
		});
	}
};

return exposed;
})();

})();
