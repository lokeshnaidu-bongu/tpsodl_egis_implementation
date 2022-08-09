Toggle switch provides an alternative UI to a single checkbox or binary choice radio buttons. The toggleSwitch() plugin
turns `<input type="checkbox"/>` elements into toggle switch controls. The original checkbox element is preserved and
its value (controlled by the toggle switch) is posted with form submits. Adding the data-toggle-switch="true" attribute
to any checkbox element will turn it into a toggle switch automatically, or other checkbox elements can be made into
toggle switches by calling the toggleSwitch() plugin on them via JavaScript.

The implementation uses [bootstrap-switch](https://github.com/nostalgiaz/bootstrap-switch) as a dependency.

## Basic Usage

When the toggle-switch.js and dependencies are on the page, any `<input type="checkbox" data-toggle-switch="true"/>`
elements are turned into toggle-switch elements automatically

```html
    <label class="checkbox">
      <input type="checkbox" data-toggle-switch="true" name="nm" value="vl"/>
      Activated automatically
    </label>
```

Alternatively, instance a toggle-switch via JavaScript with custom options:

```html
    <label class="checkbox">
      <input type="checkbox" class="activate-me" name="nm" value="vl"/>
      Activated via JavaScript
    </label>
```

```javascript
$('.activate-me').toggleSwitch(/*options*/{});
```

When a toggle switch is created, the checked state of the checkbox will be connected to the state of the toggle switch.
As with any other checkbox in an HTML form, the "value" attribute will be submitted with the HTML form only if its
"checked" state is true.

## Options

All options documented in the bootstrap-switch API are supported, including the size variations via CSS class names on the container:

```html
    <label class="checkbox">
        <input type="checkbox" data-toggle-switch="true" class="switch-large" name="nm" value="vl"/>
        Large
    </label>
    <label class="checkbox">
        <input type="checkbox" data-toggle-switch="true" class="switch-small" name="nm" value="vl"/>
        Small
    </label>
    <label class="checkbox">
        <input type="checkbox" data-toggle-switch="true" class="switch-mini" name="nm" value="vl"/>
        Mini
    </label>
```

The toggle-switch also exposes the `toggleState()` and `setState()` functions from the underlying bootstrap-switch
plugin. See those docs for usage.

## Examples

[examples](examples.html)


## Extending behavior

Since the toggle switch plugin is created using
[oo-utils.makePlugin()](https://github.sw.ge.com/DT/oo-utils/blob/master/Readme.md), The toggleSwitch plugin prototype
itself is registered and accessible via `ooUtils.getPlugin()`.