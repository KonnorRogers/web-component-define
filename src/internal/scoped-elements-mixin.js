// @ts-check
import { dedupeMixin } from '@open-wc/dedupe-mixin';

/**
 * @typedef {import('../../types.js').RenderOptions} RenderOptions
 * @typedef {import('../../types.js').ScopedElementsMap} ScopedElementsMap
 */

// @ts-ignore
const supportsScopedRegistry = !!ShadowRoot.prototype.createElement;

/**
 * @template {import('../../types.js').Constructor} T
 * @param {T} superclass
 */
const ScopedElementsMixinImplementation = superclass =>
  class ScopedElementsHost extends superclass {
    /**
     * Obtains the scoped elements definitions map if specified.
     *
     * @returns {ScopedElementsMap}
     */
    static get scopedElements() {
      return {};
    }

    /**
     * Obtains the ShadowRoot options.
     *
     * @type {ShadowRootInit}
     */
    static get shadowRootOptions() {
      return this.__shadowRootOptions || {mode: "open"};
    }

    /**
     * Set the shadowRoot options.
     *
     * @param {ShadowRootInit} value
     */
    static set shadowRootOptions(value) {
      this.__shadowRootOptions = value;
    }

    /**
     * @param {any[]} args
     */
    constructor(...args) {
      super(...args);
      /** @type {RenderOptions} */
      this.renderOptions = this.renderOptions || undefined;
    }

    /**
     * Obtains the CustomElementRegistry associated to the ShadowRoot.
     *
     * @returns {CustomElementRegistry}
     */
    get registry() {
      /** @type { typeof ScopedElementsHost } */
      // @ts-expect-error
      const constructor = this.constructor
      return constructor.__registry;
    }

    /**
     * @protected
     * @type {CustomElementRegistry}
     */
    static __registry = window.customElements

    /**
     * Set the CustomElementRegistry associated to the ShadowRoot
     *
     * @param {CustomElementRegistry} registry
     */
    set registry(registry) {
      /** @type { typeof ScopedElementsHost } */
      // @ts-expect-error
      const constructor = this.constructor
      constructor.__registry = registry;
    }

    createRenderRoot() {
      /** @type { typeof ScopedElementsHost } */
      // @ts-expect-error
      const constructor = this.constructor;
      const { scopedElements, shadowRootOptions } = constructor

      const shouldCreateRegistry =
        !this.registry ||
        (this.registry === constructor.__registry &&
          !Object.prototype.hasOwnProperty.call(this.constructor, '__registry'));

      /**
       * Create a new registry if:
       * - the registry is not defined
       * - this class doesn't have its own registry *AND* has no shared registry
       */
      if (shouldCreateRegistry) {
        this.registry = supportsScopedRegistry ? new CustomElementRegistry() : customElements;
        for (const [tagName, klass] of Object.entries(scopedElements)) {
          this.defineScopedElement(tagName, klass);
        }
      }

      /** @type {ShadowRootInit} */
      const options = {
        // @ts-expect-error multiple assignment. Sue me.
        mode: 'open',
        ...shadowRootOptions,
        customElements: this.registry,
      };

      const createdRoot = this.attachShadow(options);
      if (supportsScopedRegistry) {
        this.renderOptions.creationScope = createdRoot;
      }

      if (createdRoot instanceof ShadowRoot) {
        this.adoptStyles(createdRoot)
      }

      return createdRoot;
    }

    /**
     * @param {string} tagName
     */
    createScopedElement(tagName) {
      const root = supportsScopedRegistry ? this.shadowRoot : document;
      // @ts-ignore polyfill to support createElement on shadowRoot is loaded
      return root.createElement(tagName);
    }

    /**
     * Hook for attaching constructable stylesheets to a render root.
     * Used in the {LitScopedElementsMixin} .
     * @param {ShadowRoot} _shadowRoot
     * @returns {void}
     */
    adoptStyles (_shadowRoot) {}

    /**
     * Defines a scoped element.
     *
     * @param {string} tagName
     * @param {typeof HTMLElement} klass
     */
    defineScopedElement(tagName, klass) {
      const registeredClass = this.registry.get(tagName);
      if (registeredClass && supportsScopedRegistry === false && registeredClass !== klass) {
        // eslint-disable-next-line no-console
        console.error(
          [
            `You are trying to re-register the "${tagName}" custom element with a different class via ScopedElementsMixin.`,
            'This is only possible with a CustomElementRegistry.',
            'Your browser does not support this feature so you will need to load a polyfill for it.',
            'Load "@webcomponents/scoped-custom-element-registry" before you register ANY web component to the global customElements registry.',
            'e.g. add "<script src="/node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js"></script>" as your first script tag.',
            'For more details you can visit https://open-wc.org/docs/development/scoped-elements/',
          ].join('\n'),
        );
      }
      if (!registeredClass) {
        return this.registry.define(tagName, klass);
      }
      return this.registry.get(tagName);
    }
  };

export const ScopedElementsMixin = dedupeMixin(ScopedElementsMixinImplementation);
