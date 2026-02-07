// Minify script using Terser
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const zlib = require('zlib');

async function minifyFile() {
  const distDir = path.join(__dirname, 'dist');
  const umdFile = path.join(distDir, 'price-drop-widget.umd.js');
  const minFile = path.join(distDir, 'price-drop-widget.min.js');

  if (!fs.existsSync(umdFile)) {
    console.error('✗ UMD bundle not found. Run build:umd first.');
    process.exit(1);
  }

  const code = fs.readFileSync(umdFile, 'utf8');

  try {
    const result = await minify(code, {
      compress: {
        dead_code: true,
        drop_console: false,
        drop_debugger: true,
        keep_classnames: false,
        keep_fnames: false,
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    });

    if (result.code) {
      fs.writeFileSync(minFile, result.code);
      
      const gzipped = zlib.gzipSync(result.code);
      const gzipSize = (gzipped.length / 1024).toFixed(2);
      
      console.log('✓ Minified bundle created');
      console.log(`  Size: ${(result.code.length / 1024).toFixed(2)} KB`);
      console.log(`  Gzipped: ${gzipSize} KB`);
      
      // Save size info
      const sizeInfo = {
        raw: result.code.length,
        gzipped: gzipped.length,
        rawKB: (result.code.length / 1024).toFixed(2),
        gzippedKB: gzipSize,
      };
      
      fs.writeFileSync(
        path.join(distDir, 'size-info.json'),
        JSON.stringify(sizeInfo, null, 2)
      );
    }
  } catch (error) {
    console.error('✗ Minification failed:', error);
    process.exit(1);
  }
}

minifyFile();
