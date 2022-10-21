import { LitElement, html, css } from 'lit';

export const HANDLE = `c-highlight`;
class Highlight extends LitElement {
  static styles = [
    css`
      :host {
        --highlight-color: var(--theme-color-primary);
        background-color: var(--highlight-color);
        padding: var(--c-spacing-xxs);
      }
    `,
  ];

  render() {
    return html`<slot></slot>`;
  }
}

if (customElements.get(HANDLE) === undefined) {
  customElements.define(HANDLE, Highlight);
}
