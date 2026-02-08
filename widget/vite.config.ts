import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PriceDropWidget',
            fileName: () => 'price-drop-widget.min.js',
            formats: ['umd'],
        },
        minify: 'terser',
        sourcemap: false,
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                exports: 'default',
            },
        },
    },
    plugins: [
        {
            name: 'copy-assets',
            closeBundle() {
                // Ensure dist directory exists
                const distDir = resolve(__dirname, 'dist');
                if (!fs.existsSync(distDir)) {
                    fs.mkdirSync(distDir, { recursive: true });
                }

                // Copy CSS
                const cssSource = resolve(__dirname, 'src/widget.css');
                const cssDest = resolve(__dirname, 'dist/widget.css');
                if (fs.existsSync(cssSource)) {
                    fs.copyFileSync(cssSource, cssDest);
                    console.log('✓ Copied CSS file to dist');
                } else {
                    console.warn('⚠ CSS file not found at:', cssSource);
                }

                // Copy HTML template
                const htmlSource = resolve(__dirname, 'src/widget-template.html');
                const htmlDest = resolve(__dirname, 'dist/widget-template.html');
                if (fs.existsSync(htmlSource)) {
                    fs.copyFileSync(htmlSource, htmlDest);
                    console.log('✓ Copied HTML template to dist');
                } else {
                    console.warn('⚠ HTML template not found at:', htmlSource);
                }
            },
        },
    ],
});
