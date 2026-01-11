import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

const rootDir = __dirname + "/../src";
const viewDir = resolve(rootDir, "react-view");
const serverDir = resolve(rootDir, "..");

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    root: viewDir, // Set root to where index.html is located
    
    plugins: [
      react(),
      createHtmlPlugin({
        template: resolve(viewDir, "index.html"),
        inject: {
          data: {
            // Add any template variables here if needed
          }
        }
      })
    ],

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    },

    build: {
      outDir: resolve(serverDir, "Public/react"),
      emptyOutDir: true,
      sourcemap: true,
      
      rollupOptions: {
        input: {
          main: resolve(viewDir, "index.tsx")
        },
        output: {
          entryFileNames: isProduction ? '[name].[hash].js' : '[name].js',
          chunkFileNames: isProduction ? '[name].[hash].js' : '[name].js',
          assetFileNames: '[name].[hash].[ext]'
        }
      },
      
      // Code splitting similar to webpack's splitChunks
      chunkSizeWarningLimit: 1000,
    },

    css: {
      preprocessorOptions: {
        scss: {
          // Add any SCSS options here if needed
        }
      }
    },

    server: {
      port: 3000, // or your preferred port
      open: true
    },

    // Vite doesn't need polyfills by default, but if you need them:
    // define: {
    //   'process.env': {},
    //   global: 'globalThis',
    // }
  };
});