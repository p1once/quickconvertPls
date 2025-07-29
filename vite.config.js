import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: ['src/popup/popup.html', 'src/options/options.html'],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'src/assets/**/*', dest: 'src/assets' },
        { src: 'src/content/quickWidget.js', dest: 'src/content' },
        { src: 'widget.css', dest: '.' },
        { src: 'src/background/background.js', dest: 'src/background' },
        { src: 'src/utils/conversions.js', dest: 'src/utils' },
        { src: 'src/utils/cryptoRates.js', dest: 'src/utils' },
        { src: 'src/utils/cache.js', dest: 'src/utils' },
        { src: 'src/utils/supportedCryptos.js', dest: 'src/utils' },
        { src: 'src/utils/utils.js', dest: 'src/utils' },
        { src: 'i18n.js', dest: '.' },
        { src: 'locales/**/*', dest: 'locales' }
      ]
    })
  ]
})
