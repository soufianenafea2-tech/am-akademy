# 🎓 AM Academy – Site Web Complet

Centre de Soutien et Langues – حي مولاي رشيد، الدار البيضاء

---

## 📦 هيكل المشروع

```
am-academy/
├── public/
│   ├── index.html        ← الموقع الرئيسي
│   └── dashboard.html    ← لوحة تحكم المدير
├── server.js             ← الخادم (Express.js)
├── package.json
└── README.md
```

---

## 🚀 تشغيل المشروع

### 1. تثبيت Node.js
تأكد من تثبيت Node.js (الإصدار 18 أو أحدث):
```
https://nodejs.org
```

### 2. تثبيت الحزم
```bash
cd am-academy
npm install
```

### 3. تشغيل الخادم
```bash
npm start
```
أو للتطوير مع إعادة التشغيل التلقائي:
```bash
npm run dev
```

### 4. فتح الموقع
- **الموقع:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard.html

---

## 🗄️ قاعدة البيانات

يستخدم المشروع **SQLite** عبر مكتبة `better-sqlite3`.  
الملف ينشأ تلقائياً: `am_academy.db`

### جدول الطلبات (inscriptions)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | INTEGER | مفتاح أساسي |
| nom | TEXT | اسم الطالب |
| telephone | TEXT | رقم الهاتف |
| email | TEXT | البريد (اختياري) |
| niveau | TEXT | المستوى الدراسي |
| notes | TEXT | ملاحظات |
| statut | TEXT | جديد / تم التواصل / معلق / ملغى |
| created_at | DATETIME | تاريخ التسجيل |

---

## 🔌 API Endpoints

| Method | URL | الوصف |
|--------|-----|-------|
| GET | /api/inscriptions | كل الطلبات |
| POST | /api/inscriptions | طلب جديد |
| PATCH | /api/inscriptions/:id | تحديث الحالة |
| DELETE | /api/inscriptions/:id | حذف طلب |
| GET | /api/stats | إحصائيات |
| GET | /api/settings | إعدادات الأكاديمية |

---

## 🌐 النشر على الإنترنت

للنشر على سيرفر حقيقي:
- **Railway.app** (مجاني، سهل)
- **Render.com** (مجاني)
- **VPS** (Ubuntu + nginx + PM2)

---

## 📱 الميزات

✅ موقع عربي جميل بتصميم احترافي  
✅ نموذج تسجيل متصل بقاعدة البيانات  
✅ لوحة تحكم للمدير  
✅ بحث وتصفية الطلبات  
✅ تحديث حالة كل طالب  
✅ تصدير البيانات CSV  
✅ إحصائيات لحظية  
✅ واجهة متجاوبة (موبايل + ديسكتوب)

---

**AM Academy** © 2025 – Hay Moulay Rachid, Casablanca 🇲🇦
