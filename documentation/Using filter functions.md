# Filter function usage

## Basic usage

Filter functions allow you to alter the values that have been mapped by a signature.

Filter functions are signature-specific. To add a filter function call to a signature, call the filter function directly after the signature. You can chain multiple filter function calls.

The following signature and filter accept a optional string, that is set to “none” if omitted.

	("display: string?")
	.default("display", "none")

## Call styles

Every filter function requires a key list and a value provider; additional arguments may be accepted depending on the function.

The *key list* is the list of the argument names to be affected by the filter function.

The *value provider* is either a simple value, or a function, that is going to be used as the primary argument for the filter function call.

There are different ways of providing those values when doing a filter function call.

### Separated call

For a separated call, you pass two primary arguments, then the extra arguments. The primary arguments are:

- The key list. This can be either an array of strings, or a single string.
- The value provider. This can be either a function, of which the return value will be used, or a value of any other type that will be used as-is.

### Unified call

For a unified call, you pass a single primary argument, then the extra arguments.  
The primary argument is a function, of which the name is used as the affected key, and which is executed to yield the primary argument value.

For instance, the following filter function sets the “seed” argument to a random number between 0 and 1.

	.set(function seed() {
		return Math.random();
	})

## Injected arguments

A set of values are automatically injected into value provider functions.

All the arguments defined so far get injected in the filter function. In addition, two special arguments get injected as well:

- `_all`: This is a map of all the arguments. Use this instead of directly injecting the argument, if its name is not a valid JavaScript variable name.
- `_name`: This is the name of the argument currently being modified by the filter function.

Some filter functions may inject additional arguments. Such arguments are always prefixed with an underscore.

## `this` object

Value provider functions can call `this` as a function to get the current value of the argument being modified.

For instance, the following filter function appends “px” to the current value of the `width` argument.

	.set(function width() {
		return this() + "px";
	})

## Filter function types

### set

The `set` filter function sets the value of the affected arguments to what returns the value provider.

### default

For each affected argument, the `default` filter function sets the value of the argument to what is returned by the value provider, if the argument was originally `undefined`.

### in

The `in` filter function must receive an array from its value provider. It accepts an optional extra argument, which must be a valid index in the provided array; its default value is 0.

For each affected argument, `in` will change the value of the argument to the default value, if the argument currently has a value not included in the provided array.

The default value is the item in the provided array, at the index designated by the extra argument.

For instance, the following filter will set `gender` to “F” for any value other than “M” or “F”.

	.in("gender", ["M", "F"], 1)
