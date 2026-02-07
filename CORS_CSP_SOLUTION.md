# 🔒 CORS & CSP Solution for Userscript

## المشكلة | Problem

عند محاولة حقن الـ widget في Amazon (HTTPS), ظهرت الأخطاء التالية:

### 1. Content Security Policy (CSP) Violation
```
Loading the script 'http://localhost:3000/assets/price-drop-widget.min.js' violates 
the following Content Security Policy directive
```

### 2. CORS - Loopback Address Block
```
Access to script at 'http://localhost:3000/assets/price-drop-widget.min.js' 
from origin 'https://www.amazon.com' has been blocked by CORS policy: 
Permission was denied for this request to access the `loopback` address space.
```

## السبب | Root Cause

المتصفحات الحديثة تمنع:
1. **CSP**: Amazon لديه Content Security Policy صارم يمنع تحميل scripts من localhost
2. **Private Network Access**: Chrome و Firefox يمنعون HTTPS sites من الوصول إلى localhost لأسباب أمنية

## الحل | Solution

### استخدام iframe بدلاً من تحميل السكريبت مباشرة

#### الطريقة القديمة (لا تعمل):
```javascript
// ❌ محظور بسبب CSP و CORS
const script = document.createElement('script');
script.src = 'http://localhost:3000/assets/price-drop-widget.min.js';
document.head.appendChild(script);
```

#### الطريقة الجديدة (تعمل):
```javascript
// ✅ iframe يتجاوز CSP و CORS
const iframe = document.createElement('iframe');
iframe.src = `http://localhost:3000/embed/price-drop.html?name=...&price=...&url=...`;
container.appendChild(iframe);
```

### المزايا:
- ✅ يتجاوز CSP restrictions
- ✅ لا مشاكل CORS
- ✅ معزول تماماً عن الصفحة الأم
- ✅ يدعم postMessage للتواصل

## التغييرات المُطبقة | Changes Applied

### 1. تحديث Userscript
**File**: `userscript/price-drop-injector.user.js`

```javascript
// استخدام iframe مباشرة بدلاً من محاولة تحميل السكريبت
async function injectWidget() {
    // ... extract product data
    
    // استخدام iframe للمواقع HTTPS
    console.log('[PDW] Using iframe method (CORS-safe for HTTPS sites)');
    loadWidgetIframe(productData);
}
```

### 2. تحسين Embed Page
**File**: `backend/server.js`

أضفنا postMessage للإبلاغ عن النجاح:

```javascript
app.get('/embed/price-drop.html', (req, res) => {
  res.send(`
    <script>
      window.PRICE_DROP_CONFIG = {
        product: { ... },
        onSuccess: function() {
          // إرسال رسالة للنافذة الأم
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'pdw-subscription-success',
              product: window.PRICE_DROP_CONFIG.product
            }, '*');
          }
        }
      };
    </script>
  `);
});
```

## الاختبار | Testing

### 1. على Amazon
1. ثبت الـ Userscript المُحدث في Tampermonkey
2. اذهب إلى أي صفحة منتج Amazon: https://www.amazon.com/dp/B08F5HPVQ6
3. يجب أن يظهر الـ widget في iframe ✅

### 2. التحقق من Console
```javascript
[PDW] Detected site: amazon
[PDW] Product data: {name: "...", price: "$...", url: "..."}
[PDW] Using iframe method (CORS-safe for HTTPS sites)
[PDW] Loaded widget via iframe
```

## للإنتاج | For Production

### الخيار 1: استضافة على HTTPS
استضف الـ backend على domain حقيقي مع HTTPS:
```javascript
const CONFIG = {
    widgetScriptUrl: 'https://your-domain.com/assets/price-drop-widget.min.js',
    iframeUrl: 'https://your-domain.com/embed/price-drop.html',
    apiEndpoint: 'https://your-domain.com/subscribe-price-drop',
};
```

### الخيار 2: استمر مع iframe
iframe يعمل بشكل موثوق في جميع الحالات، لكن:
- حجم أكبر قليلاً
- عزل كامل (لا يمكن تخصيص الأنماط من الخارج)

### الخيار 3: Extension بدلاً من Userscript
Chrome/Firefox extension لديها صلاحيات أكثر وتتجاوز هذه القيود.

## الخلاصة | Summary

| الطريقة | CSP | CORS | التكامل | التخصيص |
|---------|-----|------|----------|----------|
| Script Tag | ❌ | ❌ | ممتاز | كامل |
| iframe | ✅ | ✅ | جيد | محدود |
| Extension | ✅ | ✅ | ممتاز | كامل |

**للتطوير المحلي**: استخدم iframe (الحل الحالي) ✅  
**للإنتاج**: استضف على HTTPS domain حقيقي

---

**Updated**: 2026-02-07  
**Status**: ✅ Working with iframe method
