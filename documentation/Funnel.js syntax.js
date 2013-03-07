/* Basic Funnel.js usage */

this.sayHello = Funnel
	("greeting: string, name?: string")
(function(name, greeting) {
	var result = greeting;
	if (name) result += ", " + name;
	result += "!";
	return result;
});
// Define the accepted argument patterns using the Funnel object as a starting point. The accepted (or computed) arguments are injected into the function you provide; you can use all of them or only some of them, and their order does not matter.


/* Sample argument pattern definitions */

("name: string, age: number")
// accepts a string, and a number

("surname?: string, name: string, age: number")
// accepts two strings and a number, or a string and a number

("surname: string?, name: string, age: number")
// does accept undefined, a string and a number
// does not accept a string and a number

("sex: (string|boolean), age: number")
// accepts either a string and a number, or a boolean and a number

("memberList: []")
// accepts an array

("nameList: [string+]")
// accepts an array containing one string or more; other types are not allowed

("nameList: [string*]")
// accepts an array containing one string, or more, or none at all; other types are not allowed

("lecturers: [string{1,4}]")
// accepts an array containing 1 to 4 strings

("lecturers: [string{2,}]")
// accepts an array containing at least 2 strings

("lecturers: [string{,4}]")
// accepts an array containing 0 to 4 strings

("firstColorStop: [string, (number | string)]")
// accepts a single array, containing either a string and a number, or two strings

("firstColorStop: [color: string, position: (number | string)]")
// accepts a single array, containing either a string and a number, or two strings
// the function receives an object, containing the color and position properties

("nameList+: string")
// accepts one or more strings as arguments
// the function receives an array containing those strings, named "nameList"

("students+: string, lecturer: string")
// accepts n strings, where n >= 2
// the first (n-1) strings are passed as a "students" array to the function
// the last string is passed as a "lecturer" string

("students{5,30}: string")
// accepts 5 to 30 strings as arguments
// the function receives an array containing those strings, named "students"

("properties: {}")
// accepts an object containing anything

("agesByName: {string}")
// accepts an object containing zero or more strings, but nothing else

("characteristics: {string | number | boolean}")
// accepts an object containing any number of strings, numbers, and booleans, but nothing else

("hours: number, minutes: number | time: string"
// accepts either two numbers, or a string

("password: 'nope.avi'")
// accepts a string, which must be equal to "nope.avi"

('password: "nope.avi"')
// accepts a string, which must be equal to "nope.avi"

("type: 'fish', bowlRadius: number | type: 'dog', race: string")
// accepts either "fish", and a number, or "dog", and a string

("`Content-Type`: string")
// to use non-valid identifiers as argument names, enclose them in backticks


/* Sample filter function calls */

("id: string")
	.set(function element(id) {
		return document.getElementById(id);
	})
// an "element" argument is passed to the function being called
// in a .set call, the function name is used for the output argument name
// arguments are injected into the function

("element: htmlElement")
	.set(function element() {
		return this.parentNode;
	})
// functions used for .set calls can use "this" to access the current value of the argument to be (re)defined
// this works for native values as well

("element: htmlElement?")
	.default(function element() {
		return document.body;
	})
// if element is undefined, document.body is passed instead

("`Content-Type`: string")
	.default("Content-Type", function() {
		return "text/html";
	})
// to act on arguments with non-valid names, you can pass their name as the first argument, instead of naming the function

("`Content-Type`: string, outputAsText: boolean")
	.default(function outputAsText(_args) {
		return /^text\b/.test(_args["Content-Type"]);
	})
// to use arguments that can't be injected because of their name, you can request the injection of the _args map instead

("`Content-Type`: string")
	.default("Content-Type", "text/html")
// you can also directly define a default value, instead of using a function

("mother: string, father: string")
	.default(["mother", "father"], "Pat")
// you can pass an array instead of a name, to act on multiple arguments at once

("gender: string")
	.in("gender", ["M", "F"])
// if sex if undefined, or not equal to either "M" or "F", "M" is used instead

("component: string")
	.in("component", ["Red", "Green", "Blue"], 2)
// the default value for component is "Blue", its index in the default array being 2

("availableSizes: array, defaultSize: number")
	.in(function defaultSize(availableSizes) {
		return availableSizes;
	})
// you can also compute the value array in a fonction, instead of passing it directly
// the function also receives injected arguments, and its name determines which output argument is affected

