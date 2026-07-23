# دليل تنفيذ Lazy Loading للموقع

## نظرة عامة

تم تنفيذ نظام lazy loading شامل لتحسين أداء الموقع وتقليل وقت التحميل الأولي. يتضمن النظام:

1. **Lazy Loading للمكونات**: تحميل المكونات الثقيلة فقط عند الحاجة
2. **Lazy Loading للصور**: تحميل الصور عند دخولها في نطاق الرؤية
3. **Lazy Loading للأقسام**: تحميل أقسام الصفحة بشكل تدريجي
4. **Skeleton Screens**: عرض هيكل التحميل أثناء انتظار البيانات

## الملفات المُنشأة

### 1. `src/components/lazy/LazyComponents.tsx`
مكونات الهيكل التحميلي (Skeletons):
- `SidebarSkeleton`: هيكل تحميل للقائمة الجانبية
- `HeaderSkeleton`: هيكل تحميل للرأس
- `ContentSkeleton`: هيكل تحميل للمحتوى
- `PageSkeleton`: هيكل تحميل كامل للصفحة
- `ChartSkeleton`: هيكل تحميل للرسوم البيانية
- `CardSkeleton`: هيكل تحميل للبطاقات
- `TableSkeleton`: هيكل تحميل للجداول

### 2. `src/lib/lazyLoad.ts`
أدوات وثوابت Lazy Loading:
- `lazyLoad()`: دالة مساعدة لتحميل المكونات بشكل كسول
- `lazy`: كائن يحتوي على استيرادات كسولة مُعدة مسبقاً
- `useLazyLoad()`: Hook لمراقبة دخول العناصر في نطاق الرؤية
- `preloadCriticalComponents()`: دالة لتحميل المكونات الحرجة مسبقاً

### 3. `src/components/lazy/LazyImage.tsx`
مكون للصور الكسولة:
- يستخدم Intersection Observer لتحميل الصور عند الحاجة
- يدعم placeholder وblur effects
- يحسن من أداء تحميل الصور

### 4. `src/components/lazy/LazySection.tsx`
مكونات للأقسام الكسولة:
- `LazySection`: قالب عام للأقسام الكسولة
- `LazyChart`: للرسوم البيانية
- `LazyTable`: للجداول
- `LazyCard`: للبطاقات

## كيفية الاستخدام

### 1. Lazy Loading للمكونات في Layout

```tsx
// src/components/admin/layout/admin-layout.tsx
import { useState, useEffect } from 'react';

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarLoaded, setSidebarLoaded] = useState(false);
  const [headerLoaded, setHeaderLoaded] = useState(false);

  // تحميل كسول للقائمة الجانبية والرأس
  useEffect(() => {
    const timer = setTimeout(() => {
      setSidebarLoaded(true);
      setHeaderLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* القائمة الجانبية - تظهر كـ skeleton حتى يتم تحميلها */}
      {sidebarLoaded ? (
        <AdminSidebar />
      ) : (
        <div className="w-[260px] animate-pulse bg-muted/20" />
      )}

      {/* الرأس - يظهر كـ skeleton حتى يتم تحميله */}
      {headerLoaded ? (
        <AdminHeader />
      ) : (
        <div className="h-16 animate-pulse bg-muted/10" />
      )}
    </div>
  );
}
```

### 2. Lazy Loading للأقسام في الصفحات

```tsx
// src/app/(admin)/admin/revenue/page.tsx
import { LazySection, LazyChart } from '@/components/lazy/LazySection';

export default function AdminRevenuePage() {
  return (
    <div>
      {/* Stats Cards - تظهر كـ skeletons حتى تظهر في الشاشة */}
      <LazySection skeleton="card" className="grid grid-cols-4 gap-6">
        <AdminStatsCard title="إيرادات اليوم" value={stats.today} />
        <AdminStatsCard title="إيرادات الشهر" value={stats.thisMonth} />
        {/* ... */}
      </LazySection>

      {/* Chart - يظهر كـ skeleton حتى يظهر في الشاشة */}
      <LazyChart className="lg:col-span-2" height={350}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            {/* ... */}
          </AreaChart>
        </ResponsiveContainer>
      </LazyChart>
    </div>
  );
}
```

### 3. Lazy Loading للصور

```tsx
import { LazyImage } from '@/components/lazy/LazyImage';

// استخدام عادي
<LazyImage
  src="/logo.jpg"
  alt="Logo"
  width={200}
  height={200}
/>

// مع أولوية عالية (للصور above-the-fold)
<LazyImage
  src="/hero.jpg"
  alt="Hero"
  priority={true}
  width={1200}
  height={600}
/>
```

### 4. Lazy Loading للمكونات الثقيلة

