const { sync: globSync } = require('glob');
const { build: esbuild } = require('esbuild');

const litPlugin = require('@lit-labs/eleventy-plugin-lit');

const { asyncGlob } = require('./util/async-glob.cjs');

module.exports = function (eleventyConfig) {
  const componentModules = globSync('./src/components/**/*.js');
  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules,
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
    const files = await asyncGlob('src/components/**/*.js');
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

  eleventyConfig.addLiquidFilter('imageDimensions', (value) => {
    const [width, height] = value.split('x');
    return `width="${width}" height="${height}"`;
  });

  eleventyConfig.addWatchTarget('src/components/');
  eleventyConfig.addWatchTarget('node_modules/lit');
  eleventyConfig.addWatchTarget(
    'node_modules/@webcomponents/template-shadowroot'
  );

  eleventyConfig.addWatchTarget('src/css');
  // passthrough copy
  eleventyConfig.addPassthroughCopy('src/css');

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
  //set default template
};
