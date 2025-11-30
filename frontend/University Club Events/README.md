# نظام إدارة الفعاليات والنوادي الجامعية - Angular

## نظرة عامة
نظام إدارة الفعاليات والنوادي الجامعية هو تطبيق ويب متكامل مبني باستخدام Angular 18. يوفر النظام واجهات مختلفة للمستخدمين حسب أدوارهم (طلاب، قادة نوادي، مسؤولين) مع دعم كامل للواجهات البرمجية (APIs).

## الميزات الرئيسية

### للطلاب
- تصفح الأحداث والفعاليات
- التسجيل في الأحداث (RSVP)
- الانضمام للنوادي
- عرض التقويم الشخصي
- متابعة الأنشطة

### لقادة النوادي
- إنشاء وإدارة الأحداث
- إدارة طلبات الانضمام للنادي
- تتبع الحضور
- عرض إحصائيات النادي

### للمسؤولين
- مراجعة وموافقة الأحداث
- إدارة النوادي
- مراجعة طلبات إنشاء نوادي جديدة
- عرض إحصائيات شاملة

## التقنيات المستخدمة

- **Angular 18**: إطار العمل الرئيسي
- **TypeScript**: لغة البرمجة
- **Bootstrap 5**: إطار العمل للتصميم المتجاوب
- **Bootstrap Icons**: الأيقونات
- **RxJS**: للبرمجة التفاعلية
- **Angular Router**: للتنقل بين الصفحات
- **Angular HTTP Client**: للاتصال بالواجهات البرمجية

## المتطلبات

- Node.js (v18 أو أحدث)
- npm (v9 أو أحدث)
- Angular CLI (v18 أو أحدث)

## التثبيت والإعداد

### 1. تثبيت المتطلبات

```bash
# تثبيت Angular CLI عالمياً
npm install -g @angular/cli

# أو استخدام npx بدون تثبيت
npx @angular/cli
```

### 2. تثبيت التبعيات

```bash
npm install
```

### 3. إعداد متغيرات البيئة

قم بتحديث ملف `src/environments/environment.ts` مع عنوان API الخاص بك:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // قم بتحديث هذا العنوان
};
```

### 4. تشغيل التطبيق

```bash
# تشغيل التطبيق في وضع التطوير
ng serve

# أو
npm start
```

سيعمل التطبيق على `http://localhost:4200`

### 5. بناء التطبيق للإنتاج

```bash
# بناء التطبيق
ng build --configuration production

# أو
npm run build
```

## هيكل المشروع

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Guards للمصادقة والصلاحيات
│   │   ├── interceptors/    # HTTP Interceptors
│   │   └── services/         # الخدمات الأساسية
│   ├── models/              # النماذج والواجهات
│   ├── pages/                # مكونات الصفحات
│   │   ├── home/
│   │   ├── login/
│   │   ├── events/
│   │   ├── clubs/
│   │   ├── student-dashboard/
│   │   ├── leader-dashboard/
│   │   └── admin-dashboard/
│   └── shared/               # المكونات المشتركة
│       └── components/
│           ├── navbar/
│           └── footer/
├── assets/                   # الملفات الثابتة
├── environments/             # إعدادات البيئة
└── styles.css               # الأنماط العامة
```

## الواجهات البرمجية (APIs)

التطبيق مصمم للعمل مع واجهات برمجية RESTful. يجب أن توفر API النقاط التالية:

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/refresh` - تحديث الرمز المميز

### الأحداث
- `GET /api/events` - الحصول على قائمة الأحداث
- `GET /api/events/:id` - الحصول على حدث محدد
- `POST /api/events` - إنشاء حدث جديد
- `PUT /api/events/:id` - تحديث حدث
- `DELETE /api/events/:id` - حذف حدث
- `POST /api/events/:id/register` - التسجيل في حدث
- `GET /api/events/:id/registrations` - الحصول على قائمة المسجلين
- `POST /api/events/:id/approve` - الموافقة على حدث
- `POST /api/events/:id/reject` - رفض حدث
- `GET /api/events/pending` - الحصول على الأحداث المعلقة

### النوادي
- `GET /api/clubs` - الحصول على قائمة النوادي
- `GET /api/clubs/:id` - الحصول على نادي محدد
- `POST /api/clubs` - إنشاء نادي جديد
- `PUT /api/clubs/:id` - تحديث نادي
- `DELETE /api/clubs/:id` - حذف نادي
- `POST /api/clubs/:id/join-request` - طلب الانضمام لنادي
- `GET /api/clubs/join-requests` - الحصول على طلبات الانضمام
- `POST /api/clubs/join-requests/:id/approve` - الموافقة على طلب الانضمام
- `POST /api/clubs/join-requests/:id/reject` - رفض طلب الانضمام

### الحضور
- `GET /api/attendance/event/:id` - الحصول على سجل الحضور لحدث
- `POST /api/attendance/mark` - تسجيل الحضور
- `PUT /api/attendance/:id` - تحديث حالة الحضور
- `GET /api/attendance/stats/:id` - الحصول على إحصائيات الحضور
- `GET /api/attendance/export/:id` - تصدير بيانات الحضور

## الحسابات التجريبية

يمكنك استخدام الحسابات التالية للاختبار (يجب أن تكون متوفرة في API):

- **طالب**: `student@university.edu` / `student123`
- **قائد نادي**: `leader@university.edu` / `leader123`
- **مسؤول**: `admin@university.edu` / `admin123`

## التطوير

### إضافة مكون جديد

```bash
ng generate component components/my-component
```

### إضافة خدمة جديدة

```bash
ng generate service services/my-service
```

### إضافة Guard جديد

```bash
ng generate guard guards/my-guard
```

## الاختبار

```bash
# تشغيل الاختبارات
ng test
```

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- البريد الإلكتروني: support@university.edu
- الهاتف: +966 50 123 4567

## الترخيص

هذا المشروع مخصص للاستخدام التعليمي والتطوير. جميع الحقوق محفوظة.

---

**تم التطوير باستخدام Angular 18 وأحدث تقنيات الويب لضمان أفضل تجربة مستخدم ممكنة.**
