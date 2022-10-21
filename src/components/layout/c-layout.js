import { LitElement, html, css } from 'lit';

export const HANDLE = `c-layout`;
class Layout extends LitElement {
  static styles = [
    css`
      :host {
        --gap: clamp(var(--c-spacing-m), 6vw, var(--c-spacing-l));
        --full: minmax(var(--gap), 1fr);
        --content: min(60ch, 100% - var(--gap) * 2);
        --popout: minmax(0, 2rem);
        --feature: minmax(0, 5rem);

        display: grid;
        grid-template-columns:
          [full-start] var(--full)
          [feature-start] var(--feature)
          [popout-start] var(--popout)
          [content-start] var(--content) [content-end]
          var(--popout) [popout-end]
          var(--feature) [feature-end]
          var(--full) [full-end];
      }

      ::slotted(*),
      ::slotted(c-layout-item[type='content']) {
        grid-column: content;
      }

      ::slotted(c-layout-item[type='feature']) {
        grid-column: feature;
      }

      ::slotted(c-layout-item[type='popout']) {
        grid-column: popout;
      }
      ::slotted(c-layout-item[type='full']) {
        grid-column: full;
      }
    `,
  ];

  render() {
    return html`<slot></slot>`;
  }
}

if (customElements.get(HANDLE) === undefined) {
  customElements.define(HANDLE, Layout);
}
