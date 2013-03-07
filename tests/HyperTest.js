/* HyperTest 0.1a1 */

(function() {

var testSuiteData = null,
	
	globalScriptsLeftToLoad = null,
	testSuites = [],
	nextTestSuiteIndex = 0;

loadJSON("_testSuites.json", function(data) {
	testSuiteData = data;
	
	var testeeName = testSuiteData.testeeName,
		includeJS = testSuiteData.includeJS,
		testSuiteList = testSuiteData.testSuites;
	
	if (typeof(includeJS) != "object") includeJS = [includeJS];
	
	// Display testee name
	if (testeeName) {
		var h1 = document.getElementsByTagName("h1")[0];
		h1.innerText += "s for " + testeeName;
		document.title = h1.innerText;
	}
	
	// Include JS files in main document
	globalScriptsLeftToLoad = 0;
	for (var i = 0 ; i < includeJS.length ; i++) {
		globalScriptsLeftToLoad++;
		loadScript(includeJS[i], document, function() {
			globalScriptsLeftToLoad--;
			if (globalScriptsLeftToLoad == 0) executeTestSuites();
		});
	}
	
	// Load test suites
	for (var i = 0 ; i < testSuiteList.length ; i++) {
		var testSuiteURL = testSuiteList[i];
		loadScript(testSuiteURL, document, function(testSuiteURL) {
			return function() {
				var testSuiteName = /^(.+?)(\.[^.]+)?$/.exec(testSuiteURL)[1];
				testSuiteName = testSuiteName.replace(/\//g, "_");
				prepareTestSuite(testSuiteName);
			}
		}(testSuiteURL));
	}
});

function prepareTestSuite(testSuiteName) {
	var testSuiteObject = {
		name: testSuiteName,
		documentsRemainingToLoad: 0,
		isReady: function() {
			return this.documentsRemainingToLoad == 0;
		},
		tests: []
	};
	
	var testSuiteSource = window[testSuiteName];
	
	// Preparing tests
	for (var t in testSuiteSource) {
		var test = {
			name: t,
			code: testSuiteSource[t],
			
			argumentList: [],
			assertList: []
		};
		testSuiteObject.tests.push(test);
		
		var functionSource = test.code.toString();
		
		
		var argumentString = /^[^(]+\(([^)]*)\)/.exec(functionSource)[1],
			argumentList = argumentString.split(/\s*,\s*/);
		
		// Arguments
		for (var i = 0 ; i < argumentList.length ; i++) {
			var argumentName = argumentList[i];
			if (!argumentName.length) continue;
			
			
			if (/_/.test(argumentName)) {
				// Test document argument
				var testDocumentUrl = argumentName.replace("_", ".");
				
				testSuiteObject.documentsRemainingToLoad++;
				
				test.argumentList.push(function() {
					var testDoc = null;
					
					loadTestDocument(testDocumentUrl, function(loadedTestDoc) {
						testDoc = loadedTestDoc.contentDocument;
						
						testSuiteObject.documentsRemainingToLoad--;
						executeTestSuites();
					});
					
					return function() {
						return testDoc;
					};
				}());
				
				
			} else {
				// Unsupported argument
				test.argumentList.push(function() {return null});
				
			}
		}
		
		// Asserts
		var assertList = functionSource.match(/assert\w*\s*\(.+\)/g) || [];
		for (var i = 0 ; i < assertList.length ; i++) {
			test.assertList.push(assertList[i]);
		}
	}
	
	testSuites.push(testSuiteObject);
	executeTestSuites();
}

function executeTestSuites() {
	if (globalScriptsLeftToLoad) return;
	
	while (true) {
		var nextTestSuite = testSuites[nextTestSuiteIndex];
		if (!nextTestSuite || !nextTestSuite.isReady()) break;
		
		executeTestSuite(nextTestSuite);
		
		nextTestSuiteIndex++;
	}
}

function executeTestSuite(testSuite) {
	var h1 = document.getElementsByTagName("h1")[0];
	
	// HTML
	var suiteDiv = document.createElement("div");
	suiteDiv.className = "suite";
	document.getElementById("results").appendChild(suiteDiv);
	
	var h2 = document.createElement("h2");
	suiteDiv.appendChild(h2);
	
	h2.innerText = testSuite.name;
	
	// Tests
	for (var i = 0 ; i < testSuite.tests.length ; i++) {
		var test = testSuite.tests[i];
		
		// HTML
		var testDiv = document.createElement("div");
		testDiv.className = "test";
		suiteDiv.appendChild(testDiv);
		
		var h3 = document.createElement("h3");
		testDiv.appendChild(h3);
		
		h3.innerText = test.name;
		var table = document.createElement("table");
		testDiv.appendChild(table);
		
		// Building argument list
		var testArgs = [];
		for (var j = 0 ; j < test.argumentList.length ; j++) {
			testArgs[j] = test.argumentList[j]();
		}
		
		// Preparing assert() callback
		var assertNumber = -1;
		testEnvironment.assertCallback = function(success, errorObject) {
			assertNumber++;
			
			var tr = document.createElement("tr");
			table.appendChild(tr);
			
			var assertSource = test.assertList[assertNumber];
			tr.innerHTML = "<td class='assertNumber'>"+assertNumber+"</td><td class='assertSource'>"+assertSource+"</td>";
			
			if (!success) {
				h1.className = "fail";
				suiteDiv.className = "fail";
				h2.className = "fail";
				testDiv.className = "fail";
				h3.className = "fail";
				tr.className = "fail";
				
				tr.style.cursor = "pointer";
				tr.onclick = function(errorDetails) {
					return function() {
						console.log(testSuite.name+"/"+test.name+"/"+errorDetails.assertNumber);
						console.error(errorDetails);
					}
				}({
					errorObject: errorObject,
					assertNumber: assertNumber,
					assertSource: assertSource,
					testSource: test.code
				});
			}
		}
		
		// Executing
		try {
			test.code.apply(null, testArgs);
		} catch(e) {
			console.log("Uncaught error in "+testSuite.name+"/"+test.name+":");
			console.error(e.message);
			console.error(e);
			
			h1.className = "fail";
			suiteDiv.className = "fail";
			h2.className = "fail";
			testDiv.className = "fail";
			h3.className = "fail";
		}
		
	}
	delete(testEnvironment.assertCallback);
}

// Test environment
var testEnvironment = {
	assertCallback: null
}

// // Content tools
html_document = function(html) {
	var iframe = document.createElement("iframe");
	document.body.appendChild(iframe);
	
	iframe.contentDocument.write(html);
	return iframe.contentDocument;
}

html_element = function(html) {
	var doc = html_document(html);
	return doc.body.childNodes[0];
}


// // Assertion functions
assert = function(condition, errorObject) {
	testEnvironment.assertCallback(condition, errorObject);
}

assertEqual = function(value1, value2) {
	assert(value1 == value2, value1);
}

assertNotEqual = function(value1, value2) {
	assert(value1 != value2, value1);
}

assertStrictlyEqual = function(value1, value2) {
	assert(value1 === value2, value1);
}

assertNotStrictlyEqual = function(value1, value2) {
	assert(value1 !== value2, value1);
}

assertTrue = function(value) {
	assert(!!value, value);
}

assertFalse = function(value) {
	assert(!value, value);
}


// Utilities
function loadJSON(url, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function() {
		if (request.status == 200 && request.readyState == 4) {
			callback(JSON.parse(request.responseText));
		}
	}
	request.send();
}

function loadScript(url, targetDocument, callback) {
	var scriptElement = targetDocument.createElement("script");
	scriptElement.src = url;
	scriptElement.onload = function() {
		callback();
	}
	targetDocument.getElementsByTagName("head")[0].appendChild(scriptElement);
}

function loadTestDocument(url, callback) {
	
	// Document not yet loaded
	var testDoc = {
		loaded: false,
		element: null
	};
	
	testDoc.element = document.createElement("iframe");
	testDoc.element.src = url;
	testDoc.element.onload = function() {
		callback(testDoc.element);
	}
	document.body.appendChild(testDoc.element);
}

})();
