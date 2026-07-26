# تقرير تدقيق ربط البيانات والملفات

تاريخ التدقيق: 2026-07-26

## الملخص التنفيذي
- مسار منشئ الكورسات ورفع فيديوهات ومرفقات الدروس مربوط بقاعدة البيانات والتخزين السحابي.
- نجاح التحقق: go test للـ handlers و npm run build.
- لا يمكن اعتبار الموقع كله مربوطًا بعد: توجد وحدات واجهة تحتوي TODO صريحًا لجلب/إضافة البيانات أو بيانات placeholder.

## ما تم ربطه
| المجال | الحالة | الملفات الرئيسية |
|---|---|---|
| الكورس/المسودة | مربوط | backend/internal/api/handlers/course_builder_handler.go; src/components/admin/courses/course-builder/hooks.ts |
| الفصول والدروس | مربوط | backend/internal/api/handlers/course_builder_handler.go; CourseBuilderWizard.tsx |
| فيديوهات الدروس | مربوط بقاعدة البيانات والتخزين السحابي | course_builder_handler.go; steps/VideosStep.tsx |
| مرفقات الدروس | مربوط بسجل قاعدة البيانات والتخزين السحابي | course_builder_handler.go; steps/FilesStep.tsx |
| الشهادات العامة والمدفوعات | توجد طبقات backend وقواعد بيانات | backend/internal/api/handlers/certificate_handler.go; admin_payments_handler.go |

## الفجوات المؤكدة
### أولوية P0
- تبويبات ملف المستخدم لا تزال تعرض بيانات فارغة ولا تستدعي API: user-tickets-tab.tsx, user-notes-tab.tsx, user-activity-tab.tsx, user-reports-tab.tsx, user-certificates-tab.tsx, user-payments-tab.tsx, user-devices-tab.tsx, user-custom-fields-tab.tsx, user-courses-tab.tsx, user-audit-log-tab.tsx.
- الملاحظات تحديدًا لا تنفذ الإضافة أو التعديل أو الحذف؛ الأزرار واجهة فقط.

### أولوية P1
- رفع CSV في challenges و rewards يحتاج تدقيق عقد API والتحقق من نتيجة الاستيراد: src/app/(admin)/admin/challenges/page.tsx و rewards/page.tsx.
- استيراد CSV العام يستخدم FileReader محليًا قبل الإرسال، ويجب التأكد من حفظ كل سجل transactionally ومع تقرير أخطاء.
- بعض صفحات الإدارة تعتمد localStorage لتفضيلات الواجهة أو التخطيط/المفضلة؛ هذا مقبول كحالة UI وليس بديلًا لبيانات الأعمال، بينما settings-context و use-global-settings يجب أن يحددا مصدر الحقيقة API ثم cache محلي.

### أولوية P2
- الصفحات التي تحتوي setItems([]) عند فشل API ليست بالضرورة غير مربوطة؛ يجب عدم تصنيفها كفجوة إلا بعد فحص طلب الشبكة.
- ملفات الاختبارات التي تحتوي mock لا تمثل نقصًا في الإنتاج.

## خطة التنفيذ المرحلية
### المرحلة 0 — عقد البيانات
1. جرد جداول PostgreSQL و endpoints الموجودة لكل كيان.
2. توحيد شكل الاستجابة pagination/errors/auth.
3. إضافة اختبارات contract قبل تعديل الواجهات.

### المرحلة 1 — ملف المستخدم
1. تنفيذ endpoints آمنة للتذاكر والملاحظات والنشاط والتقارير والشهادات والمدفوعات والأجهزة والحقول المخصصة والكورسات.
2. ربط التبويبات التسعة مع loading/error/empty states.
3. إضافة صلاحيات ownership وRBAC، ومنع كشف البيانات الخاصة.
4. اختبار CRUD وإعادة التحميل بعد الحفظ.

### المرحلة 2 — رفع واستيراد الملفات
1. توحيد خدمة upload: MIME/magic number/size/quota/virus-scan.
2. حفظ metadata في قاعدة البيانات وربطها بالمالك والكيان.
3. جعل CSV import job أو transaction مع dry-run وتقرير أخطاء قابل للتنزيل.
4. حذف orphan objects من التخزين عند فشل DB أو الحذف.

### المرحلة 3 — وحدات الإدارة
مراجعة الكتب، الاختبارات، الشارات، التحديات، المكافآت، الإعلانات، CMS، الجلسات، التقارير، الإعدادات، والـ webhooks؛ لكل وحدة: قراءة API، كتابة API، ربط الواجهة، صلاحيات، اختبارات.

### المرحلة 4 — التحقق والإطلاق
تشغيل go test ./..., npm run build, اختبارات E2E للرفع والحذف وإعادة التحميل، واختبار rollback ومراقبة orphan files.

## معايير القبول
- لا توجد TODO لجلب/حفظ داخل شاشات الإنتاج المستهدفة.
- كل عملية إنشاء/تعديل/حذف تعود بنتيجة API وتظهر بعد refresh.
- لا توجد بيانات أعمال مصدرها localStorage أو placeholder.
- كل رفع له سجل DB، صلاحية وصول، حد حجم، وفشل ذري أو تنظيف تعويضي.
- نجاح build والاختبارات وعدم وجود أخطاء TypeScript.
