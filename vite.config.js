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
        { src: '*.svg', dest: '.' }
      ]
    })
  ]
})
