# QuickConvert+ Extension

## Setup

Install dependencies with:

```bash
npm install
```

## Building

Compile the production build with:

```bash
npm run build
```

This creates the `dist/` directory containing the extension files.

## Loading in Chrome/Edge

1. Open `chrome://extensions` or `edge://extensions` in your browser.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the generated `dist/` folder.

The extension should now be loaded for testing.

## Development mode

For active development with hot reloads run:

```bash
npm run dev
```

This starts Vite in watch mode, allowing you to modify files and see changes during debugging.
