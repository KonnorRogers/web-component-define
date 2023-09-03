export type Constructor<T extends HTMLElement = HTMLElement> = {new (...args: any[]): T}

export type ScopedElementsMap<T extends HTMLElement = HTMLElement> = {
  [key: string]: Constructor<T>;
};

export interface RenderOptions {
  creationScope: Node | ShadowRoot;
  renderBefore: Node | undefined;
}

declare global {
  interface ShadowRootInit {
    customElements?: CustomElementRegistry;
  }
}
