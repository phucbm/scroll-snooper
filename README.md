# Scroll Snooper [![Netlify Status](https://api.netlify.com/api/v1/badges/02c06c92-b238-4648-956e-339ccaa6a779/deploy-status)](https://app.netlify.com/sites/scroll-snooper/deploys)

[![release](https://badgen.net/github/release/phucbm/scroll-snooper/?cache=600)](https://github.com/phucbm/scroll-snooper/releases/latest)
[![minified](https://badgen.net/badge/minified/4KB/cyan)](https://www.jsdelivr.com/package/gh/phucbm/scroll-snooper)
[![license](https://badgen.net/github/license/phucbm/scroll-snooper/)](https://github.com/phucbm/scroll-snooper/blob/main/LICENSE)
[![jsdelivr](https://data.jsdelivr.com/v1/package/gh/phucbm/scroll-snooper/badge?style=rounded)](https://www.jsdelivr.com/package/gh/phucbm/scroll-snooper)
[![CodePen](https://badgen.net/badge/Demo/CodePen/black)](https://codepen.io/phucbui/pen/GRvxYeg)

> 🛼 Pure JavaScript API that goes snooping around elements while scrolling

## Getting started

### NPM package

```shell
npm i scroll-snooper
```

or as a dev dependency

```shell
npm i scroll-snooper --save-dev
```

Import

```js
import "scroll-snooper";

// your script
```

### CDN

👉 CDN Hosted - [jsDelivr](https://www.jsdelivr.com/package/gh/phucbm/scroll-snooper)

👉 Self hosted - [Download the latest release](https://github.com/phucbm/scroll-snooper/releases/latest)

## Quick use

### Create watcher to listen to events

```js
ScrollSnooper.create({
    trigger: document.querySelector('.block'),
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
console.log(ScrollSnooper.isInViewport(document.querySelector('.block')));
```

or only return true if at least 20% of element is appearing in viewport

```js
console.log(ScrollSnooper.isInViewport(document.querySelector('.block'), 0.2));
```

### Visibility

Get the number of pixels and proportion (%) of the element displaying on the viewport.

```js
console.log(ScrollSnooper.visibility(document.querySelector('.block')));
```

### The most visible element

Select multiple elements and pick out the most visible one based on its pixel displaying on the viewport.

```js
console.log(ScrollSnooper.getTheMostVisible(document.querySelectorAll('.blocks')));
```

or use with create()

```js
ScrollSnooper.create({
    trigger: document.querySelectorAll('.blocks'),
    isGetTheMostVisible: true,
    onChange: data => {
        console.log('onChange', data);
    },
    onFound: data => {
        console.log('onFound', data);
    },
});
```

## Documentation

### ScrollSnooper.create({}) : void

| Name    | Type                | Default      | Note                                                                                |
|---------|---------------------|--------------|-------------------------------------------------------------------------------------|
| trigger | jQuery, HTMLElement | `undefined`  | Element(s).                                                                         |
| start   | string              | `top bottom` | Starting position, `top bottom` means _"when the top of the trigger hits the bottom of the viewport"_, `"center center"` means _"when the center of the trigger hits the center of the viewport"_. `"top 90%"` or `"bottom 100px"` are also accepted. |
| end | string | `bottom top`  | Ending position. |
| onEnter | function | data => {} | A callback for when the trigger is scrolled into view. |
| onLeave | function | data => {} | A callback for when the trigger is scrolled out of view. |
| onScroll | function | data => {} | A callback that gets called everytime the scroll position changed (scrolling, resizing). |

When `isGetTheMostVisible` is `true`

| Name                | Type     | Default    | Note                                                                                            |
|---------------------|----------|------------|-------------------------------------------------------------------------------------------------|
| isGetTheMostVisible | boolean  | false      | Activate the watcher for multiple triggers.                                                     |
| onChange            | function | data => {} | A callback that gets called everytime the most visible element changed (including `undefined`). |
| onFound             | function | data => {} | A callback that gets called everytime one of the triggers is scrolled into view.                |

### ScrollSnooper.isInViewport( element: jQuery | HTML element, proportion: number) : Boolean

Returns `true` if the element is in the viewport. You can optionally specify a minimum proportion, like
ScrollSnooper.isInViewport(element, 0.2) would only return true if at least 20% of the element is in the viewport.

```js
console.log(ScrollSnooper.isInViewport(document.querySelector('.block'), 0.2));
```

### ScrollSnooper.visibility( element: jQuery | HTML element ) : {pixel, proportion}

Get the number of pixels and proportion (%) of the element displaying on the viewport.

```js
console.log(ScrollSnooper.visibility(document.querySelector('.block')));
```

### ScrollSnooper.getTheMostVisible( element: jQuery | HTML element, atLeastPixel: number ) : Object

Select multiple elements and pick out the most visible one based on its pixel displaying on the viewport.

```js
console.log(ScrollSnooper.getTheMostVisible(document.querySelectorAll('.blocks')));
```

## Deployment

Start dev server

```shell
npm run dev
```

Build production files (UMD and NPM package)

```shell
npm run prod
```

Build sources from `./web` to `./build`

```shell
npm run build
```

Build files from `./src` to `./dist` then publish to `npm`

```shell
npm run publish
```

## License

[MIT License](https://github.com/phucbm/scroll-snooper/blob/main/LICENSE)

Copyright (c) 2022 Minh-Phuc Bui
