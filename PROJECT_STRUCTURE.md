# Price Drop Notifier - Project Structure

## Overview
This project contains a complete embeddable widget system for e-commerce price drop notifications.

## Directory Structure

```
Price-Drop-Notifier/
│
├── widget/                          # Widget source code (TypeScript)
│   ├── src/
│   │   └── index.ts                # Main widget implementation
│   ├── dist/                       # Build outputs
│   │   ├── price-drop-widget.min.js (production)
│   │   ├── price-drop-widget.umd.js (development)
│   │   ├── index.d.ts              (type definitions)
│   │   └── size-info.json          (bundle size metrics)
│   ├── package.json
│   ├── tsconfig.json
│   ├── build.js                    (UMD wrapper script)
│   ├── minify.js                   (Terser minification)
│   └── check-size.js               (Size validation)
│
├── userscript/                      # Tampermonkey injection script
│   └── price-drop-injector.user.js
│
├── backend/                         # Express.js API server
│   ├── server.js                   # Main server file
│   ├── public/
│   │   ├── assets/
│   │   │   └── price-drop-widget.min.js (deployed widget)
│   │   ├── demo.html               (CSP-strict demo page)
│   │   ├── demo.css                (external stylesheet)
│   │   └── demo.js                 (external script)
│   ├── package.json
│   └── README.md
│
├── README.md                        # Main documentation
├── NOTES.md                         # Implementation notes & CSS collisions
├── TESTING.md                       # Testing guide & verification
├── start.ps1                        # Quick start script (Windows)
└── .gitignore

```

## Component Descriptions

### Widget (`widget/`)
- **Purpose:** Embeddable TypeScript widget for price drop subscriptions
- **Size:** 3.21 KB gzipped (target: <12 KB) ✅
- **Features:** Shadow DOM, responsive, animated, CSP-compliant
- **Build:** `npm run build` → produces ESM + UMD + minified bundles

### Userscript (`userscript/`)
- **Purpose:** Tampermonkey script to auto-inject widget on e-commerce sites
- **Platforms:** Amazon, eBay, AliExpress (all global TLDs)
- **Features:** Auto-extract product data, CSP fallback, localStorage persistence
- **Installation:** Tampermonkey → Open file → Install

### Backend (`backend/`)
- **Purpose:** Express.js API server for widget + demo hosting
- **Endpoints:**
  - `POST /subscribe-price-drop` (API)
  - `GET /assets/price-drop-widget.min.js` (widget bundle)
  - `GET /embed/price-drop.html` (iframe fallback)
  - `GET /demo` (CSP-strict demo)
- **Port:** 3000 (configurable via `PORT` env var)

## Quick Start

### Option 1: PowerShell Script (Windows)
```powershell
.\start.ps1
```

### Option 2: Manual Setup
```bash
# 1. Build widget
cd widget
npm install
npm run build

# 2. Deploy widget to backend
copy dist\price-drop-widget.min.js ..\backend\public\assets\

# 3. Start server
cd ..\backend
npm install
npm start
```

### Option 3: Individual Components

**Just Widget:**
```bash
cd widget
npm install
npm run build
# Output: dist/price-drop-widget.min.js
```

**Just Server:**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3000
```

**Just Userscript:**
1. Install Tampermonkey extension
2. Open `userscript/price-drop-injector.user.js`
3. Click "Install"
4. Visit Amazon/eBay product pages

## Development Workflow

### Widget Development
```bash
cd widget
npm run dev        # Watch mode (auto-rebuild on save)
npm run build      # Production build
npm run size       # Check bundle size
```

### Server Development
```bash
cd backend
npm start          # Start server
# Edit server.js and restart
```

### Userscript Development
1. Edit `userscript/price-drop-injector.user.js`
2. Save (Tampermonkey auto-reloads)
3. Refresh target page

## Testing

### Manual Testing
1. Visit http://localhost:3000/demo
2. Test widget functionality
3. Check DevTools Console (no errors)
4. Check Network tab (bundle size, timing)
5. Run Lighthouse audit

### Userscript Testing
1. Visit Amazon product page (e.g., amazon.com/dp/B0ABCDEF)
2. Verify widget appears below reviews
3. Subscribe with email
4. Refresh page → widget should not appear (already subscribed)
5. Visit different product → widget reappears

## Configuration

### Widget Config
```typescript
// In your integration code:
new PriceDropWidget({
  apiEndpoint: 'https://your-api.com/subscribe-price-drop',
  product: {
    name: 'Product Name',
    price: '$99.99',
    url: 'https://...'
  },
  theme: {
    accentColor: '#FF9900',
    backgroundColor: '#ffffff'
  }
}).init();
```

### Server Config
```javascript
// In backend/server.js:
const PORT = process.env.PORT || 3000;
const API_DELAY_MIN = 800;  // ms
const API_DELAY_MAX = 2800; // ms
```

### Userscript Config
```javascript
// In userscript/price-drop-injector.user.js:
const CONFIG = {
  widgetScriptUrl: 'http://localhost:3000/assets/price-drop-widget.min.js',
  iframeUrl: 'http://localhost:3000/embed/price-drop.html',
  apiEndpoint: 'http://localhost:3000/subscribe-price-drop',
};
```

## Deployment

### Widget Deployment
1. Build: `npm run build`
2. Upload `dist/price-drop-widget.min.js` to CDN
3. Update `apiEndpoint` in integration code

### Server Deployment
1. Set `PORT` environment variable
2. Configure database (replace in-memory store)
3. Add email service integration
4. Deploy to cloud (Heroku, AWS, Azure, etc.)

### Userscript Deployment
1. Update CONFIG URLs to production domains
2. Publish to Greasy Fork or similar
3. Users install via Tampermonkey

## Bundle Size Details

| File | Raw Size | Gzipped |
|------|----------|---------|
| index.ts (source) | ~15 KB | N/A |
| index.js (compiled) | 15.2 KB | N/A |
| price-drop-widget.umd.js | 15.5 KB | 5.1 KB |
| **price-drop-widget.min.js** | **10.1 KB** | **3.21 KB** ✅ |

**Optimization Techniques:**
- Terser minification (remove comments, whitespace)
- Mangle variable names
- Dead code elimination
- No dependencies (pure vanilla TS)

## File Sizes

```
widget/src/index.ts              15.2 KB
widget/dist/price-drop-widget.min.js   3.2 KB (gzipped)
userscript/price-drop-injector.user.js 8.1 KB
backend/server.js                4.3 KB
backend/public/demo.html         3.8 KB
backend/public/demo.css          2.1 KB
backend/public/demo.js           0.8 KB
```

**Total Project Size:** ~180 KB (uncompressed, excluding node_modules)

## Browser Support

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 53+ | ✅ Full support |
| Firefox | 63+ | ✅ Full support |
| Safari | 10+ | ✅ Full support |
| Edge | 79+ | ✅ Full support |
| IE | Any | ❌ Not supported (Shadow DOM required) |

## Dependencies

### Widget
- **Dev:** `typescript`, `terser`
- **Runtime:** None (vanilla JS)

### Backend
- **Runtime:** `express`, `compression`, `cors`

### Userscript
- **Runtime:** Tampermonkey (provides GM_* APIs)

## License
MIT

## Author
Technical demonstration project

## Links
- Demo: http://localhost:3000/demo
- API Docs: See README.md
- Implementation Notes: See NOTES.md
- Testing Guide: See TESTING.md
