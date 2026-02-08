// Check bundle size
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const distDir = path.join(__dirname, 'dist');
const bundleFile = path.join(distDir, 'price-drop-widget.min.js');

if (!fs.existsSync(bundleFile)) {
  console.error('✗ Bundle not found. Run build first.');
  process.exit(1);
}

// Read and calculate sizes
const content = fs.readFileSync(bundleFile);
const rawSize = content.length;
const gzippedSize = zlib.gzipSync(content).length;

const rawKB = (rawSize / 1024).toFixed(2);
const gzippedKB = (gzippedSize / 1024).toFixed(2);

console.log('\n📦 Bundle Size Report');
console.log('═'.repeat(40));
console.log(`Raw size:     ${rawKB} KB`);
console.log(`Gzipped size: ${gzippedKB} KB`);
console.log('═'.repeat(40));

if (parseFloat(gzippedKB) > 12) {
  console.warn('⚠️  Warning: Gzipped size exceeds 12 KB target!');
  process.exit(1);
} else {
  console.log('✓ Size target met (<12 KB gzipped)');
}
