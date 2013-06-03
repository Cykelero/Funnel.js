# Using Funnel

A funneled function has one or more signatures, and each signature has zero or more filter function calls.  
In addition to providing a function to be funneled, you can provide a second function to be called when no signature has successfully matched.

To funnel a function, use the `Funnel` object as a starting point. Add signatures and filter functions, then specify your funneled function, and optionally your fail handler. Funnel will return a proxy function, that you can call normally. When you do so, Funnel will map the arguments according to the first matching signature, transform those mapped arguments according the the signature's filter function calls, and finally call the funneled function, injecting those transformed arguments.

Here is a typical funneled function.

```javascript
this.setSize = Funnel
	("width: number, height: number?, units: string?")
	.default("height", function(width) {
		return width;
	})
	.in("units", ["px", "em"])
	.set(["width", "height"], function(units) {
		return this() + units;
	})
(function(width, height) {
	this.style.width = width;
	this.style.height = height;
})
```

This function has a single signature. The signature accepts a number, followed by an optional number, and an optional string.

The signature has three filter function calls, which respectively:

- Sets the `height` argument to the value of `width`, if `height` is undefined.
- Sets the `units` argument to “px”, if `units` is not either “px” or “em”.
- Appends the value of `units` to both `height` and `width`.

For instance, the following call will cause box to assume a size of 33em by 33em:

	box.setSize(33, "em");

## Signatures

The powerful syntax of signatures is detailed in [Signature syntax](Signature%20syntax.md).

## Filter functions

Usage of filter functions is detailed in [Using filter functions](Using%20filter%20functions.md).

## Argument injection

The transformed arguments are injected in the funneled function. Request an argument by simply adding it to the function's argument list.

Additionally, two special arguments are injected:

- `_all`: This map contains all the transformed arguments. This allows you to make use of arguments of which the name is not a valid JavaScript variable name.
- `_original`: This array contains the arguments passed in the function call, before Funnel mapped and transformed them.

## Fail handler

By default, if Funnel fails to match any signature to the arguments in a call, it returns `null`. You can instead execute custom code by passing a second function, called the fail handler, when defining the funneled function.

The `_original` argument described above is injected into the fail handler.

As an example, the sample code below will output “Invalid id: test” to the console.

```javascript
getUser = Funnel
	("id: number")
(function (id) {
	return […];
},
 function(_original) {
	 console.log("Invalid id: " + _original[0]);
});

getUser("test");
```
