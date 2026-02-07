// Check bundle size
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const sizeInfoFile = path.join(distDir, 'size-info.json');

if (!fs.existsSync(sizeInfoFile)) {
  console.error('✗ Size info not found. Run build first.');
  process.exit(1);
}

const sizeInfo = JSON.parse(fs.readFileSync(sizeInfoFile, 'utf8'));

console.log('\n📦 Bundle Size Report');
console.log('═'.repeat(40));
console.log(`Raw size:     ${sizeInfo.rawKB} KB`);
console.log(`Gzipped size: ${sizeInfo.gzippedKB} KB`);
console.log('═'.repeat(40));

if (parseFloat(sizeInfo.gzippedKB) > 12) {
  console.warn('⚠️  Warning: Gzipped size exceeds 12 KB target!');
  process.exit(1);
} else {
  console.log('✓ Size target met (<12 KB gzipped)');
}