```tsx
// استيراد كسول لمكتبة recharts
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

// أو استخدام الدالة المساعدة
import { lazyLoad } from '@/lib/lazyLoad';

const HeavyComponent = lazyLoad(
  () => import('@/components/heavy-component'),
  LoadingSkeleton,
  { ssr: false }
);
```

## أفضل الممارسات

### 1. تحديد المكونات الحرجة
- المكونات التي تظهر في الصفحة الأولى (above-the-fold) يجب تحميلها بشكل طبيعي
- المكونات التي تظهر بعد التمرير (below-the-fold) يمكن تحميلها بشكل كسول

### 2. استخدام Skeleton Screens
- استخدم `LazySection` مع نوع skeleton مناسب
- هذا يحسن من تجربة المستخدم أثناء التحميل

### 3. تحميل مسبق للمكونات المتوقعة
```tsx
// في الصفحة الرئيسية، يمكن تحميل مسبق للقائمة الجانبية
useEffect(() => {
  // تحميل بعد 100ms من التحميل الأولي
  const timer = setTimeout(() => {
    import('@/components/admin/layout/admin-sidebar');
  }, 100);
  
  return () => clearTimeout(timer);
}, []);
```

### 4. تجنب Lazy Loading للمكونات الصغيرة
- لا تستخدم lazy loading للمكونات البسيطة جداً
- استخدمها فقط للمكونات الثقيلة أو التي تستخدم مكتبات كبيرة

## قياس الأداء

### 1. استخدام React DevTools
- تحقق من وقت تحميل المكونات
- راقب الـ chunks المُنشأة

### 2. استخدام Lighthouse
- قياس مؤشرات الأداء
- التحقق من تحسينات LCP و FID

### 3. Bundle Analyzer
```bash
# تشغيل تحليل الحزمة
ANALYZE=true npm run build
```

## أمثلة للتطبيق

### مثال 1: صفحة مع رسوم بيانية

```tsx
import { LazyChart } from '@/components/lazy/LazySection';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>التحليلات</h1>
      
      {/* الرسم البياني - يُحمل فقط عند الحاجة */}
      <LazyChart height={400}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            {/* ... */}
          </LineChart>
        </ResponsiveContainer>
      </LazyChart>
    </div>
  );
}
```

### مثال 2: قائمة مع صور

```tsx
import { LazyImage } from '@/components/lazy/LazyImage';

export default function UsersList({ users }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {users.map(user => (
        <div key={user.id}>
          {/* الصورة تُحمل فقط عند دخولها في نطاق الرؤية */}
          <LazyImage
            src={user.avatar}
            alt={user.name}
            width={200}
            height={200}
          />
          <h3>{user.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### مثال 3: جدول بيانات

```tsx
import { LazyTable } from '@/components/lazy/LazySection';

export default function DataPage({ data }) {
  return (
    <div>
      <h1>البيانات</h1>
      
      {/* الجدول - يُحمل فقط عند الحاجة */}
      <LazyTable rows={20}>
        <table>
          {/* ... */}
        </table>
      </LazyTable>
    </div>
  );
}
```

## التحسينات الإضافية

### 1. Preloading للمكونات المتوقعة
```tsx
// في الصفحة الحالية، تحميل مسبق للصفحات المحتمل الانتقال إليها
const handleMouseEnter = () => {
  import('@/app/(admin)/admin/users/page');
};

<Link href="/admin/users" onMouseEnter={handleMouseEnter}>
  المستخدمين
</Link>
```

### 2. Code Splitting
- استخدم `dynamic()` من Next.js للمكونات الكبيرة
- قسم الكود بناءً على المسارات

### 3. Image Optimization
- استخدم `next/image` مع `LazyImage`
- حدد الأبعاد الصحيحة للصور
- استخدم صيغ حديثة (WebP, AVIF)

## المراقبة والقياس

### 1. Core Web Vitals
- **LCP (Largest Contentful Paint)**: يجب أن يكون < 2.5s
- **FID (First Input Delay)**: يجب أن يكون < 100ms
- **CLS (Cumulative Layout Shift)**: يجب أن يكون < 0.1

### 2. Bundle Size
- راقب حجم الحزمة الأولية
- استهدف < 200KB للـ JavaScript الأولي

### 3. Time to Interactive
- قس الوقت حتى تصبح الصفحة تفاعلية بالكامل
- استهدف < 3.5s

## الخلاصة

تنفيذ lazy loading شامل يحسن بشكل كبير من أداء الموقع:
- تقليل وقت التحميل الأولي
- تحسين تجربة المستخدم
- تقليل استهلاك البيانات
- تحسين SEO

تطبق هذه الاستراتيجية على جميع الصفحات في الموقع لضمان أداء مثالي.