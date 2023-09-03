// @ts-check
import { dedupeMixin } from '@open-wc/dedupe-mixin';

/**
 * Extends any extension of HTMLElement to call `.createRenderRoot()` on registration to work with
 *   scoped elements mixin
 * @template {import('../../types.js').Constructor} T
 * @param {T} superclass
 */
const CreateRenderRootMixinImplementation = superclass => {
  return class CreateRenderRootHost extends superclass {
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

    /** @type {ShadowRootInit} */
    get shadowRootOptions () {
      // @ts-expect-error
      return this.constructor.shadowRootOptions
    }

    createRenderRoot () {
      const renderRoot = this.shadowRoot ?? this.attachShadow(this.shadowRootOptions || {mode: "open"})
      return renderRoot;
    }

    connectedCallback () {
      // @ts-expect-error
      if (typeof super.connectedCallback === "function") {
        // @ts-expect-error
        super.connectedCallback()
      }

      // create renderRoot before first update.
      if (this.renderRoot == null) {
        this.renderRoot = this.createRenderRoot();
      }
    }
  }
}

export const CreateRenderRootMixin = dedupeMixin(CreateRenderRootMixinImplementation);
