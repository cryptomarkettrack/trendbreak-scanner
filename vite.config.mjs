import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  },
  optimizeDeps: {
    include: ['ccxt'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Available polyfills
      'node:http': 'http-browserify',
      'node:https': 'https-browserify',
      'node:stream': 'stream-browserify',
      'node:buffer': 'buffer',
      'node:util': 'util',
      'node:url': 'url',
      'node:assert': 'assert',
      'http': 'http-browserify',
      'https': 'https-browserify',
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'util': 'util',
      'url': 'url',
      'assert': 'assert',
      // Custom polyfills for modules without browser equivalents
      'net': './src/utils/nodePolyfills.js',
      'tls': './src/utils/nodePolyfills.js',
      'dns': './src/utils/nodePolyfills.js',
      'zlib': './src/utils/nodePolyfills.js',
      'node:net': './src/utils/nodePolyfills.js',
      'node:tls': './src/utils/nodePolyfills.js',
      'node:dns': './src/utils/nodePolyfills.js',
      'node:zlib': './src/utils/nodePolyfills.js',
      'protobufjs/minimal': './src/utils/nodePolyfills.js',
    },
  },
});