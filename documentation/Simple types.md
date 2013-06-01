# Simple types

## Generic

`any`: Any value.

`flat`: Any primitive value.

`string`: Any string.

`number`: Any number, including NaN.

## Precise numbers

`float`: Any number that isn't NaN.

`finite`: Any number that isn't NaN, and isn't infinite.

`int`: Any integer.

`natural`: Any positive integer.

## Specific

`true`: Any truthy value.

`false`: Any falsy value.


`"•••"`: Any string equal to `•••`.

`'•••'`: Any string equal to `•••`.


`+•.•`: Any number equal to `•.•`. The decimal part is optional, and negative numbers are valid as well.


`null`: Only null.

`undefined`: Only undefined.

## Modifiers

By default, simple types accept `null` and `undefined`. 
This does not apply to specific types.

`!`: When appended to a flat type, disallows `undefined`.

`!!`: When appended to a flat type, disallows both `undefined` and `null`.
