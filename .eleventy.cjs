const sanitizeHtml = require('sanitize-html');
const litPlugin = require('@lit-labs/eleventy-plugin-lit');
const { asyncGlob, syncGlob } = require('./util/async-glob.cjs');
const { build: esbuild } = require('esbuild');

const markdownIt = require('markdown-it');

module.exports = function (eleventyConfig) {
  const componentModules = syncGlob('./src/components/**/*.js');
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

  eleventyConfig.addFilter('markdown', (value) => {
    const md = new markdownIt({ html: true });
    return sanitizeHtml(md.render(value), {
      // generate a list of allowed tags and attributes
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['c-highlight']),
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
  eleventyConfig.addPassthroughCopy('src/css');

  eleventyConfig.addWatchTarget('src/images');
  eleventyConfig.addPassthroughCopy('src/images');

  eleventyConfig.addWatchTarget('src/admin');
  eleventyConfig.addPassthroughCopy('src/admin');
  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
};
