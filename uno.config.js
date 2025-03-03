// uno.config.ts
import { defineConfig } from 'unocss'
// https://unocss.dev/presets/uno
import presetUno from '@unocss/preset-uno'
// https://github.com/StatuAgency/unocss-preset-grid
import { presetGrid } from 'unocss-preset-grid'
// https://unocss.dev/transformers/variant-group
import transformerVariantGroup from '@unocss/transformer-variant-group'
// https://unocss.dev/transformers/directives
import transformerDirectives from '@unocss/transformer-directives'
// https://unocss.dev/transformers/compile-class
import transformerCompileClass from '@unocss/transformer-compile-class'

export default defineConfig({
  // ...UnoCSS options
  presets: [
    presetUno(),
    presetGrid(),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
    transformerCompileClass(),
  ],
  rules: [
    [/^vh-(\d+)$/, ([, d]) => ({ height: `${d}vh` })],
    [/^vw-(\d+)$/, ([, d]) => ({ width: `${d}vw` })],

    [/^text-border-(.+)$/, ([, xx]) => ({ "text-shadow": `.75px .75px .1px ${xx}, -.75px -.75px .1px ${xx}, .75px -.75px .1px ${xx}, -.75px .75px .1px ${xx}` })],

    [/^m-var-(.+)$/, ([, xx]) => ({ margin: `var(--${xx})` })],
    [/^p-var-(.+)$/, ([, xx]) => ({ padding: `var(--${xx})` })],
    [/^color-var-(.+)$/, ([, xx]) => ({ color: `var(--${xx})` })],
    [/^bg-var-(.+)$/, ([, xx]) => ({ background: `var(--${xx})` })],
    [/^border-var-(.+)$/, ([, xx]) => ({ "border-color": `var(--${xx})` })],
    [/^flex-align-content-(.+)$/, ([, xx]) => ({ "align-content": xx.replace("&", " ") })],
    [/^justify-content-(.+)$/, ([, xx]) => ({ "justify-content": xx.replace("&", " ") })],
  ],
  shortcuts: [
    {
      'my-box-normal': 'm-2 p-2 gap-2 rounded border flex flex-col',
    },
    {
      // 'my-p-panel': 'p-panel p-card-body overflow-auto',
      'my-p-card': 'p-card p-card-body overflow-auto',
    },
    // [/^--p-(.+)$/, ([, xx]) => (`p-${xx}`)],  // for some primevue components
  ],
})
