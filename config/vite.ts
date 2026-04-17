import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs-extra';

const rootDir = __dirname + "/../src";
const viewDir = resolve(rootDir, "react-view");
const serverDir = resolve(rootDir, "..");

// Plugin to generate the react.leaf template file after build
const generateLeafTemplatePlugin = () => {
  return {
    name: 'generate-leaf-template',
    apply: 'build',
    enforce: 'post' as const,
    
    async writeBundle({ dir }: any) {
      // Read the generated index.html
      const indexPath = resolve(dir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        console.error(`Generated index.html not found at ${indexPath}`);
        return;
      }
      
      let htmlContent = fs.readFileSync(indexPath, 'utf8');
      
      // Create the Leaf template content
      // The original index.html had template variables like #(staticPath), #(environment), etc.
      // that need to remain as-is for the server to process them
      let leafTemplate = htmlContent
        // Replace the script tag that referenced /index.tsx to reference the built JS file
        .replace(/<script type="module" src="\/index\.tsx"><\/script>/, '<script src="#(staticPath)react/index.js"></script>')
        // Ensure all asset paths use the staticPath variable
        .replace(/href="\/assets\//g, 'href="#(staticPath)react/assets/')
        .replace(/src="\/assets\//g, 'src="#(staticPath)react/assets/')
        .replace(/href="\/favicon\//g, 'href="#(staticPath)favicon/')
        .replace(/src="\/favicon\//g, 'src="#(staticPath)favicon/')
        // Replace any remaining absolute paths to use the staticPath variable
        .replace(/src="\/(index\.[^"]*\.js)"/g, 'src="#(staticPath)react/$1"')
        .replace(/href="\/(index\.[^"]*\.css)"/g, 'href="#(staticPath)react/$1"')
        // Replace modulepreload links
        .replace(/href="\/(main\.[^"]*\.js)"/g, 'href="#(staticPath)react/$1"');
        
      // Also replace the modulepreload with the correct path
      leafTemplate = leafTemplate.replace(
        /<link rel="modulepreload" crossorigin href="#\(staticPath\)react\/(main\.[^"]*\.js)">/g,
        '<script src="#(staticPath)react/$1"></script>'
      );
      
      // Ensure the Resources/Views directory exists
      const resourcesViewsDir = resolve(serverDir, "Resources/Views");
      await fs.ensureDir(resourcesViewsDir);
      
      // Write the react.leaf file
      const leafFilePath = resolve(resourcesViewsDir, "react.leaf");
      await fs.writeFile(leafFilePath, leafTemplate);
      
      console.log(`Generated react.leaf template at: ${leafFilePath}`);
    }
  };
};

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    root: viewDir, // Set root to where index.html is located
    
    plugins: [
      react(),
      createHtmlPlugin({
        template: resolve(viewDir, "index.html"), // Specify the template
        minify: isProduction,
        inject: {
          // We'll handle injection through the custom plugin that creates the leaf template
        }
      }),
      generateLeafTemplatePlugin()
    ],

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': viewDir, // Common alias for React projects
      }
    },

    define: {
      global: 'globalThis',
    },

    build: {
      outDir: resolve(serverDir, "Public/react"),
      emptyOutDir: true,
      sourcemap: true,
      copyPublicDir: true, // Ensure public assets like favicons are copied
      
      rollupOptions: {
        input: {
          main: resolve(viewDir, "index.tsx")
        },
        output: {
          entryFileNames: isProduction ? '[name].[hash].js' : '[name].js',
          chunkFileNames: isProduction ? '[name].[hash].js' : '[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.css')) {
              return 'assets/[name].[hash].[ext]';
            }
            return 'assets/[name].[hash].[ext]';
          }
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
      open: true,
      proxy: {
        // Add any proxy configuration if needed for development
      }
    },
  };
});