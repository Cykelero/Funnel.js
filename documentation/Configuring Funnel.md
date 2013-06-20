# Configuring Funnel

To configure Funnel, you can make use of options. Instead of affecting Funnel globally, you call the `withOptions` static method, providing it with a map of options, and get a configured alias of Funnel in return.

For instance, the following code makes `funnel` an alias of Funnel, for which argument injection is not enabled:

```javascript
funnel = Funnel.withOptions({
	useInjection: false
});
```

Subsequently, any function that is funneled using `funnel` as a starting point, instead of `Funnel`, will execute with the `useInjection` option set to `false`.  
You can continue using `Funnel` as a starting point to write functions with the standard settings, as long as you do not override it.  
It is good practice not to override the original `Funnel`, as this allows for various applications to cohabit without interfering with each other's Funnel configuration.

Please note that all other documentation for Funnel describes the behavior of Funnel in its default configuration. Only this document, *Configuring Funnel*, acknowledges the effects that options have.

## Options

### useInjection

Defaults to `true`.

When set to false, Funnel will no longer perform argument injection. Instead, functions are called with all of their underscored arguments, in the order they are listed in the documentation.

For instance, filter functions are called with three arguments: `_all`, `_name` and `_extra`.

### defaultToStrictTypes

Defaults to `false`.

When set to true, reverses the way `null` and `undefined` are handled by simple types. By default, those two values are no longer accepted. The `!` and `!!` modifiers now have the following effects:

`!`: When appended to a simple type, allows `null`.

`!!`: When appended to a simple type, allows both `null` and `undefined`.
