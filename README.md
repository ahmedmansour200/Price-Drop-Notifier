# 🛒 Price-Drop Notifier

**Embeddable Widget + Userscript + Express API**

A lightweight, framework-free system that injects a price-drop notification widget into e-commerce product pages (Amazon, eBay, etc.), allowing users to subscribe via email and get notified when prices drop.

---

## ✨ Features

- ✅ No frameworks (no React, Vue, Tailwind, etc.)
- ✅ Vanilla JavaScript + TypeScript
- ✅ CSP-aware embedding (script + iframe fallback)
- ✅ Cross-site userscript injection
- ✅ Minimal, clean UI with visual stability
- ✅ Public HTTPS backend (Express)
- ✅ Production-style error handling and latency simulation

---

## 🧱 Architecture Overview

```
PRICE-DROP-NOTIFIER
│
├─ widget/        # Embeddable widget (Vanilla JS, built with Vite in library mode)
├─ userscript/    # Tampermonkey userscript for Amazon / eBay injection
├─ backend/       # Express API + static asset server
├─ embed/         # iframe fallback page
├─ demo/          # CSP-strict demo page
├─ README.md
└─ NOTES.md


Each part is intentionally isolated to avoid CSP issues, CSS collisions, and tight coupling.

---

## 1️⃣ Embeddable Widget

### Purpose
A small inline widget that renders an email form and submits subscription data to the backend.

### UI
- Email input
- Submit button
- Plain-text status messages
- Subtle animations on submit / error

### Payload
```json
{
  "email": "user@example.com",
  "product": {
    "name": "Product Title",
    "price": "USD 129.99",
    "url": "https://example.com/product"
  }
}
```

### Technical Details
- Written in **TypeScript**
- Built using **Vite** (Library Mode)
- Output format: **UMD**
- Works as:
  - `<script src="...">`
  - iframe embed
  - userscript injection
- Uses **Shadow DOM** to prevent host-site CSS collisions
- Uses CSS custom properties for theming:
  - `--pdw-accent-color`
  - `--pdw-bg-color`
- Network handling:
  - AbortController
  - Request timeout
  - Clear success / error states

---

## 2️⃣ Userscript (Tampermonkey)

### Supported Sites
- Amazon (global)
- eBay (global)
- (Optional) AliExpress

### Responsibilities
- Detect product pages
- Extract:
  - Product title
  - Price (best-effort)
  - Page URL
- Insert a stable container to prevent layout shifts (CLS)
- Inject the widget

### Injection Flow
1. Try script injection (`<script src="...">`)
2. If blocked by CSP → fallback to iframe
3. Persist subscription state via localStorage (keyed by product URL)

This behavior is intentional, not a workaround, and mirrors real-world constraints on sites like Amazon.

---

## 3️⃣ Backend (Express API)

### Endpoint
```
POST /subscribe-price-drop
```

### Accepted Content Types
- `application/json`
- `application/x-www-form-urlencoded`

### Simulated Realism
- **Random delay**: 0.8 – 2.8 seconds
- **Randomized responses**:
  - `200` `{ "ok": true }`
  - `400` `{ "ok": false, "error": "invalid_email" }`
  - `409` `{ "ok": false, "error": "already_subscribed" }`
  - `500` `{ "ok": false, "error": "server_error" }`

### Logging
- HTTP method
- Path
- Status code
- Request latency

### Static Assets
Widget bundle served from:
```
/assets/price-drop-widget.min.js
```
- Correct content type
- Cache headers enabled

---

## 4️⃣ iframe Fallback Page

### Path
```
/embed/price-drop.html
```

### Behavior
- Reads query params:
  ```
  ?name=&price=&url=
  ```
- Initializes the same widget
- Uses same-origin fetch to the backend

This is required to work around strict CSP rules on Amazon and similar platforms.

5️⃣ Demo Page (Strict CSP)

A minimal static demo page used to validate CSP compatibility.
This is required to work around strict CSP rules on Amazon and similar platforms.

---

## 5️⃣ Demo Page (Strict CSP)

A minimal static demo page used to validate CSP compatibility.

### CSP Example
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  connect-src 'self';
  img-src 'self' data:;
  object-src 'none';
  base-uri 'none';
```

### Purpose
- Prove the widget works without inline scripts or styles
- Simulate hostile CSP environments

---

## 🎨 CSS & Visual Stability

### Requirements Met
- ✅ No CSS frameworks
- ✅ Responsive layout
- ✅ Clean, non-foreign look on Amazon / eBay
- ✅ Space reserved before render (prevents layout shift)

### Example Collision & Fix

**Issue:**
Amazon resets button styles globally.

**Fix:**
Shadow DOM + explicit button styles inside the widget.

---

## ⚡ Performance

- ✅ UMD bundle size kept within the required limit (≤ 12 KB gzipped)
- ✅ No framework overhead
- ✅ Minimal dependencies
- ✅ Tree-shaken output via Vite

---

## 📦 How to Run Locally

### Backend
```bash
cd backend
npm install
npm start
```

### Widget Build
```bash
cd widget
npm install
npm run build
```

Copy the output:
```
widget/dist/price-drop-widget.min.js
→ backend/public/assets/
```

### Userscript
1. Install Tampermonkey
2. Load `userscript/price-drop-injector.user.js`
3. Update the backend origin URL if needed

---

## 📝 Notes & Trade-offs

- DOM extraction is heuristic-based and may break with site layout changes
- No real database (intentional for scope)
- No email service (simulation only)
- See `NOTES.md` for detailed CSP and cross-site limitations

---

## 🎥 Demo & Artifacts

- ✅ Demo page under strict CSP
- ✅ Userscript running on Amazon / eBay
- ✅ Network waterfall showing POST request and latency
- ✅ Bundle size proof
- 📹 (Optional) short demo video walkthrough

---

## 📌 Summary

This project focuses on **real-world browser constraints**:

- 🔒 CSP restrictions
- 🌐 Cross-site embedding
- 🎨 CSS isolation
- ⚡ Performance discipline

It demonstrates how to build a **resilient, embeddable widget** without frameworks, suitable for hostile third-party environments.