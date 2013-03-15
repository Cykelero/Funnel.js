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
	attributeType: KG3.patternUsingPattern(/\w+/, function(result) {
		this.return({
			matches: true,
			takes: result.takes,
			produces: arglistPatterns.getValueOfType([result.produces])
		});
	}, true)
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
	}
};

return function(signatureString) {
	var generated = signaturePatterns.root(signatureString).getNext().produces;
	
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
