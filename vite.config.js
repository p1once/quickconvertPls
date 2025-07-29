import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: ['popup.html', 'options.html'],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: '*.png', dest: '.' },
        { src: '*.svg', dest: '.' },
        { src: 'quickWidget.js', dest: '.' },
        { src: 'widget.css', dest: '.' },
        { src: 'background.js', dest: '.' },
        { src: 'conversions.js', dest: '.' },
        { src: 'cryptoRates.js', dest: '.' },
        { src: 'cache.js', dest: '.' },
        { src: 'supportedCryptos.js', dest: '.' },
        { src: 'utils.js', dest: '.' },
        { src: 'i18n.js', dest: '.' },
        { src: 'locales/**/*', dest: 'locales' }
      ]
    })
  ]
})
