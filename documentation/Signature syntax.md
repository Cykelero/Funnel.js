# Signature syntax

## Basic structure

A signature is a list of named types. If the arguments passed to the funneled function match the requested types, the values are mapped to the corresponding names, and injected in the function.

The following signature accepts arguments comprised of two strings. Any additional argument is ignored.

`("surname: string, name: string")`

You can use pipes to specify alternatives. For instance, the following signature accepts either two strings, or a single number.

`("surname: string, name: string | id: number")`

Parentheses allow you to override the priority of the pipe operator. The following example accepts either a string and a number, or two strings.

`("name: string, (birthMonth: string | birthYear: number)")`

Types also support alternation and parentheses. The following signature accepts either a string, or a number.

`("month: (string|number)")`

Names must be composed only of unaccentuated letters, numbers, `_`, and `$`. The first character of the name can not be a number.

You can use any character in a name if you enclose it in backticks. For instance, the following signature is valid.

``("`Content-Type`: string")``

## Types

### Simple types

Simple types are flat types such as `string`, `null` or `integer`.

By default, simple types accept `null` and `undefined`. 
This does not apply to specific types.

#### Generic

`any`: Any value.

`flat`: Any primitive value.

`string`: Any string.

`number`: Any number, including NaN.

`boolean`: Any boolean

`function`: Any function.

`node`: Any node, including any HTML element.

##### Precise numbers

`float`: Any number that isn't NaN.

`finite`: Any number that isn't NaN, and isn't infinite.

`integer`: Any integer.

`natural`: Any positive integer.

#### Specific

`true`: Any truthy value.

`false`: Any falsy value.


`"•••"`: Any string equal to `•••`.

`'•••'`: Any string equal to `•••`.


`+•.•`: Any number equal to `•.•`. The decimal part is optional, and the plus sign can be substituted for a minus sign.


`null`: Only null.

`undefined`: Only undefined.

#### Modifiers

`!`: When appended to a simple type, disallows `undefined`.

`!!`: When appended to a simple type, disallows both `undefined` and `null`.

### Arrays

#### Free arrays

Use `[]` to accept any array.

`("items: []")`

#### Type-constrained arrays

By enclosing a type list in brackets, you can accept arrays containing specific types of items. The following signature accepts a single array containing only a string.

`("baseList: [string]")`

You can use quantifiers and type lists to specify more flexible rules for arrays. Please refer to the Quantifiers section of this document for more information on quantifiers. 
The following example accepts a single array, which must contain a string, followed by one or more numbers.

`("records: [string, number+]")`

#### Mapped arrays

By enclosing a list of named types in brackets, you can accept arrays based on the types they contain, and at the same type have the array mapped to an object.

The syntax of array-mapping name/type pair lists is the same as for the main signature.

The following example will accept an array containing two numbers as its first keys; subsequent keys are ignored.

`("center: [x: number, y: number]")`

For instance, when a function with the above signature is called with the argument `[0, 3]`, the funneled function receives `{x: 0, y: 3}` as a value for `center`.

By adding a `/` before the end of a mapped array, you can restrict matches to arrays containing no more keys than the name/type pair list defines. For instance, the following example will not accept an array with three numbers:

`("center: [x: number, y: number /]")`

In non-restricted arrays, extraneous keys are simply ignored.

The name/type pair syntax, combined with the full type syntax, allows you to create complex, multi-level array-to-object mappings.

#### Implicit arrays

By using a quantifier in a type directly in a name/type pair list, you can accept lists of arguments of given types, and have those lists wrapped in arrays for you.

For instance, the following signature will accept any number of integers:

`("marks: integer*")`

The funneled function will receive an array containing all the passed integers as a value for `marks`.

Funnel will do its best to capture arguments in ambiguous situations. For instance, the following signature accepts two or more strings. The funneled function will receive a `names` array containing every string but the last one, and receive the last string as the `surname` value.

`("names: string+, surname: string")`

### Objects

#### Free objects

Use `{}` to accept any object. In Funnel, arrays are not considered to be objects.

`("values: {}")`

#### Type-constrained objects

By enclosing a type in curly braces, you can restrict the allowed types in an object. For instance, the following signature will accept an object containing only strings, numbers, both, or nothing at all.

`("data: {string|number}")`

Quantifiers and type enumeration are not allowed in type-constrained objects.

#### Key-constrained objects

By enclosing a list of named types in curly braces, you can accept objects based on the type of specific keys they contain.

The syntax of object-constraining name/type pair lists is the same as for the main signature, with the exception that quantifiers and type enumeration are not allowed as types.

The following example will accept an object with a string `name` key, and a number `age` key. The object can contain additional keys.

`("owner: {name: string, age: number}")`

By adding a `/` before the end of a key-constrained object, you can restrict matches to objects containing no more keys than the name/type pair list defines. For instance, the following example will not accept the `{name: "Mabel", age: 12, sex: "F"}` object:

`("owner: {name: string, age: number /}")`

When used in name/type pair lists for key-constrained objects, simple types do not accept undefined. You cannot use `undefined` as a type in such a list.  
You can however use the `?` quantifier to specify the type of an optional key. For instance, the following signature will accept both `{year: 1986}` and `{}`, but not `{year: true}`.

`("info: {year: number?}")`

## Type enumeration

Type enumeration allows you to define lists of types. Enumeration can be used in type-constrained arrays, mapped arrays, and implicit arrays.  
For instance, the following signature only accepts a single array, containing a string and a boolean.

`("data: [string, boolean]")`

## Quantifiers

Quantifier allow you to accept a specific number of repetitions of any given type. Quantifiers have different effects depending on the context; refer to the other sections of the document for more information.  
This section will use type-constrained arrays as hosts for the quantifier examples.

### Optional

Append `?` to any type to make the presence of a value optional. The following signature will accept an array containing either a string, a number, and another string, or containing two strings.

`("data: [string, number?, string]")`

### Zero to infinity

Append `*` to any type to accept any number of values of this type. The following signature will accept an array containing any number of strings, including none at all.

`("names: [string*]")`

### One to infinity

Append `+` to any type to accept one or more values of this type. The following signature will accept an array containing one or more strings.

`("names: [string+]")`

### Specific number

Append `{count}` to any type, where `count` is an integer, to accept this many values of the type. The following signature will accept an array containing 256 integers.

`("samples: [integer{256}]")`

### Range

Append `{min,max}` to any type, where `min` and `max` are integers, to accept from `min` to `max` values of the type. You can omit any of the two boundaries; the default value for `min` is 0, and the default value for `max` is infinity. The following signature will accept an array containing between 3 and 30 strings.

`("students: [string{3,30}]")`
