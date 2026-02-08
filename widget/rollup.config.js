import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs';
import path from 'path';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/price-drop-widget.min.js',
    format: 'umd',
    name: 'PriceDropWidget',
    exports: 'default',
    sourcemap: false,
    banner: '/* Price Drop Notifier Widget v2.0.0 | MIT License */',
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
    }),
    terser({
      compress: {
        drop_console: false,
        pure_funcs: [],
      },
      format: {
        comments: /^!/,
      },
    }),
    {
      name: 'copy-assets',
      writeBundle() {
        const distDir = path.resolve('dist');
        
        // Copy CSS
        const cssSource = path.resolve('src/widget.css');
        const cssDest = path.resolve('dist/widget.css');
        if (fs.existsSync(cssSource)) {
          fs.copyFileSync(cssSource, cssDest);
          console.log('✓ Copied CSS file to dist');
        }
        
        // Copy HTML template
        const htmlSource = path.resolve('src/widget-template.html');
        const htmlDest = path.resolve('dist/widget-template.html');
        if (fs.existsSync(htmlSource)) {
          fs.copyFileSync(htmlSource, htmlDest);
          console.log('✓ Copied HTML template to dist');
        }
      }
    }
  ],
};
