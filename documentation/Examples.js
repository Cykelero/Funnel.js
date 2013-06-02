
/* A function to change the style of the document body; accepts either a property name and a value, or a map of properties. */
/* Without Funnel.js */
setStyle = function(nameOrPairs, value) {
	// Initialize arguments
	var pairs;
	if (typeof(nameOrPairs) == "string") {
		pairs = {};
		pairs[nameOrPairs] = value;
	} else {
		pairs = nameOrPairs;
	}
	
	// Apply style
	for (var prop in pairs) {
		if (pairs.hasOwnProperty(prop)) {
			document.body.style[prop] = pairs[prop];
		}
	}
};


/* With Funnel.js */
setStyle = Funnel
	("pairs: {}")
	("name: string, value: any")
		.set(function pairs(name, value) {
			var pairs = {};
			pairs[name] = value;
			return pairs;
		})
(function(pairs) {
	for (var prop in pairs) {
		if (pairs.hasOwnProperty(prop)) {
			document.body.style[prop] = pairs[prop];
		}
	}
});



/* A function to draw an image on a given canvas. Both the blendmode and the canvas are optional. */
/* Without Funnel.js */
drawImage = function(image, canvas, blendMode) {
	// Initialize parameters
	if (typeof(canvas) == "string") {
		blendMode = canvas;
		canvas = null;
	}
	
	if (!canvas) {
		canvas = document.getElementsByTagName("canvas")[0];
	}
	
	var allowedBlendModes = ["source-over", "lighter", "darker"];
	if (allowedBlendModes.indexOf(blendMode) == -1) blendMode = allowedBlendModes[0];
	
	// Drawing
	var context = canvas.getContext("2d");
	context.globalCompositeOperation = blendMode;
	context.drawImage(image, 0, 0);
};


/* With Funnel.js */
drawImage = Funnel
	("src: string, canvas: node?, blendMode: string?")
		.default(function canvas() {
			return document.getElementsByTagName("canvas")[0];
		})
		.in("blendMode", ["source-over", "lighter", "darker"])
(function(image, canvas, blendMode) {
	var context = canvas.getContext("2d");
	context.globalCompositeOperation = blendMode;
	context.drawImage(image, 0, 0);
});


/* A function to draw gradients. Draws either radial gradients (with a center and a radius) or linear gradients (with an angle). */
/* Without Funnel.js */
drawGradient = function(type) {
	// Well, I'll leave this to your imagination.
}

/* With Funnel.js */
drawGradient = Funnel
	("(type: 'radial', center: [x: number, y: number], radius: number | type: 'linear', direction: number), colorStops: [(string | [color: string, position: number])+]")
		.set(function colorStops() {
			var stops = this();
			for (var i = 0 ; i < stops.length ; i++) {
				if (typeof(stops[i]) == "string") stops[i] = {color: stops[i], position: null};
			}
			return stops;
		})
(function(type, center, radius, direction, colorStops) {
	// Same here. Imagine some cute gradient drawing code.
	// We can use the center value directly as an object:
	console.log(center.x, center.y);
});

// Sample calls of drawGradient
drawGradient("radial", [13, 20], 10, ["red", "blue"]);
drawGradient("linear", 180, ["red", ["green", .25], "blue"]);
