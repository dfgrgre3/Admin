# تقرير توحيد نظام الهوية — المرحلة 1

## التاريخ
2026-07-01

## المشكلة الأصلية
"تعدد مصادر الهوية والأمان" — تبين بعد فحص الكود أن **Clerk غير موجود** في النظام. المشكلة الحقيقية كانت:
- وجود Supabase SSR middleware (`src/utils/supabase/middleware.ts`) مع إدارة جلسات Auth
- وجود Supabase Server/Browser Client مع `@supabase/ssr` (يدير كوكيز Auth منفصلة)
- بينما نظام الهوية الفعلي هو JWT مخصص من Go backend

## التغييرات المنفذة

### 1. `src/utils/supabase/server.ts`
- **قبل**: يستخدم `createServerClient` من `@supabase/ssr` مع إدارة كوكيز Auth
- **بعد**: يستخدم `createClient` من `@supabase/supabase-js` مع تعطيل Auth بالكامل:
  - `autoRefreshToken: false`
  - `persistSession: false`
  - `detectSessionInUrl: false`

### 2. `src/utils/supabase/client.ts`
- **قبل**: يستخدم `createBrowserClient` من `@supabase/ssr` مع إدارة جلسات المتصفح
- **بعد**: يستخدم `createClient` من `@supabase/supabase-js` مع نفس إعدادات تعطيل Auth

### 3. `src/utils/supabase/middleware.ts` — **تم الحذف**
- كان ملفاً غير مستخدم (لا يوجد أي import له في المشروع)
- كان سيسبب تضارب كوكيز لو تم تفعيله مستقبلاً

## الوضع الحالي
- ✅ مصدر هوية واحد: JWT مخصص (Go backend → middleware.ts يتحقق بـ `jose` HS256)
- ✅ Supabase أصبح **DB Client خالص** — لا يدير Auth ولا جلسات
- ✅ لا تضارب في الكوكيز
- ✅ لا تغيير في الـ API Surface (نفس `createClient` export)

## توصيات مستقبلية
- إذا احتجت RLS في Supabase يعتمد على `auth.uid()`، يجب تمرير JWT كـ Authorization header:
  ```ts
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
  ```
- يمكن إزالة `@supabase/ssr` من dependencies إذا لم يعد مستخدماً في أي مكان آخر