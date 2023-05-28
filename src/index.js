// @ts-check

/**
 * @typedef {object} ChildComponent
 * @property {string} baseName
 * @property {CustomElementConstructor} class
 * @property {undefined | ElementDefinitionOptions} options
 */

/**
 * Used for registering child components.
 * @typedef {Record<string, ChildComponent>} ChildComponents
 */

/**
 * Used for anything with `class`.
 * @typedef {new (...args: any[]) => {}} Constructable
 */

/**
 * Returns a constructable with a Generic for type narrowing.
 * @template [T={}]
 * @typedef {new (...args: any[]) => T} GenericConstructable
 */

/**
 * Extends any extension of HTMLElement to call `.define()` as well as register children.
 * @template {GenericConstructable<HTMLElement>} [TBase=GenericConstructable<HTMLElement>]
 * @param {TBase} superclass
 * @example
 *   // usage with LitElement
 *   import { LitElement } from "lit"
 *   import { Defineable } from "<tbd>"
 *   export class BaseLitElement extends Defineable(LitElement) {}
 * @example
 *   // usage with HTMLElement
 *   import { LitElement } from "lit"
 *   import { Defineable } from "<tbd>"
 *   export class BaseLitElement extends Defineable(LitElement) {}
 * @example
 *   // usage with prebuilt HTMLElement mixin
 *   import { LitElement } from "lit"
 *   import { DefineableElement } from "<tbd>"
 *   export class BaseElement extends DefineableElement {}
 */
function Defineable(superclass) {
  return class Defineable extends superclass {
    /** @type {CustomElementRegistry} */
    static customElementRegistry = window.customElements;

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
    static define(name = this.baseName, ctor = this, options) {
      if (!name) name = this.baseName;
      if (!ctor) ctor = this;

      const alreadyExists = Boolean(this.customElementRegistry.get(name))

      if (alreadyExists && this.warnOnExistingElement) {
        console.warn(`${name} has already been registered.`)
      }

      if (!alreadyExists) {
        this.customElementRegistry.define(name, class extends ctor {}, options);
      }

      this.registerChildComponents()
    }

    /**
     * Used for registering child components. This is useful is you plan to extend existing components.
     * @type {ChildComponents}
     */
    static childComponents = {}

    /**
     * Registers the child components. Useful for scoping elements.
     */
    static registerChildComponents () {
      Object.values(this.childComponents).forEach((component) => {

        const alreadyExists = Boolean(this.customElementRegistry.get(component.baseName))

        if (alreadyExists && this.warnOnExistingElement) {
          console.warn(`${component.baseName} has already been registered.`)
        }

        if (!alreadyExists) {
          this.customElementRegistry.define(component.baseName, class extends component.class {}, component.options)
        }
      })
    }
  };
}

/**
 * Prebuilt class for extending HTMLElement
 * @type Defineable, HTMLElement
 * @example
 *   // Base use-case
 *   class MyCard extends DefineableElement {
 *     static baseName = "my-card"
 *     static childComponents = {
 *        header: { baseName: "my-header", class: MyHeader, options: {}}
 *     }
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
 *     static childComponents = {
 *        header: { baseName: "my-header", class: MyHeader, options: {}}
 *     }
 *   }
 *   // Register the element in the custom registry.
 *   MyCard.define()
 */
export class DefineableElement extends Defineable(HTMLElement) {}
