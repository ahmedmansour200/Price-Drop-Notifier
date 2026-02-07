# 🚀 Quick Reference - CSS/HTML Separation

## ⚡ Quick Commands

### Build Everything
```powershell
.\start.ps1
```

### Build Widget Only
```powershell
cd widget
npm run build
```

### Deploy Files
```powershell
Copy-Item widget\dist\*.* backend\public\assets\ -Force
```

### Start Server
```powershell
cd backend
node server.js
```

### Open Demo
```
http://localhost:3000/demo.html
```

---

## 📁 File Locations

| File | Location | Purpose |
|------|----------|---------|
| **CSS Source** | `widget/src/widget.css` | Edit styles here |
| **HTML Template** | `widget/src/widget-template.html` | Edit structure here |
| **JS Logic** | `widget/src/index.ts` | Edit logic here |
| **Built CSS** | `widget/dist/widget.css` | Build output |
| **Deployed CSS** | `backend/public/assets/widget.css` | Server serves from here |
| **JS Bundle** | `backend/public/assets/price-drop-widget.min.js` | Widget bundle |

---

## 🎨 Quick Theming

### Edit CSS Variables
```css
/* widget/src/widget.css */
:host {
  --pdw-accent: #FF9900;        /* Change this */
  --pdw-bg: #ffffff;            /* Or this */
}
```

### Override in JavaScript
```javascript
new PriceDropWidget({
  theme: {
    accentColor: '#667eea',
    backgroundColor: '#f8f9fa'
  }
}).init();
```

---

## 🔧 Common Tasks

### Change Button Color
```css
/* widget/src/widget.css */
.pdw-button {
  background: var(--pdw-accent);  /* Uses theme color */
  /* Or hardcode: */
  background: #FF0000;
}
```

### Change Layout
```html
<!-- widget/src/widget-template.html -->
<div class="pdw-container">
  <!-- Edit structure here -->
</div>
```

### Add New Animation
```css
/* widget/src/widget.css */
@keyframes myAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pdw-container {
  animation: myAnimation 0.3s ease-out;
}
```

---

## 🐛 Troubleshooting

### Widget not showing
1. Check console for errors
2. Verify files exist: `backend/public/assets/widget.css`
3. Check server is running: `http://localhost:3000`

### Styles not applying
1. Check CSS loaded: DevTools → Network → widget.css
2. Verify Shadow DOM: Inspect element → Shadow Root
3. Check CSS syntax errors

### Build failed
```powershell
cd widget
rm -r node_modules
npm install
npm run build
```

---

## 📊 File Sizes

| File | Size | Target |
|------|------|--------|
| JS Bundle | 3.46 KB | <12 KB ✅ |
| CSS | 1.8 KB | N/A |
| Total | 5.26 KB | <12 KB ✅ |

---

## 🔗 URLs

| Resource | URL |
|----------|-----|
| Demo Page | `http://localhost:3000/demo.html` |
| JS Bundle | `http://localhost:3000/assets/price-drop-widget.min.js` |
| CSS File | `http://localhost:3000/assets/widget.css` |
| Iframe | `http://localhost:3000/embed/price-drop.html` |
| Subscriptions | `http://localhost:3000/subscriptions/view` |

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `CSS_HTML_SEPARATION.md` | Complete guide (Arabic + English) |
| `CSS_HTML_ARCHITECTURE.md` | Technical architecture |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `PROJECT_STATUS.md` | Current status |
| `README.md` | Main documentation |

---

## ✅ Checklist for Changes

When editing widget:

- [ ] Edit CSS in `widget/src/widget.css`
- [ ] Edit HTML in `widget/src/widget-template.html` (optional)
- [ ] Edit JS in `widget/src/index.ts` (if needed)
- [ ] Run `npm run build` in widget folder
- [ ] Copy files to backend: `Copy-Item dist\*.* ..\backend\public\assets\`
- [ ] Restart server (or refresh browser)
- [ ] Test in browser

---

## 🎯 Key Concepts

### Shadow DOM
- Encapsulates styles
- No CSS conflicts
- Uses `this.shadowRoot`

### External CSS
- Loaded from `/assets/widget.css`
- Injected into Shadow DOM
- Fallback to inline if fails

### CSS Custom Properties
- Defined in `:host`
- Override via theme config
- Values: `--pdw-accent`, `--pdw-bg`

---

## 💡 Tips

1. **Editing Styles:** Always edit `widget/src/widget.css`, not the dist file
2. **Testing:** Use `http://localhost:3000/demo.html` for quick testing
3. **Theming:** Use CSS variables instead of hardcoding colors
4. **Build:** Run `npm run build` after every change
5. **Caching:** Clear browser cache if changes don't appear

---

## 🚨 Don't Edit These Files

❌ `widget/dist/widget.css` - Build output (will be overwritten)  
❌ `backend/public/assets/widget.css` - Deployed file (will be overwritten)  
❌ Any minified `.min.js` files

✅ **Always edit source files in `widget/src/`**

---

## 📞 Quick Help

### CSS not loading?
```bash
curl http://localhost:3000/assets/widget.css
# Should return CSS content
```

### Build error?
```bash
cd widget
npm install
npm run build
```

### Server won't start?
```bash
# Kill existing server
Get-Process node | Stop-Process -Force
# Start fresh
cd backend
node server.js
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.1.0  
**Status:** ✅ Production Ready
