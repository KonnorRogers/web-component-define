import { fixture, defineCE, waitUntil, assert, expect } from '@open-wc/testing';
import { LitElement, html, css } from 'lit';
import { until } from 'lit/directives/until.js';

import { LitScopedElementsMixin as ScopedElementsMixin } from '../src/lit.js';

export function runScopedElementsMixinSuite({ label }) {
  class FeatureA extends LitElement {
    render() {
      return html` <div>Element A</div> `;
    }
  }

  class FeatureB extends LitElement {
    render() {
      return html` <div>Element B</div> `;
    }
  }

  suite(label, () => {
    test('has a default value for "static get scopedElements()" of {}', async () => {
      const tag = defineCE(class extends ScopedElementsMixin(LitElement) {});
      const el = await fixture(`<${tag}></${tag}>`);
      assert.deepEqual(el.constructor.scopedElements, {});
    });

    test('will not fail if there is no "static get scopedElements()"', async () => {
      const tag = defineCE(
        class ContainerElement extends ScopedElementsMixin(LitElement) {
          render() {
            return html` <feature-a></feature-a><feature-b></feature-b> `;
          }
        },
      );
      const el = await fixture(`<${tag}></${tag}>`);
      // not upgraded custom elements are normal dom element e.g. HTMLElement
      assert.instanceOf(el.shadowRoot.children[0], HTMLElement);
      assert.instanceOf(el.shadowRoot.children[1], HTMLElement);
    });

    test('supports elements define in "static get scopedElements()"', async () => {
      const tagString = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          static get scopedElements() {
            return {
              'feature-a': FeatureA,
              'feature-b': FeatureB,
            };
          }

          render() {
            return html` <feature-a></feature-a><feature-b></feature-b> `;
          }
        },
      );
      const el = await fixture(`<${tagString}></${tagString}>`);
      assert.instanceOf(el.shadowRoot.children[0], FeatureA);
      assert.instanceOf(el.shadowRoot.children[1], FeatureB);
    });

    test('has a "createScopedElement" helper to manually create scoped dom nodes', async () => {
      const tagString = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          static get scopedElements() {
            return {
              'feature-a': FeatureA,
              'feature-b': FeatureB,
            };
          }

          createTag() {
            const tag = this.createScopedElement('feature-a');
            tag.setAttribute('foo', 'bar');
            return tag;
          }

          render() {
            return html`${this.createTag()}<feature-b></feature-b> `;
          }
        },
      );
      const el = await fixture(`<${tagString}></${tagString}>`);
      assert.instanceOf(el.shadowRoot.children[0], FeatureA);
      assert.equal(el.shadowRoot.children[0].getAttribute('foo'), 'bar');
      assert.instanceOf(el.shadowRoot.children[1], FeatureB);
    });

    test('supports to extend as ScopedElements component without defining unused sub components', async () => {
      class FeatureC extends LitElement {
        render() {
          return html` <div>Element C</div> `;
        }
      }

      class FeatureD extends LitElement {
        render() {
          return html` <div>Element D</div> `;
        }
      }

      class PageA extends ScopedElementsMixin(LitElement) {
        static get scopedElements() {
          return {
            'feature-c': FeatureC,
            'feature-d': FeatureD,
          };
        }

        render() {
          return html`
            <feature-c></feature-c>
            <feature-d></feature-d>
          `;
        }
      }

      const tag = defineCE(
        class extends ScopedElementsMixin(PageA) {
          render() {
            return html` <feature-c></feature-c> `;
          }
        },
      );
      const el = await fixture(`<${tag}></${tag}>`);

      assert.instanceOf(el.shadowRoot.children[0], FeatureC);
    });

    test('supports lazy loaded elements', async () => {
      class FeatureLazyB extends FeatureB {}

      const tag = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          static get scopedElements() {
            return {
              'feature-a': FeatureA,
            };
          }

          render() {
            return html`
              <feature-a></feature-a>
              <feature-lazy-b></feature-lazy-b>
              <feature-c></feature-c>
            `;
          }
        },
      );

      const el = await fixture(`<${tag}></${tag}>`);

      assert.instanceOf(el.shadowRoot.children[0], FeatureA);
      assert.notInstanceOf(el.shadowRoot.children[1], FeatureLazyB);
      assert.isOk(el.shadowRoot.children[2]);

      el.defineScopedElement('feature-lazy-b', FeatureLazyB);

      assert.instanceOf(el.shadowRoot.children[1], FeatureLazyB);
    });

    test('supports inheritance with added scoped elements', async () => {
      class Lorem extends LitElement {}
      class Ipsum extends LitElement {}

      class Foo extends ScopedElementsMixin(LitElement) {
        static get scopedElements() {
          return {
            'x-lorem': Lorem,
          };
        }

        render() {
          return html`<x-lorem></x-lorem>`;
        }
      }
      class Bar extends Foo {
        static get scopedElements() {
          return {
            ...super.scopedElements,
            'x-ipsum': Ipsum,
          };
        }

        render() {
          return html`
            <x-lorem></x-lorem>
            <x-ipsum></x-ipsum>
          `;
        }
      }

      const foo = defineCE(Foo);
      const bar = defineCE(Bar);

      const elFoo = await fixture(`<${foo}></${foo}>`);
      const elBar = await fixture(`<${bar}></${bar}>`);

      assert.instanceOf(elFoo.shadowRoot.children[0], Lorem);
      assert.instanceOf(elBar.shadowRoot.children[0], Lorem);
      assert.instanceOf(elBar.shadowRoot.children[1], Ipsum);
    });

    test('should avoid definition if lazy is already defined', async () => {
      class FeatureLazyA extends FeatureA {}
      const tag = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          render() {
            return html` <feature-lazy-a></feature-lazy-a> `;
          }
        },
      );

      const el = await fixture(`<${tag}></${tag}>`);

      assert.notInstanceOf(el.shadowRoot.children[0], FeatureLazyA);

      el.defineScopedElement('feature-lazy-a', FeatureLazyA);

      assert.instanceOf(el.shadowRoot.children[0], FeatureLazyA);

      el.defineScopedElement('feature-lazy-a', FeatureLazyA);
    });

    test("support define a lazy element even if it's not used in previous templates", async () => {
      class LazyElement extends LitElement {
        render() {
          return html` <div>Lazy element</div> `;
        }
      }

      const tag = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          static get scopedElements() {
            return {
              'feature-a': FeatureA,
            };
          }

          connectedCallback() {
            if (super.connectedCallback) {
              super.connectedCallback();
            }

            this.defineScopedElement('lazy-element', LazyElement);

            this.loading = new Promise(resolve => {
              resolve(html` <lazy-element></lazy-element> `);
            });
          }

          render() {
            return html`
              <feature-a></feature-a>
              ${until(this.loading, html` <div>Loading...</div> `)}
            `;
          }
        },
      );

      const el = await fixture(`<${tag}></${tag}>`);

      await waitUntil(() => el.shadowRoot.children[1] instanceof LazyElement);
    });

    test.skip('should use by default a registry per class instead of per instance', async () => {
      class LazyElementA extends LitElement {
        render() {
          return html` <div>Lazy element A</div> `;
        }
      }

      const tag = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          static get scopedElements() {
            return {
              'feature-a': FeatureA,
            };
          }

          connectedCallback() {
            if (super.connectedCallback) {
              super.connectedCallback();
            }

            this.loading = new Promise(resolve => {
              resolve(html` <lazy-element></lazy-element> `);
            });
          }

          render() {
            return html`
              <feature-a></feature-a>
              ${until(this.loading, html` <div>Loading...</div> `)}
            `;
          }
        },
      );

      const $el1 = await fixture(`<${tag}></${tag}>`);
      const $el2 = await fixture(`<${tag}></${tag}>`);

      $el1.defineScopedElement('lazy-element', LazyElementA);

      await waitUntil(() => $el1.shadowRoot.children[1] instanceof LazyElementA);
      await waitUntil(() => $el2.shadowRoot.children[1] instanceof LazyElementA);
    });

    test('should reuse the global tag if defined with the same name and class reference', async () => {
      class ItemA extends LitElement {
        render() {
          return html` <div>Item A</div> `;
        }
      }

      customElements.define('item-a', ItemA);

      const tag = defineCE(
        class ContainerElement extends ScopedElementsMixin(LitElement) {
          static get scopedElements() {
            return {
              ...super.scopedElements,
              'item-a': customElements.get('item-a'),
            };
          }

          render() {
            return html` <item-a></item-a> `;
          }
        },
      );

      const el = await fixture(`<${tag}></${tag}>`);
      const firstElement = el.shadowRoot.children[0];

      assert.equal(firstElement.tagName.toLowerCase(), 'item-a');
      assert.instanceOf(firstElement, ItemA);
    });

    test('should adjust the `renderBefore` for shimmed adoptedStyleSheets', async () => {
      const tag = defineCE(
        class extends ScopedElementsMixin(LitElement) {
          static get styles() {
            return css`
              p {
                color: blue;
              }
            `;
          }

          render() {
            return html`
              <style>
                p {
                  color: red;
                }
              </style>
              <p>This should be blue!</p>
            `;
          }
        },
      );

      const el = await fixture(`<${tag}></${tag}>`);

      assert.equal(
        getComputedStyle(el.shadowRoot.querySelector('p')).getPropertyValue('color'),
        'rgb(0, 0, 255)'
      );
    });

    suite('directives integration', () => {
      test('should work with until(...)', async () => {
        const content = new Promise(resolve => {
          setTimeout(() => resolve(html` <feature-a id="feat"></feature-a> `), 0);
        });

        const tag = defineCE(
          class ContainerElement extends ScopedElementsMixin(LitElement) {
            static get scopedElements() {
              return {
                'feature-a': FeatureA,
              };
            }

            render() {
              return html` ${until(content, html` <span>Loading...</span> `)} `;
            }
          },
        );

        const el = await fixture(`<${tag}></${tag}>`);

        assert.isNull(el.shadowRoot.getElementById('feat'));

        await waitUntil(() => el.shadowRoot.getElementById('feat') !== null);
        const feature = el.shadowRoot.getElementById('feat');

        assert.equal(html`${feature.shadowRoot.innerHTML}`.toString(), html`<div>Element A</div>`.toString());
      });
    });
  });
}
