# Scroll Snooper v1.0.0

<div>
<span>
   <img src="https://img.shields.io/badge/Version-v1.0.0-0088ff">
   </span>
 <a href="https://phucbm.github.io/scroll-snooper/">
   <img src="https://img.shields.io/badge/-Demo-0273A9">
   </a>
<a href="https://www.jsdelivr.com/package/gh/phucbm/scroll-snooper">
   <img src="https://data.jsdelivr.com/v1/package/gh/phucbm/scroll-snooper/badge">
   </a>
 </div>


> 🛼 Pure JavaScript API that goes snooping around elements while scrolling

## Getting started

👉 CDN Hosted - [jsDelivr](https://www.jsdelivr.com/package/gh/phucbm/scroll-snooper)

```html

<script src="https://cdn.jsdelivr.net/gh/phucbm/scroll-snooper@1.0.0/scroll-snooper.js"></script>
```

or 3KB minified version

```html

<script src="https://cdn.jsdelivr.net/gh/phucbm/scroll-snooper@1.0.0/scroll-snooper.min.js"></script>
```

👉 Self hosted - [Download latest release](https://github.com/phucbm/scroll-snooper/releases/latest)

## Quick use

### Create watcher to listen to events

```js
ScrollSnooper.create({
    trigger: $('#block'),
    onEnter: data => {
        console.log(data);
    },
    onLeave: data => {
        console.log(data);
    },
    onScroll: data => {
        console.log(data);
    },
});
```

### Is in viewport

```js
console.log(ScrollSnooper.isInViewport($('#block')));
```

or only return true if at least 20% of element is appearing in viewport

```js
console.log(ScrollSnooper.isInViewport($('#block'), 0.2));
```

### Visibility

Get the number of pixels and proportion (%) of the element displaying on the viewport.

```js
console.log(ScrollSnooper.visibility($('#block')));
```

### The most visible element

Select multiple elements and pick out the most visible one based on its pixel displaying on the viewport.

```js
console.log(ScrollSnooper.getTheMostVisible($('.blocks')));
```

or use with create()

```js
ScrollSnooper.create({
    trigger: $('.blocks'),
    isGetTheMostVisible: true,
    onChange: data => {
        console.log(data);
    },
    onFound: data => {
        console.log(data);
    },
});
```

## Documentation

### ScrollSnooper.create({}) : void

| Name | Type | Default | Note |
| --- | --- | --- | --- |
| trigger | jQuery, HTMLElement  | `undefined`  | Element(s).   |
| start | string  | `top bottom`  | Starting position, `top bottom` means _"when the top of the trigger hits the bottom
of the viewport"_, `"center center"` means _"when the center of the trigger hits the center of the
viewport"_. For now, we have 3 positions: top, center and bottom.  |
| end | string  | `bottom top`  | Ending position.  |
| onEnter | function  | data => {}  | A callback for when the trigger is scrolled into view.  |
| onLeave | function  | data => {}  | A callback for when the trigger is scrolled out of view.  |
| onScroll | function  | data => {}  | A callback that gets called everytime the scroll position changed (scrolling, resizing).  |

When `isGetTheMostVisible` is `true`

| Name | Type | Default | Note |
| --- | --- | --- | --- |
| isGetTheMostVisible | boolean  | false  | Activate the watcher for multiple triggers. |
| onChange | function  | data => {}  | A callback that gets called everytime the most visible element changed (including `undefined`).  |
| onFound | function  | data => {}  | A callback that gets called everytime one of the triggers is scrolled into view.  |

### ScrollSnooper.isInViewport( element: jQuery | HTML element, proportion: number) : Boolean

Returns `true` if the element is in the viewport. You can optionally specify a minimum proportion, like
ScrollSnooper.isInViewport(element, 0.2) would only return true if at least 20% of the element is in the viewport.

```js
console.log(ScrollSnooper.isInViewport($('#block'), 0.2));
```

### ScrollSnooper.visibility( element: jQuery | HTML element ) : {pixel, proportion}

Get the number of pixels and proportion (%) of the element displaying on the viewport.

```js
console.log(ScrollSnooper.visibility($('#block')));
```

### ScrollSnooper.getTheMostVisible( element: jQuery | HTML element, atLeastPixel: number ) : Object

Select multiple elements and pick out the most visible one based on its pixel displaying on the viewport.

```js
console.log(ScrollSnooper.getTheMostVisible($('.blocks')));
```

## License

[MIT License](https://github.com/phucbm/scroll-snooper/blob/main/LICENSE)

Copyright (c) 2021 Minh-Phuc Bui