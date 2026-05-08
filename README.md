# Nasira Tiba3a - متجر طباعة التيشرتات

تطبيق ويب احترافي لإدارة صفحة طباعة التيشرتات وبيعها أونلاين.

## 🚀 التقنيات المستخدمة

- **React** + **Vite** - إطار العمل الأمامي
- **Tailwind CSS** - التصميم
- **Firebase Firestore** - قاعدة البيانات
- **Firebase Auth** - المصادقة
- **Firebase Storage** - تخزين الملفات
- **React Router** - التنقل
- **Recharts** - الإحصائيات والرسوم البيانية
- **jsPDF** - إنشاء فواتير PDF
- **React Hot Toast** - التنبيهات

## 📦 التثبيت والتشغيل

```bash
# تثبيت المكتبات
npm install

# تشغيل وضع التطوير
npm run dev

# بناء المشروع للنشر
npm run build
```

## 🔐 إعداد المدير

1. أنشئ حساب في Firebase Authentication (Email/Password)
2. أضف document في Firestore collection `admins`:
   - اسم المستند = **UID** الخاص بالمستخدم
   - الحقول:
     ```json
     {
       "email": "admin@example.com",
       "role": "admin",
       "createdAt": "<timestamp>"
     }
     ```
3. سجل الدخول من `/admin/login`

## 🌐 النشر على Firebase Hosting

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# بناء المشروع
npm run build

# نشر
firebase deploy
```

## 📁 هيكل المشروع

```
src/
├── components/       # المكونات المشتركة
├── contexts/         # React Context (Auth, Cart)
├── firebase.js       # إعداد Firebase
├── pages/            # الصفحات
│   ├── admin/        # صفحات الإدارة
│   └── *.jsx         # صفحات الزبائن
├── utils/            # الأدوات والثوابت
├── App.jsx           # التطبيق الرئيسي
└── main.jsx          # نقطة البداية
```

## 📊 واجهة الزبائن

- الصفحة الرئيسية مع المنتجات المميزة
- تصفح المنتجات مع البحث والتصفية
- صفحة تفاصيل المنتج مع اختيار المقاس واللون
- سلة التسوق
- إتمام الطلب مع رفع التصميم
- تتبع حالة الطلب

## ⚙️ لوحة الإدارة

- إحصائيات شاملة (مبيعات، أرباح، طلبات)
- إدارة الطلبات مع تغيير الحالة
- إدارة المنتجات (إضافة، تعديل، حذف)
- إدارة المخزون حسب المقاس واللون
- قائمة الزبائن
- إنشاء وتحميل الفواتير PDF
- إعدادات المتجر

## 📋 Firestore Collections

- `products` - المنتجات
- `orders` - الطلبات
- `customers` - الزبائن
- `admins` - المديرين
- `settings` - الإعدادات
- `invoices` - الفواتير
