# Using injection with minifiers

As argument injection uses function argument names to determine what values to inject, minifying your code will likely prevent injection from functionning properly. To counter that, you can add an injection hint at the beginning of your functions. This applies to both funneled functions, and filter function value providers.

Injection hints are simply the same list of arguments as in your function definition, surrounded by slashes, and followed by a semicolon. No code, even comments, can appear before the hint.

For instance, the following function is minifier-proof:

	setSize = Funnel
		("width: number, height: number")
	(function(width, height) {
		/width, height/;
		console.log(width + ", " + height);
	})

If possible, it is recommended to insert the hints before minification automatically, as part of your building process.
