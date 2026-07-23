# إصلاح الاستعلامات البطيئة - 2026-07-03

## المشاكل التي تم رصدها

```
[GIN] POST /api/auth/login | 200 | 1.731649s ⚠️
  → INSERT INTO "UserSession" (811ms) - auth_repo.go:31
  → INSERT INTO "SecurityLog" (528ms) - auth_service.go:732

[GIN] GET /api/auth/me | 200 | 547.6483ms ⚠️
[GIN] GET /api/settings | 200 | 498.8791ms
[GIN] GET /api/notifications?limit=20&offset=0 | 200 | 357.1899ms
```

## التحليل والتحسينات

### 1. POST /api/auth/login — 1.73s ⚠️

#### السبب الجذري: `UserSession.BeforeCreate` hook

كان الـ `BeforeCreate` hook في `session.go` يقوم باستعلامين إضافيين أثناء INSERT:
1. `COUNT` للجلسات النشطة (للتحقق من حد 5 جلسات)
2. `FIND` لاسترجاع أقدم الجلسات (إذا تجاوز الحد)

#### الإصلاح:
- **نقل منطق الحد من الجلسات** من `BeforeCreate` إلى `Login` في `auth_service.go` كعملية غير متزامنة (async goroutine)
- الـ `BeforeCreate` الآن يقوم فقط بتعيين UUID وحساب hash التوكن
- تم إضافة **فهرس مركب** `idx_user_session_active_oldest` لتسريع استعلامات COUNT + FIND

#### السبب الجذري: `logSecurityEvent` بدون `WriteDB`

كانت الدالة تستخدم `db.DB.Create(secLog)` بدون توجيه إلى مصدر الكتابة.

#### الإصلاح:
- تغيير `db.DB.Create(secLog)` → `db.WriteDB().Create(secLog)`

### 2. GET /api/auth/me — 547ms ⚠️

#### التحليل:
- الاستعلام يستخدم `ReadDB` بالفعل (موجود في الكود)
- تمت إضافة **L1 cache** (in-process) مع TTL = 5 دقائق
- الاستعلامات المتكررة من الـ frontend (كل ~60s) يتم خدمتها من الذاكرة

### 3. GET /api/settings — 498ms

#### السبب الجذري:
- كان يستخدم `db.DB` (write source) بدلاً من `ReadDB`
- TTL للـ L1 cache كان 5 دقائق فقط

#### الإصلاح:
- تغيير `db.DB` → `db.ReadDB()` للقراءات
- تغيير `db.DB` → `db.WriteDB()` للكتابات (createDefaultUserSettings)
- زيادة TTL من 5 دقائق → 15 دقيقة (الإعدادات نادراً ما تتغير)
- إضافة fallback: إذا فشلت القراءة من الـ replica، يحاول من الـ write source
- إضافة فهرس `idx_user_settings_user_id`

### 4. GET /api/notifications — 357ms

#### التحليل:
- الـ handler يستخدم بالفعل L1 cache + L2 Redis cache + ReadDB
- تم إضافة فهرس `idx_notifications_user_created` في الميجريشن 0076
- الأداء مقبول حالياً

## الملفات المعدلة

| الملف | التغيير |
|-------|---------|
| `internal/repository/auth_repo.go` | استخدام `WriteDB` بدلاً من `DB` لجميع عمليات الكتابة، استخدام `ReadDB` للقراءات |
| `internal/services/auth_service.go` | نقل منطق الحد من الجلسات إلى async goroutine، استخدام `WriteDB` في `logSecurityEvent` |
| `internal/models/session.go` | تبسيط `BeforeCreate` - إزالة استعلامات COUNT + FIND |
| `internal/api/handlers/settings_handler.go` | زيادة TTL، استخدام ReadDB، إضافة fallback |
| `internal/db/migrations/0077_fix_auth_perf_indexes.sql` | فهارس جديدة لـ UserSession, SecurityLog, UserSettings, LoginHistory |

## الفهارس الجديدة (ميجريشن 0077)

```sql
-- UserSession: لتسريع استعلامات الحد من الجلسات
CREATE INDEX idx_user_session_active_oldest ON "UserSession" (user_id, is_active, last_accessed ASC)
    WHERE is_active = true AND deleted_at IS NULL;

-- SecurityLog: لتسريع استعلامات الأمان
CREATE INDEX idx_security_log_event_created_desc ON "SecurityLog" (event_type, created_at DESC);
CREATE INDEX idx_security_log_user_created_desc ON "SecurityLog" (user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

-- UserSettings: لتسريع GET /api/settings
CREATE INDEX idx_user_settings_user_id ON "UserSettings" (user_id);

-- LoginHistory: لتسريع استعلامات سجل الدخول
CREATE INDEX idx_login_history_user_created ON "login_history" (user_id, created_at DESC);
```

## النتائج المتوقعة

| المسار | قبل | بعد (متوقع) |
|--------|-----|-------------|
| POST /api/auth/login | 1.73s | < 500ms |
| GET /api/auth/me | 547ms | < 50ms (من L1 cache) |
| GET /api/settings | 498ms | < 50ms (من L1 cache) |
| GET /api/notifications | 357ms | < 100ms |