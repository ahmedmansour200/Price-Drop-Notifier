# 🚂 Railway Deployment Guide

## إعدادات Railway

### 1️⃣ Root Directory
في إعدادات Railway، تأكد من:
```
Root Directory: /backend
```

### 2️⃣ Build Command
```
Build Command: npm install
```

### 3️⃣ Start Command
```
Start Command: npm start
```

### 4️⃣ Environment Variables
لا حاجة لمتغيرات بيئة خاصة، لكن يمكنك إضافة:
```
PORT=3000  (اختياري - Railway يوفره تلقائياً)
NODE_ENV=production
```

---

## ✅ التحقق من النشر

بعد النشر، جرب:

### 1. الصفحة الرئيسية
```
https://your-app.railway.app/
```

### 2. Widget Script
```
https://your-app.railway.app/assets/price-drop-widget.min.js
```

### 3. Demo Page
```
https://your-app.railway.app/demo.html
```

### 4. API Endpoint
```bash
curl -X POST https://your-app.railway.app/subscribe-price-drop \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","product":{"name":"Test","price":"$99","url":"https://example.com"}}'
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Application failed to respond"
**الحل**: تأكد أن السيرفر يستمع على `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### المشكلة: "Module not found"
**الحل**: تأكد أن `package.json` يحتوي على جميع الاعتماديات:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "cors": "^2.8.5"
  }
}
```

### المشكلة: "Build failed"
**الحل**: تحقق من Logs في Railway وابحث عن الخطأ

---

## 📦 الملفات المطلوبة

تأكد أن المجلد `/backend` يحتوي على:
- ✅ `package.json`
- ✅ `server.js`
- ✅ `public/` (مع assets و demo files)
- ✅ `public/assets/price-drop-widget.min.js`
- ✅ `public/assets/widget.css`

---

## 🔗 بعد النشر

1. **انسخ رابط Railway**:
   ```
   https://your-app.railway.app
   ```

2. **حدّث الويدجت** في أي موقع:
   ```html
   <script src="https://your-app.railway.app/assets/price-drop-widget.min.js"></script>
   <script>
     new PriceDropWidget({
       apiEndpoint: 'https://your-app.railway.app/subscribe-price-drop',
       product: { name: 'Product', price: '$99', url: window.location.href }
     }).init();
   </script>
   ```

---

## 🎯 نصائح مهمة

1. **لا تنسى** أن تبني الويدجت قبل النشر:
   ```bash
   cd widget
   npm run build
   ```

2. **انسخ الملفات** للـ backend:
   ```bash
   copy widget\dist\price-drop-widget.min.js backend\public\assets\
   copy widget\dist\widget.css backend\public\assets\
   ```

3. **اعمل commit** للتغييرات:
   ```bash
   git add .
   git commit -m "Update widget build"
   git push
   ```

---

## 📊 مراقبة الأداء

في Railway Dashboard:
- **Metrics**: شوف CPU و Memory usage
- **Logs**: تابع الطلبات والأخطاء
- **Deployments**: تاريخ النشر

---

**✅ جاهز للنشر!**
