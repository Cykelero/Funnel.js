/* Overview of Funnel.js usage */

this.addDescription = Funnel
	("pictureName: string, location: string?, year: number?")
(function(pictureName, location, year) {
	var description = pictureName;
	
	if (location) {
		description += ", at " + location;
	}
	if (year) {
		description += " (" + year + ")";
	}
	
	return description;
});

this.addDescription("Mountain stream", "Mount Everest"); // returns “Mountain stream, at Mount Everest”

this.addDescription("First glider", 1900); // returns “First glider (1900)”

this.addDescription("Family reunion", "Stanley Park", 2011); // returns “Family reunion, at Stanley Park (2011)”

// Start by using the Funnel function to describe one or more signatures. After you provide the function to be funneled, a modified version of it is returned, ready to be used according to the signature.
// When this augmented function is called, Funnel matches the passed arguments with the ones requested by your signature; the resulting values are then injected in your function.


/* Sample argument pattern definitions */

// You can use one or multiple signatures to define what arguments your function accepts.

("name: string, age: number")
// accepts a string, and a number

("surname: string?, name: string, age: number")
// accepts either a string and a number, or two strings and a number

("sex: (string|boolean), age: number")
// accepts either a string and a number, or a boolean and a number

("memberList: []")
// accepts any array

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

("firstColorStop: [color: string, position: (number | string) /]")
// same as above, and the array can not contain any additional item

("nameList: string+")
// accepts one or more strings as arguments
// the function receives an array containing those strings, named "nameList"

("students: string+, lecturer: string")
// accepts n strings, where n >= 2
// the first (n-1) strings are passed as a "students" array to the function
// the last string is passed as a "lecturer" string

("students: string{5,30}")
// accepts 5 to 30 strings as arguments
// the function receives an array containing those strings, named "students"

("properties: {}")
// accepts any non-primitive type that is not an array

("agesByName: {string}")
// accepts an object containing zero or more strings, but nothing else

("characteristics: {string | number | boolean}")
// accepts an object containing any number of strings, numbers, and booleans, but nothing else

("colorStops: {color: string, position: number}")
// accepts an object with a “color” key containing a string, and a “position” key containing a number; additional keys are allowed

("colorStops: {color: string, position: number /}")
// accepts an object with a “color” key containing a string, and a “position” key containing a number; additional keys are not allowed

("hours: number, minutes: number | time: string")
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

// After arguments have been mapped using a function signature, they can been modified using filter functions.

("id: string")
	.set(function element(id) {
		return document.getElementById(id);
	})
// an "element" argument is passed to the funneled function, in addition to the “id” argument
// in a .set call, the function name is used for the output argument name
// the current values of the arguments are injected into the function

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
// to use an argument that can't be injected because of its name, you can request the _args map instead

("`Content-Type`: string")
	.default("Content-Type", "text/html")
// you can also directly specify a default value, instead of using a function

("mother: string, father: string")
	.default(["mother", "father"], "Pat")
// you can pass an array instead of a name, to act on multiple arguments at once

("gender: string")
	.in("gender", ["M", "F"])
// if gender isn't equal to either "M" or "F", "M" is used instead

("component: string")
	.in("component", ["Red", "Green", "Blue"], 2)
// the default value for component is "Blue"

("availableSizes: array, defaultSize: number")
	.in(function defaultSize(availableSizes) {
		return availableSizes;
	})
// you can also compute the value array in a fonction, instead of passing it directly
// the function also receives injected arguments, and its name determines which output argument is affected

