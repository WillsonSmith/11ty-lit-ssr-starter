const glob = require('glob');
const { build: esbuild } = require('esbuild');

const litPlugin = require('@lit-labs/eleventy-plugin-lit');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules: ['components/highlight-text.js'],
  });

  const esbuildConfig = {
    format: 'esm',
    bundle: true,
    splitting: true,
    sourcemap: false,
    minify: false,
    allowOverwrite: true,
  };
  eleventyConfig.on('afterBuild', async () => {
    const files = await asyncGlob('components/**/*.js');
    esbuild({
      entryPoints: files,
      outdir: './_site/components',
      ...esbuildConfig,
    });

    esbuild({
      entryPoints: [
        'node_modules/@webcomponents/template-shadowroot/template-shadowroot.js',
      ],
      outdir: '_site/node_modules/@webcomponents/template-shadowroot',
      ...esbuildConfig,
    });

    esbuild({
      entryPoints: ['node_modules/lit/experimental-hydrate-support.js'],
      outdir: '_site/node_modules/lit',
      ...esbuildConfig,
    });
  });

  eleventyConfig.addWatchTarget('components/');
  eleventyConfig.addWatchTarget('node_modules/lit');
  eleventyConfig.addWatchTarget(
    'node_modules/@webcomponents/template-shadowroot'
  );
};

async function asyncGlob(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}
