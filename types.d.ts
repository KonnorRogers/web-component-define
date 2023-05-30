export type Constructor<T = any> = {new (...args: any[]): T}

export type ScopedElementsMap = {
  [key: string]: typeof HTMLElement;
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
