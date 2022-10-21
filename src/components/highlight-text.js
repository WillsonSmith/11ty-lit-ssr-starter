import { LitElement, html, css } from 'lit';

export const HANDLE = `highlight-text`;
class MyComponent extends LitElement {
  static styles = [
    css`
      :host {
        background: yellow;
      }
    `,
  ];

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define(HANDLE, MyComponent);
