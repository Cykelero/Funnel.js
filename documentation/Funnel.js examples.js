// Without Funnel.js
this.setCss = function(nameOrPairs, value) {
	// Initializing arguments
	var pairs;
	if (typeof(nameOrPairs) == string) {
		pairs = {};
		pairs[nameOrPairs] = value;
	} else {
		pairs = nameOrPairs;
	}
	
	// Applying css
	var element = this.element; // this class has an element field
	for (var p in pairs) {
		if (pairs.hasOwnProperty(p)) {
			element.style[p] = pairs[p];
		}
	}
};


// With Funnel.js
this.setCss = Funnel
	("pairs: object")
	("name: string, value: any")
		.set(function pairs(name, value) {
			var pairs = {};
			pairs[name] = value;
			return pairs;
		})
(function(pairs) {
	var element = this.element; // this class has an element field
	for (var p in pairs) {
		if (pairs.hasOwnProperty(p)) {
			element.style[p] = pairs[p];
		}
	}
});



// Without Funnel.js
this.drawImage = function(src, canvas, blendMode) {
	// Initializing parameters
	if (typeof(canvas) == "string") {
		blendMode = canvas;
		canvas = null;
	}
	
	if (!canvas) {
		canvas = document.getElementsByTagName("canvas")[0];
	}
	
	var allowedBlendModes = ["source-over", "lighter", "darker", "ponies"];
	if (allowedBlendModes.indexOf(blendMode) == -1) blendMode = allowedBlendModes[0];
	
	// Drawing
	var image = new Image();
	image.onload = function() {
		var context = canvas.getContext("2d");
		var oldMode = context.globalCompositeOperation;
		context.globalCompositeOperation = blendMode;
		context.drawImage(image, 0, 0);
		context.globalCompositeOperation = oldMode;
	}
	image.src = src;
};


// With Funnel.js
this.drawImage = Funnel
	("src: string, canvas?: htmlElement, blendMode?: string")
		.default(function canvas() {
			return document.getElementsByTagName("canvas")[0];
		})
		.in("blendMode", ["source-over", "lighter", "darker", "ponies"])
(function(src, canvas, blendMode) {
	var image = new Image();
	image.onload = function() {
		var context = canvas.getContext("2d");
		var oldMode = context.globalCompositeOperation;
		context.globalCompositeOperation = blendMode;
		context.drawImage(image, 0, 0);
		context.globalCompositeOperation = oldMode;
	}
	image.src = src;
});


// Without Funnel.js
this.drawGradient = function(type) {
	
	


// With Funnel.js
this.drawGradient = Funnel
	("(type: 'radial', center: [x: number, y: number], radius: number | type: 'linear', direction: number), colorStops+: (string | [color: string, position: number])")
		.set(function colorStops() {
			for (var i = 0 ; i < this.length ; i++) {
				if (typeof(this[i]) == "string") this[i] = {color: this[i], position: null};
			}
			return this;
		})
(function(type, center, radius, direction, colorStops) {
	
});
