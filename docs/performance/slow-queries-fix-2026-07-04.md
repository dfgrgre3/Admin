# تقرير تحليل الأداء - 2026-07-04

## المشاكل المكتشفة والإصلاحات

### 1. خطأ عمود `aiCredits` غير موجود ⚠️ (تم الإصلاح)

**الملف:** `backend/internal/api/handlers/ai_handler.go:293`

**المشكلة:** استعلام UPDATE يستخدم اسم العمود `"aiCredits"` (camelCase) بينما العمود في قاعدة البيانات اسمه `ai_credits` (snake_case). هذا يسبب الخطأ:
```
ERROR: column "aiCredits" does not exist (SQLSTATE 42703)
```

**السبب:** دالة `UpdateColumn` في GORM تتجاوز `NamingStrategy` وترسل اسم العمود كما هو مباشرة إلى PostgreSQL.

**الإصلاح:** تغيير `"aiCredits"` إلى `"ai_credits"` في استعلام `UpdateColumn`.

```go
// قبل (خطأ):
db.DB.Model(&models.User{}).Where("id = ?", userID).UpdateColumn("aiCredits", gorm.Expr("GREATEST(0, \"aiCredits\" - ?)", credits))

// بعد (صحيح):
db.DB.Model(&models.User{}).Where("id = ?", userID).UpdateColumn("ai_credits", gorm.Expr("GREATEST(0, ai_credits - ?)", credits))
```

---

### 2. استعلام `SELECT *` بطيء في `/api/auth/me` ⚠️ (تم الإصلاح)

**الملف:** `backend/internal/services/auth_service.go:994`

**المشكلة:** استعلام `GetCurrentUser` يستخدم `SELECT *` مما يعني جلب جميع أعمدة جدول User (أكثر من 50 عموداً) في كل طلب. هذا يسبب:
- زمن استجابة 500ms+ للاستعلام
- نقل بيانات غير ضروري (جدول User كبير جداً)
- ضغط على الـ read replica

**الإصلاح:** استخدام `Select` محدد بجلب الأعمدة المطلوبة فقط (25 عموداً بدلاً من 50+):

```go
queryDB.Select("id, email, name, username, avatar, role, status, email_verified, phone_verified, country, grade_level, education_type, section, school, gender, bio, total_xp, level, current_streak, longest_streak, total_study_time, tasks_completed, exams_passed, permissions, balance, ai_credits, exam_credits, active_subscription_id, subscription_expires_at, last_login, two_factor_enabled, created_at, updated_at")
```

---

### 3. استدعاءات متكررة جداً لـ `/api/auth/me` ⚠️ (موجود بالفعل)

**المشكلة:** السجلات تظهر استدعاء `/api/auth/me` بمعدل 5-10 مرات في الثانية لنفس المستخدم. هذا يسبب:
- ضغط كبير على قاعدة البيانات
- استهلاك موارد الـ connection pool

**الحل الحالي:** يوجد cache L1 (in-process) مع TTL = 5 دقائق. لكن يبدو أن الـ cache لا يعمل بشكل صحيح لأن الاستعلامات لا تزال تصل إلى قاعدة البيانات.

**التوصية:** التحقق من سبب عدم فعالية الـ cache:
1. هل يتم مسح الـ cache بشكل متكرر؟
2. هل هناك عدة instances من التطبيق (كل instance له cache منفصل)؟
3. إضافة cache L2 (Redis) للـ `/api/auth/me`

---

### 4. زمن استجابة Redis عالي ⚠️ (تحتاج مراجعة)

**المشكلة:** السجلات تظهر:
```
[Stats] Redis ping took 133.9764ms
[Stats] DB ping took 64.8728ms
```

زمن ping لـ Redis (133ms) غير طبيعي ويشير إلى مشكلة في الاتصال بـ Redis.

**الأسباب المحتملة:**
1. Redis يعمل على remote server بزمن انتقال عالي
2. مشكلة في DNS resolution
3. Redis server تحت ضغط

**التوصية:**
1. التحقق من موقع Redis server (يجب أن يكون في نفس المنطقة)
2. استخدام Redis connection pooling
3. مراقبة Redis server load

---

### 5. استعلامات بطيئة أخرى ⚠️ (تحتاج مراجعة)

| المسار | الزمن | المشكلة المحتملة |
|--------|-------|-------------------|
| `GET /api/admin/dashboard?time=today` | 1.47s | استعلامات معقدة متعددة |
| `GET /api/admin/users?limit=1000` | 852ms | جلب 1000 مستخدم بدون pagination فعال |
| `GET /api/gamification/leaderboard?limit=5` | 678ms | استعلام leaderboard غير محسّن |
| `GET /api/activities/recent?limit=10` | 637ms | استعلام activities غير محسّن |
| `GET /api/notifications?limit=20&offset=0` | 608ms | استعلام notifications غير محسّن |
| `POST /api/ai/chat` | 16.76s | استدعاء AI طويل (متوقع) |
| `POST /api/upload/presign` | 811ms | اتصال بـ S3 بطيء |

---

### 6. مسارات 404 متكررة ⚠️ (تحتاج مراجعة)

المسارات التالية ترجع 404 بشكل متكرر:
- `GET /api/courses/physics-1` - مسار خاطئ (يجب أن يكون `/api/courses/slug/physics-1`)
- `GET /api/courses/math-2` - نفس المشكلة
- `GET /api/recommendations/courses?page=1` - مسار غير موجود
- `GET /api/subjects` - يرجع 401 (غير مصرح)

**التوصية:** إما إضافة هذه المسارات أو إزالة الطلبات من الـ frontend.

---

## ملخص الإصلاحات

| # | المشكلة | الحالة | الأولوية |
|---|---------|--------|----------|
| 1 | خطأ عمود `aiCredits` | ✅ تم الإصلاح | عالية |
| 2 | استعلام `SELECT *` في `/api/auth/me` | ✅ تم الإصلاح | عالية |
| 3 | استدعاءات `/api/auth/me` المتكررة | ⚠️ يحتاج مراجعة | متوسطة |
| 4 | زمن Redis عالي | ⚠️ يحتاج مراجعة | عالية |
| 5 | استعلامات بطيئة أخرى | ⚠️ يحتاج مراجعة | متوسطة |
| 6 | مسارات 404 | ⚠️ يحتاج مراجعة | منخفضة |