// @ts-check

/**
 * Extends any extension of HTMLElement to call `.define()` as well as register children.
 * @template {import("../../types.js").Constructor} T
 * @param {T} superclass
 * @example
 *   // usage with LitElement
 *   import { LitElement } from "lit"
 *   import { DefineableMixin } from "web-component-definition"
 *   export class BaseLitElement extends DefineableMixin(LitElement) {}
 * @example
 *   // usage with HTMLElement
 *   import { LitElement } from "lit"
 *   import { DefineableMixin } from "web-component-definition"
 *   export class BaseLitElement extends DefineableMixin(LitElement) {}
 * @example
 *   // usage with prebuilt HTMLElement mixin
 *   import { LitElement } from "lit"
 *   import { DefineableElement } from "web-component-definition"
 *   export class BaseElement extends DefineableElement {}
 */
export function DefineableMixin(superclass) {
  return class DefineableClass extends superclass {
    /**
     * The tag name to register your custom element under.
     * @type {string}
     */
    static baseName = '';

    /**
     * Emits a console warning if the name for an element is already taken.
     * @type {boolean}
     */
    static warnOnExistingElement = false

    /**
    * @param {null | undefined | string} [name=this.baseName]
    * @param {null | undefined | CustomElementConstructor} [ctor=this]
    * @param {ElementDefinitionOptions | undefined} [options]
    */
    static define(name, ctor, options) {
      if (!name) name = this.baseName;

      if (!ctor) ctor = this;

      let registry = window.customElements

      /** @ts-expect-error */
      if (this.__registry instanceof CustomElementRegistry) {
        /** @ts-expect-error */
        registry = this.__registry
      }

      const alreadyExists = Boolean(registry.get(name))

      if (alreadyExists && this.warnOnExistingElement) {
        console.warn(`${name} has already been registered.`)
      }

      if (!alreadyExists && ctor) {
        registry.define(name, class extends ctor {}, options);
      }
    }
  };
}

/**
 * Prebuilt class for extending HTMLElement
 * @example
 *   // Base use-case
 *   class MyCard extends DefineableElement {
 *     static baseName = "my-card"
 *   }
 *   // Register the class
 *   MyCard.define()
 *   // Register with a different name
 *   MyCard.define("my-card-2")
 *   // Register with different options
 *   MyCard.define(MyCard.baseName, MyCard, { extends: { "div" }})
 *   // This will do the same as above
 *   MyCard.define(null, null, { extends: { "div" }})
 *
 * @example

 *   // Using a different customElementRegistry
 *   class MyCard extends DefineableElement {
 *     static customElementRegistry = MyCustomRegistry()
 *     static baseName = "my-card"
 *   }
 *   // Register the element in the custom registry.
 *   MyCard.define()
 */
export class DefineableElement extends DefineableMixin(HTMLElement) {}

