const { asyncGlob } = require('../../util/async-glob.cjs');

module.exports = async function ({ content, stylesheets }) {
  const components = await asyncGlob('./components/**/*.js');
  const componentUrls = components.map((component) => {
    return `/components/${component.split(`./src/components/`)[1]}`;
  });
  const preloads = componentUrls
    .map((component) => {
      return `<link rel="modulepreload" href="${component}" />`;
    })
    .join(`\n`);

  const dynamicImports = componentUrls
    .map((component) => {
      return `import('${component}');`;
    })
    .join(`\n`);
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Eleventy + Lit</title>
    
    <!-- As an optimization, immediately begin fetching the JavaScript modules
    that we know for sure we'll eventually need. It's important we don't
    execute them yet, though. -->
    <link
    rel="modulepreload"
    href="/node_modules/lit/experimental-hydrate-support.js"
    />
    
    <link rel="stylesheet" href="/css/main.css" />
    ${stylesheets
      ?.map((stylesheet) => {
        return `<link rel="stylesheet" href="${stylesheet}" />`;
      })
      .join(`\n`)}

    <!-- On browsers that don't yet support native declarative shadow DOM, a
         paint can occur after some or all pre-rendered HTML has been parsed,
         but before the declarative shadow DOM polyfill has taken effect. This
         paint is undesirable because it won't include any component shadow DOM.
         To prevent layout shifts that can result from this render, we use a
         "dsd-pending" attribute to ensure we only paint after we know
         shadow DOM is active. -->
    <style>
      body[dsd-pending] {
        display: none;
      }
    </style>
  </head>

  <body dsd-pending>
    <script>
      if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
        // This browser has native declarative shadow DOM support, so we can
        // allow painting immediately.
        document.body.removeAttribute('dsd-pending');
      }
    </script>

    <!-- Pre-rendered Lit components will be generated here. -->
    ${content}

    <!-- At this point, browsers with native shadow DOM support will already
         be able to paint the initial fully styled state your components,
         without executing a single line of JavaScript! However, the components
         aren't interactive yet -- that's what hydration is for. -->

    <!-- Use a type=module script so that we can use dynamic module imports.
         Note this pattern will not work in IE11. -->
    <script type="module">
      (async () => {
        // Start fetching the Lit hydration support module (note the absence
        // of "await" -- we don't want to block yet).
        const litHydrateSupportInstalled = import(
          '/node_modules/lit/experimental-hydrate-support.js'
        );

        // Check if we require the declarative shadow DOM polyfill. As of
        // February 2022, Chrome and Edge have native support, but Firefox
        // and Safari don't yet.
        if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
          // Fetch the declarative shadow DOM polyfill.
          const { hydrateShadowRoots } = await import(
            '/node_modules/@webcomponents/template-shadowroot/template-shadowroot.js'
          );

          // Apply the polyfill. This is a one-shot operation, so it is important
          // it happens after all HTML has been parsed.
          hydrateShadowRoots(document.body);

          // At this point, browsers without native declarative shadow DOM
          // support can paint the initial state of your components!
          document.body.removeAttribute('dsd-pending');
        }

        // The Lit hydration support module must be installed before we can
        // load any component definitions. Wait until it's ready.
        await litHydrateSupportInstalled;

        // Load component definitions. As each component definition loads, your
        // pre-rendered components will come to life and become interactive.
        //
        // You may also prefer to bundle your components into fewer JS modules.
        // See https://lit.dev/docs/tools/production/#building-with-rollup for
        // more details.
        ${dynamicImports}
      })();
    </script>
  </body>
</html>`;
};
