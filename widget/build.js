// Build script to create UMD bundle
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const srcFile = path.join(distDir, 'index.js');
const umdFile = path.join(distDir, 'price-drop-widget.umd.js');
const cssFile = path.join(__dirname, 'src', 'widget.css');
const cssDistFile = path.join(distDir, 'widget.css');
const htmlFile = path.join(__dirname, 'src', 'widget-template.html');
const htmlDistFile = path.join(distDir, 'widget-template.html');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read compiled code
if (!fs.existsSync(srcFile)) {
  console.error('✗ Source file not found');
  process.exit(1);
}

const code = fs.readFileSync(srcFile, 'utf8');

// Wrap in UMD
const umdWrapper = `(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PriceDropWidget = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  
  // Create a proper module context for CommonJS-compiled code
  var exports = {};
  var module = { exports: exports };
  
  // Define Object.defineProperty if needed
  if (!Object.defineProperty) {
    Object.defineProperty = function(obj, prop, descriptor) {
      obj[prop] = descriptor.value;
      return obj;
    };
  }
  
  // Execute the compiled code in this context
  (function(exports, module) {
${code}
  })(exports, module);
  
  // Return the exported class (try multiple paths)
  return module.exports.default || module.exports.PriceDropWidget || module.exports || exports.default || exports;
}));`;

fs.writeFileSync(umdFile, umdWrapper);
console.log('✓ Created UMD bundle');

// Copy CSS file
if (fs.existsSync(cssFile)) {
  fs.copyFileSync(cssFile, cssDistFile);
  console.log('✓ Copied CSS file to dist');
} else {
  console.warn('⚠ CSS file not found');
}

// Copy HTML template
if (fs.existsSync(htmlFile)) {
  fs.copyFileSync(htmlFile, htmlDistFile);
  console.log('✓ Copied HTML template to dist');
} else {
  console.warn('⚠ HTML template file not found');
}

