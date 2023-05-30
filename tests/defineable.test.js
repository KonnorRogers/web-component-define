import { DefineableMixin, DefineableElement } from "../src/define.js"
import { assert } from "@open-wc/testing"

import { LitElement } from "lit"

class MyDefineableElement extends DefineableElement {
  static baseName = "defineable-element"
}

class DefineableMixinElement extends DefineableMixin(HTMLElement) {
  static baseName = "defineable-mixin-element"
}

class LitDefineableElement extends DefineableMixin(LitElement) {
  static baseName = "lit-defineable-element"
}

;[MyDefineableElement, DefineableMixinElement, LitDefineableElement].forEach((component) => {
  suite(`${component.name}()`, () => {
    test("should register itself to the custom element registry", () => {
      component.define()
      assert(Boolean(window.customElements.get(component.baseName)))
    })

    test("should work with a custom string", () => {
      component.define("custom-name")
      assert(Boolean(window.customElements.get("custom-name")))
    })
  })
})
