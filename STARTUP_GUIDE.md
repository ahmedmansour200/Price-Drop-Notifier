# 🚀 دليل التشغيل السريع | Quick Start Guide

## العربية

### تشغيل المشروع

#### الطريقة 1: استخدام سكريبت التشغيل (موصى به)
```powershell
.\start.ps1
```
هذا السكريبت سيقوم ب:
- ✅ بناء الـ widget من TypeScript
- ✅ نسخ الملفات إلى مجلد backend
- ✅ تشغيل الـ server على http://localhost:3000

**ملاحظة**: السيرفر قد يتوقف تلقائياً في بعض الأحيان بسبب PowerShell، لذا استخدم الطريقة 2 للاستقرار الأفضل.

#### الطريقة 2: التشغيل اليدوي (أكثر استقراراً)

1. بناء الـ widget:
```powershell
cd widget
npm install
npm run build
```

2. نسخ الـ widget إلى backend:
```powershell
Copy-Item "dist\price-drop-widget.min.js" "..\backend\public\assets\" -Force
```

3. تشغيل الـ server:
```powershell
cd ..\backend
npm install
node server.js
```

4. افتح المتصفح على: **http://localhost:3000/demo.html**

---

### الروابط المهمة

بعد تشغيل السيرفر، يمكنك الوصول إلى:

| الصفحة | الرابط |
|--------|--------|
| صفحة Demo | http://localhost:3000/demo.html |
| ملف الـ Widget | http://localhost:3000/assets/price-drop-widget.min.js |
| صفحة Embed | http://localhost:3000/embed/price-drop.html |

---

### تثبيت الـ Userscript

1. ثبت Tampermonkey أو Greasemonkey في متصفحك
2. افتح الملف: `userscript/price-drop-injector.user.js`
3. انسخ المحتوى والصقه في Tampermonkey
4. احفظ واذهب إلى أي صفحة منتج على Amazon أو eBay
5. سيظهر الـ widget تلقائياً!

---

### اختبار الـ Widget

#### 1. اختبار صفحة Demo
- افتح http://localhost:3000/demo.html
- أدخل بريدك الإلكتروني
- اضغط "Notify Me"
- يجب أن ترى رسالة نجاح ✅

#### 2. اختبار الـ Userscript
- اذهب إلى: https://www.amazon.com/dp/B0CHWRXH8B (أي منتج)
- يجب أن يظهر الـ widget تلقائياً أسفل السعر
- جرب الاشتراك وسيتم حفظ الحالة

---

### حل المشاكل

#### السيرفر لا يعمل
```powershell
# تحقق من أن البورت 3000 غير مستخدم
netstat -ano | findstr :3000

# إذا كان مستخدم، اقتل العملية
taskkill /PID <PID> /F
```

#### الـ Widget لا يظهر
1. تأكد من أن السيرفر يعمل
2. افتح Console في المتصفح (F12)
3. تحقق من وجود أخطاء في تحميل الـ script
4. تأكد من وجود الملف: `backend\public\assets\price-drop-widget.min.js`

#### إعادة بناء الـ Widget
```powershell
cd widget
npm run build
Copy-Item "dist\price-drop-widget.min.js" "..\backend\public\assets\" -Force
```

---

## English

### Running the Project

#### Method 1: Using Start Script (Recommended)
```powershell
.\start.ps1
```
This script will:
- ✅ Build the widget from TypeScript
- ✅ Copy files to backend folder
- ✅ Start server on http://localhost:3000

**Note**: Server may stop automatically in PowerShell, use Method 2 for better stability.

#### Method 2: Manual Start (More Stable)

1. Build the widget:
```powershell
cd widget
npm install
npm run build
```

2. Copy widget to backend:
```powershell
Copy-Item "dist\price-drop-widget.min.js" "..\backend\public\assets\" -Force
```

3. Start server:
```powershell
cd ..\backend
npm install
node server.js
```

4. Open browser at: **http://localhost:3000/demo.html**

---

### Important Links

After starting the server:

| Page | URL |
|------|-----|
| Demo Page | http://localhost:3000/demo.html |
| Widget File | http://localhost:3000/assets/price-drop-widget.min.js |
| Embed Page | http://localhost:3000/embed/price-drop.html |

---

### Installing Userscript

1. Install Tampermonkey or Greasemonkey in your browser
2. Open file: `userscript/price-drop-injector.user.js`
3. Copy content and paste in Tampermonkey
4. Save and go to any Amazon or eBay product page
5. Widget will appear automatically!

---

### Testing the Widget

#### 1. Test Demo Page
- Open http://localhost:3000/demo.html
- Enter your email
- Click "Notify Me"
- You should see success message ✅

#### 2. Test Userscript
- Go to: https://www.amazon.com/dp/B0CHWRXH8B (any product)
- Widget should appear automatically below price
- Try subscribing and state will be saved

---

### Troubleshooting

#### Server Not Working
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If used, kill the process
taskkill /PID <PID> /F
```

#### Widget Not Showing
1. Make sure server is running
2. Open Console in browser (F12)
3. Check for script loading errors
4. Verify file exists: `backend\public\assets\price-drop-widget.min.js`

#### Rebuild Widget
```powershell
cd widget
npm run build
Copy-Item "dist\price-drop-widget.min.js" "..\backend\public\assets\" -Force
```

---

## 📝 Notes | ملاحظات

- الـ Backend يعمل على Express.js
- الـ Widget مبني بـ TypeScript و UMD format
- الـ Userscript يعمل على Amazon, eBay, AliExpress
- حجم الـ Widget: **3.21 KB gzipped** ⚡
- لا يوجد dependencies خارجية
