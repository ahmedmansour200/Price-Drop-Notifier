# 🔧 Build System Migration to Rollup

## ما تم تغييره؟

تم الانتقال من نظام build مخصص (build.js + minify.js) إلى **Rollup** - أداة بناء احترافية.

---

## 🎯 المشكلة السابقة

```
❌ ReferenceError: exports is not defined
```

**السبب**:
- TypeScript كان يولد CommonJS (`exports.__esModule`)
- UMD wrapper المخصص مش كان بيتعامل معاها صح
- Terser مش بيقبل ES modules في بعض الحالات

---

## ✅ الحل: Rollup

### الفوائد:

| قبل Rollup | بعد Rollup |
|------------|------------|
| build.js مخصص (70 سطر) | rollup.config.js معياري |
| minify.js منفصل | مدمج في Rollup |
| 3 خطوات بناء | خطوة واحدة |
| مشاكل UMD | UMD نظيف 100% |
| exports errors | بدون أخطاء ✅ |

---

## 📦 الأدوات المثبتة

```json
{
  "rollup": "^2.79.2",
  "@rollup/plugin-node-resolve": "^16.0.3",
  "@rollup/plugin-typescript": "^12.3.0",
  "rollup-plugin-terser": "^7.0.2",
  "tslib": "^2.6.0"
}
```

---

## 🔄 عملية البناء الجديدة

### قبل:

```bash
npm run clean
npm run build:esm     # TypeScript → ESM
npm run build:umd     # TypeScript → CommonJS → UMD wrapper
npm run build:minify  # Minify with Terser
npm run size          # Check size
```

### الآن:

```bash
npm run build
# ↓
# Rollup يعمل كل شيء في خطوة واحدة:
# 1. TypeScript → JavaScript
# 2. UMD Wrapper
# 3. Minification
# 4. Copy CSS/HTML
# 5. Size check
```

---

## 📂 الملفات المتأثرة

### حُذفت ❌
- `build.js` - استبدلت بـ rollup.config.js
- `minify.js` - مدمجة في Rollup

### أُضيفت ✅
- `rollup.config.js` - إعدادات Rollup

### عُدّلت 🔧
- `package.json` - سكريبتات أبسط
- `tsconfig.json` - `module: "ESNext"` بدلاً من CommonJS
- `check-size.js` - يقرأ الملف مباشرة بدلاً من size-info.json
- `start.ps1` - حجم محدث (3.38 KB)

---

## 🎨 هيكل Rollup Config

```javascript
// rollup.config.js
export default {
  input: 'src/index.ts',           // مصدر TypeScript
  output: {
    file: 'dist/price-drop-widget.min.js',
    format: 'umd',                  // UMD للمتصفحات
    name: 'PriceDropWidget',        // Global variable
    exports: 'default'              // Export default class
  },
  plugins: [
    resolve(),                      // حل الاعتماديات
    typescript(),                   // تحويل TypeScript
    terser(),                       // تصغير الكود
    copyAssets()                    // نسخ CSS/HTML
  ]
};
```

---

## 🚀 الاستخدام

### البناء:
```bash
cd widget
npm run build
```

### البناء مع المراقبة (تطوير):
```bash
npm run build:watch
# أو
npm run dev
```

### النشر للـ Backend:
```bash
# يدوياً
Copy-Item dist\price-drop-widget.min.js ..\backend\public\assets\

# أو استخدم start.ps1
..\start.ps1
```

---

## 📊 النتيجة

| Metric | القيمة |
|--------|--------|
| **Raw Size** | 9.75 KB |
| **Gzipped** | **3.38 KB** ✨ |
| **الهدف** | <12 KB |
| **النسبة** | 28% (72% أقل!) |

---

## 🔍 التحقق من الكود

### الكود القديم (CommonJS):
```javascript
// ❌ كان يسبب مشاكل
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceDropWidget = ...
```

### الكود الجديد (UMD):
```javascript
// ✅ UMD نظيف
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PriceDropWidget = factory();
  }
}(this, function () {
  class PriceDropWidget { ... }
  return PriceDropWidget;
}));
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: `exports is not defined`
**الحل**: تم حلها! Rollup ينشئ UMD صحيح بدون exports خارج السياق.

### المشكلة: `tslib not found`
**الحل**: تم تثبيت tslib كـ devDependency.

### المشكلة: `Size info not found`
**الحل**: تم تحديث check-size.js ليقرأ الملف مباشرة.

---

## 📚 المراجع

- [Rollup Documentation](https://rollupjs.org/)
- [UMD Pattern](https://github.com/umdjs/umd)
- [TypeScript + Rollup Guide](https://rollupjs.org/guide/en/#typescript)

---

## ✅ الخلاصة

الانتقال لـ Rollup حل جميع المشاكل:
- ✅ بدون `exports is not defined`
- ✅ UMD نظيف ومتوافق
- ✅ عملية بناء أبسط وأسرع
- ✅ كود أصغر (3.38 KB)
- ✅ تطوير أسهل مع watch mode

---

**تاريخ التحديث**: 8 فبراير 2026  
**الإصدار**: 2.0.0
