# Funnel.js

Write functions that accept flexible arguments using a powerful signature syntax. Clean up the arguments before they get to your function using filters.

Have a look:

	this.setSize = Funnel
		("width: number, height: number?, units: string?")
		.default(function height(width) {
			return width;
		})
		.in("units", ["px", "em"])
		.set(["width", "height"], function(units) {
			return this() + units;
		})
	(function(width, height) {
		this.style.width = width;
		this.style.height = height;
	});

`setSize` will accept one to three arguments, and map them automatically. If `height` isn't passed, it will default to the same value as `width`. If `units` is omitted, or isn't either “px” or “em”, it will be set to “px”. Finally, the unit is appended to the sizes before they are passed to the actual function.

You probably guessed most of this simply by reading the code; that's half of the point of Funnel.js. Not only you can more easily write powerful argument triaging, but the end result will actually be a lot more readable that any custom code written just for a function. With a quick glance at the function signature string, you know exactly what the function expects. Neat!

## Getting started

The code snippet above should give you a pretty good idea of how Funnel.js works. The next thing to read would be the [Overview](documentation/Overview.js), which will give you a quick tour of Funnel's signature syntax and filter functions.

If you want more detailed information, have a look at the comprehensive documentation: [Using Funnel](Using%20Funnel.md), [Signature syntax](Signature%20syntax.md), and [Using filter functions](Using%20filter%20functions.md).

## Download

You can download the [latest release version][release_download] of Funnel.js, or download the [uncompressed version][dev_download] for easier development.

[release_download]: http://cykeprojects.com/libraries/funnel/latest
[dev_download]: http://cykeprojects.com/libraries/funnel/latest.min

## Caveats

- **Doesn't this impact performance?**  
  Yes, it does. Funnel.js does introduce overhead, and you probably shouldn't funnel performance-critical functions. Funnel.js is best suited for exposing APIs when you write your own libraries, and should be avoided for functions you want to execute, like, super fast.
- **Doesn't minification interfere with injection?**  
  Yup. To counter that, you can add hints to your injection-ready functions. Read all about hints here in [Using injection with minifiers](Using%20injection%20with%20minifiers.md).
