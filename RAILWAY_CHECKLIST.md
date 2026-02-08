# ✅ Railway Deployment Checklist

## قبل النشر (Pre-Deployment)

### 1. بناء الويدجت
```bash
cd widget
npm run build
```
**النتيجة المتوقعة**:
- ✅ `dist/price-drop-widget.min.js` (9.71 KB)
- ✅ `dist/widget.css` (4 KB)

### 2. نسخ الملفات للـ Backend
```bash
Copy-Item dist\price-drop-widget.min.js ..\backend\public\assets\
Copy-Item dist\widget.css ..\backend\public\assets\
```

### 3. التحقق من الملفات
```bash
cd ..\backend
dir public\assets
```
**يجب أن يظهر**:
- ✅ `price-drop-widget.min.js`
- ✅ `widget.css`

---

## إعدادات Railway

### في Railway Dashboard → Settings:

#### Root Directory
```
/backend
```

#### Build Command (اتركها فارغة أو):
```
npm install
```

#### Start Command
```
npm start
```

#### Watch Paths (اختياري)
```
backend/**
```

---

## المتغيرات البيئية (اختياري)

في Railway → Variables:
```
NODE_ENV=production
```

**ملاحظة**: `PORT` يتم توفيره تلقائياً من Railway ❌ لا تضيفه يدوياً

---

## بعد النشر

### 1. تحقق من Build Logs
في Railway → Deployments → اضغط على آخر deployment → شوف الـ Logs

**لازم تشوف**:
```
✓ Dependencies installed
✓ Starting application
🚀 Price Drop Notifier Backend running on...
```

### 2. جرب الروابط

#### الصفحة الرئيسية
```
https://your-app.railway.app/
```
**المفروض**: يظهر "Price Drop Notifier API"

#### Demo Page
```
https://your-app.railway.app/demo.html
```
**المفروض**: تشوف الويدجت شغال

#### Widget Script
```
https://your-app.railway.app/assets/price-drop-widget.min.js
```
**المفروض**: يحمّل JavaScript

#### API Test
```bash
curl -X POST https://your-app.railway.app/subscribe-price-drop \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","product":{"name":"Test Product","price":"$99","url":"https://example.com"}}'
```
**المفروض**: `{"ok":true}`

---

## 🐛 المشاكل الشائعة

### ❌ "Application failed to respond"

**الأسباب المحتملة**:
1. السيرفر مش بيستمع على `process.env.PORT`
2. السيرفر مش بيستمع على `0.0.0.0`

**الحل**: تحقق من `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { ... });
```
✅ **تم التحقق**: الكود صحيح في مشروعك!

---

### ❌ "Build failed: Cannot find module"

**السبب**: Dependencies ناقصة في `package.json`

**الحل**: تحقق من `backend/package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "cors": "^2.8.5"
  }
}
```
✅ **تم التحقق**: كل الـ dependencies موجودة!

---

### ❌ Widget لا يظهر

**السبب**: الملفات مش منسوخة في `public/assets`

**الحل**: نفذ:
```bash
cd widget
npm run build
Copy-Item dist\* ..\backend\public\assets\
```
✅ **تم التحقق**: الملفات موجودة (9.71 KB + 4 KB)!

---

### ❌ CORS Errors

**السبب**: CORS مش مفعّل

**الحل**: تحقق من `server.js`:
```javascript
const cors = require('cors');
app.use(cors());
```
✅ **تم التحقق**: CORS مفعّل!

---

## 📊 الملفات في Backend

```
backend/
├── package.json          ✅ (موجود)
├── server.js             ✅ (376 lines)
├── railway.json          ✅ (تم إنشاؤه)
├── RAILWAY_DEPLOYMENT.md ✅ (دليل النشر)
└── public/
    ├── demo.html         ✅
    ├── demo.js           ✅
    ├── demo.css          ✅
    └── assets/
        ├── price-drop-widget.min.js  ✅ (9.71 KB)
        └── widget.css                ✅ (4 KB)
```

---

## 🎯 خطوات النشر النهائية

### 1. Commit التغييرات
```bash
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### 2. في Railway Dashboard
1. اذهب إلى Settings
2. تأكد من Root Directory = `/backend`
3. انتظر Auto-deployment

### 3. بعد النشر بنجاح
1. انسخ الرابط من Railway
2. افتح `https://your-app.railway.app/demo.html`
3. جرب الويدجت!

---

## ✅ كل شيء جاهز للنشر!

المشروع مضبوط 100% ✨

**مشاكل محتملة**: ❌ لا يوجد
**ملفات ناقصة**: ❌ لا يوجد  
**إعدادات خاطئة**: ❌ لا يوجد

🚀 **اضغط Deploy في Railway وانتظر النتيجة!**
