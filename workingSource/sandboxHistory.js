var generated = FunnelInstanceSignaturePattern("firstname: string, surname: string, age: number");

console.log(generated(["Nathan", "Manceaux-Panot", 20]));



echoName = Funnel
	("firstname: string, surname: string")
(function(firstname, surname) {
	console.log(firstname + ", " + surname);
});

echoName("John", "Doe");



testFunc = Funnel
	("success: boolean, test: flat!")
	("failure: any, test: any")
(function(test, success) {
	if (success) {
		console.log("#" + test);
	} else {
		console.log("%" + test);
	}
});

testFunc(true, {});
testFunc(true, []);
testFunc(true, new Date());
testFunc(true, "yay");
testFunc(true, 32);
testFunc(true, -32);
testFunc(true, -3.32);
testFunc(true, Number.POSITIVE_INFINITY);
testFunc(true, NaN);
testFunc(true, undefined);
testFunc(true, null);
testFunc(true, "hello");
testFunc(true, true);
testFunc(true, false);
testFunc(true, function() {});
testFunc(true, window);



setWidth = Funnel
	("width: number, height: number")
	.set(["width", "height"], function() {
		return this() + "px";
	})
(function(width, height) {
	console.log(width);
	console.log(height);
})

setWidth(48, 50);

