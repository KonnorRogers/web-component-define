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
  static childComponents = {
     header: { baseName: "my-header", class: MyHeader, options: {}}
  }
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
import { Defineable } from "web-component-define"
export class BaseElement extends Defineable(LitElement) {}

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
  static childComponents = {
     header: { baseName: "my-header", class: MyHeader, options: {}}
  }
  static warnOnExistingElement = true
}
```
