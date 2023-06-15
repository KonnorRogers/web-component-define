# Purpose

I've shared this across many projects. I like it *shrug*

## Installation

```bash
npm install web-component-define
```

## Import

### Base class

```js
import { DefineableElement } from "web-component-define"

class MyCard extends DefineableElement {
  static baseName = "my-card"
}

// Register the class
MyCard.define() // <my-card>
// Register with a different name
MyCard.define("my-card-2") // <my-card-2>
// Register with different options
MyCard.define(MyCard.baseName, MyCard, { extends: { "div" }})
// This will do the same as above
MyCard.define(null, null, { extends: { "div" }})
```

### Usage as a mixin

```js
import { LitElement } from "lit"
import { DefineableMixin } from "web-component-define"

export class BaseElement extends DefineableMixin(LitElement) {}

class MyCard extends BaseElement {
  static baseName = "my-card"
}

MyCard.define()
```

## Warn if element exists already

```js
import { DefineableElement } from "web-component-define"

class MyCard extends DefineableElement {
  static baseName = "my-card"
  static warnOnExistingElement = true
}
```

## Scoped Elements Mixin

### With regular element

```js
import { CreateRenderRootMixin, ScopedElementsMixin } from "web-component-define"
export class BaseElement extends DefineableMixin(CreateRenderRootMixin(ScopedElementsMixin(HTMLElement))) {
  static get scopedElements () {
    return {
      "my-header": MyHeader
    }
  }
}

BaseElement.define()
```

For more on defined scope elements, check out this page: <https://open-wc.org/docs/development/scoped-elements/>

### With Lit

```js
import { LitScopedElementsMixin } from "web-component-define/exports/lit.js"
export class BaseElement extends LitScopedElementsMixin(LitElement) {}
```

