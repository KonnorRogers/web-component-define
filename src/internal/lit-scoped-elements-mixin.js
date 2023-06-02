// @ts-check
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { ScopedElementsMixin } from './scoped-elements-mixin.js';
import { adoptStyles } from '@lit/reactive-element';

/**
 * @typedef {import('../../types.js').RenderOptions} RenderOptions
 * @typedef {import('@lit/reactive-element').CSSResultOrNative} CSSResultOrNative
 */

/**
 * @template {import('../../types.js').Constructor} T
 * @param {T} superclass
 */
const LitScopedElementsMixinImplementation = superclass => {
  return class LitScopedElementsHost extends ScopedElementsMixin(superclass) {
    /**
     * Obtains the element styles.
     *
     * @returns {undefined | CSSResultOrNative[]}
     */
    static get elementStyles() {
      return this.__elementStyles;
    }

    /**
     * @param {undefined | CSSResultOrNative[]} styles
     */
    static set elementStyles(styles) {
      this.__elementStyles = styles;
    }

    /**
     * @param {ShadowRoot} createdRoot
     */
    adoptStyles (createdRoot) {
      /** @type {{elementStyles: undefined | CSSResultOrNative[]}} */
      // @ts-expect-error
      const constructor = this.constructor
      const { elementStyles } = constructor

      if (elementStyles) {
        adoptStyles(createdRoot, elementStyles);
      }

      this.renderOptions.renderBefore = this.renderOptions.renderBefore || createdRoot.firstChild || undefined;
    }
  };
}

export const LitScopedElementsMixin = dedupeMixin(LitScopedElementsMixinImplementation);
