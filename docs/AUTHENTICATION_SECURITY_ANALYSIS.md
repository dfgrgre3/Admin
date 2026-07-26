# تحليل نظام المصادقة والأمان - لوحة التحكم الإدارية

## ملخص تنفيذي

تم تحليل نظام المصادقة والأمان في لوحة التحكم الإدارية للمنصة التعليمية. النظام يمتلك بنية أساسية قوية ومتكاملة مع تغطية واسعة للمتطلبات الأمنية.

---

## 1. حالة التنفيذ الحالية

### ✅ الميزات المُنفّذة بالكامل

#### 1.1 المصادقة الأساسية
- **تسجيل الدخول**: نظام مصادقة كامل مع دعم البريد الإلكتروني وكلمة المرور
- **التحقق الثنائي 2FA**: 
  - دعم TOTP و SMS
  - صفحة إدارة MFA كاملة (`/admin/mfa`)
  - إعادة تعيين MFA للمستخدمين
  - تتبع استخدام الأكواد الاحتياطية
- **استعادة كلمة المرور**: آلية كاملة مع روابط إعادة التعيين
- **التحقق من البريد الإلكتروني**: نظام تحقق مع إعادة إرسال الرموز
- **الروابط السحرية (Magic Links)**: دعم تسجيل الدخول بدون كلمة مرور

#### 1.2 إدارة الجلسات
- **جلسات المستخدمين**: صفحة مراقبة كاملة (`/admin/user-sessions`)
  - عرض جميع الجلسات النشطة
  - إنهاء الجلسات عن بعد
  - تتبع الأجهزة والمواقع
  - مراقبة آخر نشاط

#### 1.3 المراقبة الأمنية
- **سجلات الأمان** (`/admin/security-logs`):
  - تسجيل جميع الأحداث الأمنية
  - تصنيف الحالات: نجاح/فشل/محظور
  - حساب درجة المخاطر
  - تصدير CSV

- **محاولات تسجيل الدخول** (`/admin/login-attempts`):
  - تتبع جميع المحاولات
  - كشف المحاولات المشبوهة
  - تسجيل عناوين IP والمواقع
  - أسباب الفشل

#### 1.4 إدارة الأدوار والصلاحيات (RBAC)
- **نظام صلاحيات متقدم** (`src/lib/permissions.ts`):
  - 100+ صلاحية محددة بدقة
  - أدوار نظام: SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT, TEACHER, STUDENT
  - أدوار مخصصة قابلة للإنشاء والحذف
  - صلاحيات على مستوى الحقول (Field-Level Permissions)
  - دعم ABAC عبر `admin:byass`

- **صلاحيات مفصلة حسب الوحدة**:
  - إدارة المستخدمين (20+ صلاحية)
  - إدارة المحتوى (مواد، كتب، موارد، اختبارات)
  - إدارة مالية وتجارية
  - إدارة عمليات وتشغيل

#### 1.5 إدارة المستخدمين
- **دعوات المسؤولين**: نظام دعوات كامل مع API
  - `/api/admin/admin-invitations/send`
  - تتبع حالة الدعوات
  - صلاحية `USERS_SEND_INVITE`

- **حظر المستخدمين**:
  - حظر مؤقت أو دائم
  - مع أسباب وتواريخ انتهاء
  - إشعار المستخدم
  - إخفاء المحتوى

#### 1.6 الحماية من الهجمات
- **Rate Limiting**:
  - موجود في الاختبارات (`api-endpoints.test.ts`)
  - إعدادات قابلة للتكوين في الإعدادات
  - حدود لكل دقيقة وساعة
  - هيدرات `X-RateLimit-*`

- **HSTS**: مفعّل افتراضياً في الإعدادات

#### 1.7 سجلات التدقيق
- **سجل النشاطات** (`/admin/activity-log`):
  - تسجيل جميع إجراءات المستخدمين
  - تتبع الموارد والعمليات
  - إحصائيات يومية وأسبوعية

- **سجلات النظام** (`/admin/system-logs`):
  - تسجيل أحداث النظام
  - مستويات: INFO, WARN, ERROR, DEBUG

---

### ⚠️ الميزات المُنفّذة جزئياً أو المفقودة

#### 2.1 ميزات مفقودة تماماً

| الميزة | الحالة | الأولوية |
|--------|--------|----------|
| **Captcha / reCAPTCHA / hCaptcha** | ❌ غير موجود | عالية |
| **Single Sign-On (SSO)** | ❌ غير موجود | متوسطة |
| **SAML Integration** | ❌ غير موجود | متوسطة |
| **OAuth Providers** (Google/Microsoft) | ❌ غير موجود | متوسطة |
| **Admin Invitations Management UI** | ⚠️ API موجود، UI مفقود | عالية |
| **User Impersonation** | ⚠️ صلاحية موجودة، UI مفقود | متوسطة |
| **Advanced Rate Limiting UI** | ⚠️ إعدادات موجودة، واجهة مفقودة | متوسطة |

#### 2.2 ميزات تحتاج تحسين

| الميزة | الحالة | التحسين المطلوب |
|--------|--------|-----------------|
| **Risk Score Calculation** | ⚠️ موجود لكن ثابت (0) | تنفيذ خوارزمية حساب حقيقية |
| **Location Detection** | ⚠️ موجود لكن بسيط | تكامل مع خدمة تحديد موقع حقيقية |
| **Session Management** | ✅ جيد | إضافة توقيت انتهاء تلقائي |
| **Audit Log Retention** | ⚠️ غير واضح | إضافة سياسة احتفاظ وتنظيف |

---

## 2. تحليل البنية التقنية

### 2.1 الواجهة الأمامية (Next.js)

#### الملفات الرئيسية:
```
src/
├── contexts/
│   └── auth-context.tsx          # إدارة حالة المصادقة
├── lib/
│   ├── auth/
│   │   └── auth-store.ts         # Zustand store للمصادقة
│   ├── permissions.ts            # نظام الصلاحيات الكامل
│   └── api/
│       └── admin-api.ts          # wrapper لـ API الإداري
├── app/(admin)/admin/
│   ├── mfa/page.tsx              # إدارة 2FA
│   ├── security-logs/page.tsx    # سجلات الأمان
│   ├── login-attempts/page.tsx   # محاولات الدخول
│   ├── user-sessions/page.tsx    # جلسات المستخدمين
│   ├── roles/page.tsx            # إدارة الأدوار
│   └── user-groups/page.tsx      # مجموعات المستخدمين
└── components/
    └── auth/
        └── PermissionGuard.tsx   # حماية الصفحات
```

#### نقاط القوة:
- ✅ استخدام Context API + Zustand لإدارة الحالة
- ✅ فصل واضح للمسؤوليات
- ✅ TypeScript كامل مع أنواع قوية
- ✅ دعم RTL للعربية
- ✅ تصميم متجاوب

### 2.2 الخادم الخلفي (Go/Gin)

#### الملفات الرئيسية:
```
backend/internal/
├── api/handlers/
│   └── admin_system_handlers.go  # معالجات الأمان والإدارة
├── models/
│   └── admin_system_models.go    # نماذج البيانات
├── middleware/
│   └── auth.go                   # مصادقة و صلاحيات
└── router/
    └── admin_routes.go           # توجيهات API
```

#### النماذج المُعرّفة:
```go
// أمان
- SecurityLog        // سجلات الأمان
- LoginAttempt       // محاولات الدخول
- UserSession        // جلسات المستخدمين
- MFA               // التحقق الثنائي

// إدارة
- Role              // الأدوار
- UserGroup         // مجموعات المستخدمين
- InstructorPayout  // دفعات المدربين
- ScheduledTask     // المهام المجدولة
- QueueJob          // وظائف الطابور
- CacheEntry        // التخزين المؤقت
- EmailTemplate     // قوالب البريد
- FeatureFlag       // مفاتيح الميزات
- APIKey            // مفاتيح API
- Webhook           // الويبهوك
- SystemLog         // سجلات النظام
- ActivityLog       // سجل النشاطات
```

---

## 3. تحليل الصلاحيات (Permissions Analysis)

### 3.1 هيكل الصلاحيات

```typescript
// التصنيفات الرئيسية:
1. Global/Dashboard (3 صلاحيات)
2. User Management (30+ صلاحية مفصلة)
3. Content Management (15+ صلاحية)
4. Financial/Commercial (10+ صلاحية)
5. System/Operations (20+ صلاحية)
6. Security/Audit (5 صلاحيات)
```

### 3.2 صلاحيات الأدوار الافتراضية

| الدور | عدد الصلاحيات | الوصف |
|-------|---------------|-------|
| SUPER_ADMIN | 1 (bypass) | صلاحيات كاملة غير مقيدة |
| ADMIN | 80+ صلاحية | صلاحيات إدارية شاملة |
| MODERATOR | 18 صلاحية | إشراف ومتابعة |
| SUPPORT | 5 صلاحيات | دعم فني محدود |
| TEACHER | 12 صلاحية | إدارة محتواه فقط |
| STUDENT | 0 | لا صلاحيات إدارية |

### 3.3 نظام Field-Level Permissions

```typescript
// مجموعات الحقول الحساسة:
- financial: 17 حقل (أرصدة، مدفوعات، فواتير)
- grades: 16 حقل (درجات، مستويات، نقاط)
- contact: 10 حقول (بريد، هاتف، عنوان)
- auth_secrets: 9 حقول (كلمات مرور، أسرار 2FA)
- behavioral: 0 (فارغ حالياً)

// صلاحية الوصول حسب الدور:
ADMIN/SUPER_ADMIN: جميع الحقول
MODERATOR: grades, contact, behavioral
SUPPORT: contact, behavioral
TEACHER: grades, contact, behavioral
```

---

## 4. نقاط القوة

### 4.1 الأمان
- ✅ نظام مصادقة متعدد العوامل (2FA)
- ✅ صلاحيات دقيقة جداً (Granular RBAC)
- ✅ سجلات تدقيق شاملة
- ✅ مراقبة الجلسات النشطة
- ✅ حماية من المحاولات المتكررة (Rate Limiting)
- ✅ HSTS مفعّل
- ✅ Field-level permissions

### 4.2 البنية التقنية
- ✅ فصل واضح بين Frontend و Backend
- ✅ أنواع TypeScript قوية
- ✅ تصميم قابل للتوسع
- ✅ API موحد ومنظم
- ✅ استخدام Zustand لإدارة الحالة

### 4.3 تجربة المستخدم
- ✅ واجهة عربية كاملة (RTL)
- ✅ تصميم زجاجي (Glassmorphism)
- ✅ جداول بيانات تفاعلية
- ✅ بحث وتصفية وترقيم
- ✅ تصدير CSV
- ✅ إحصائيات مرئية

---

## 5. الفجوات الأمنية والتوصيات

### 5.1 فجوات عالية الأولوية

#### 🔴 Captcha Integration
**المشكلة**: لا يوجد حماية من البوتات في نموذج تسجيل الدخول
**التوصية**:
```typescript
// إضافة reCAPTCHA v3 أو hCaptcha
- إضافة middleware للتحقق منCaptcha
- تكامل مع Google reCAPTCHA أو hCaptcha
- إضافة إعدادات في لوحة التحكم
```

#### 🔴 Admin Invitations UI
**المشكلة**: API موجود لكن لا توجد واجهة لإدارة الدعوات
**التوصية**:
```typescript
// إنشاء صفحة /admin/invitations
- عرض جميع الدعوات المرسلة
- تتبع حالة الدعوات (معلقة/مقبولة/منتهية)
- إعادة إرسال/إلغاء الدعوات
- إحصائيات الدعوات
```

#### 🟡 User Impersonation
**المشكلة**: صلاحية `USERS_IMPERSONATE` موجودة لكن لا توجد واجهة
**التوصية**:
```typescript
// إضافة ميزة انتحال الهوية للمسؤولين
- زر "تصفح كـ" في صفحة المستخدمين
- تسجيل في سجل التدقيق
- تحذير واضح للمسؤول
- إنهاء تلقائي بعد فترة
```

### 5.2 فجوات متوسطة الأولوية

#### 🟡 SSO Integration
**التوصية**:
```go
// Backend: إضافة معالجات OAuth2
- Google OAuth2
- Microsoft Azure AD
- SAML 2.0
- GitHub OAuth

// Frontend: إضافة خيارات تسجيل الدخول
- أزرار "تسجيل الدخول بـ Google/Microsoft"
- إعدادات SSO في لوحة التحكم
```

#### 🟡 Advanced Risk Scoring
**المشكلة**: Risk Score ثابت عند 0
**التوصية**:
```go
// تنفيذ خوارزمية حساب المخاطر
- تحليل نمط تسجيل الدخول
- كشف عناوين IP مشبوهة
- تتبع الأجهزة الجديدة
- حساب بناءً على:
  * الموقع الجغرافي
  * نوع الجهاز
  * وقت الدخول
  * محاولات سابقة
```

#### 🟡 Location Detection
**التوصية**:
```go
// تكامل مع خدمة تحديد الموقع
- MaxMind GeoIP2
- IPinfo.io
- ip-api.com
- تخزين الموقع في SecurityLog
```

### 5.3 فجوات منخفضة الأولوية

#### 🟢 Audit Log Retention Policy
**التوصية**:
```sql
-- إضافة تنظيف تلقائي للسجلات القديمة
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs WHERE created_at < NOW() - INTERVAL '1 year';
  DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '2 years';
  DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- جدولة المهمة
SELECT cron.schedule('0 2 * * 0', 'SELECT cleanup_old_logs()');
```

---

## 6. توصيات التحسين

### 6.1 أمني
1. **إضافة Captcha** لحماية نماذج تسجيل الدخول
2. **تنفيذ SSO** للمؤسسات الكبيرة
3. **تحسين Risk Scoring** بخوارزمية ذكية
4. **إضافة IP Whitelisting** للمسؤولين
5. **تشفير إضافي** للحقول الحساسة في قاعدة البيانات
6. **تسجيل جميع عمليات البحث** في سجل التدقيق

### 6.2 تقني

#### 1. إضافة WebSocket للتحديثات الفورية للأحداث الأمنية

**الهدف**: تحديث لوحات الأمان في الوقت الفعلي دون الحاجة لتحديث الصفحة

**التنفيذ المطلوب**:

```go
// backend/internal/websocket/hub.go
package websocket

import (
    "encoding/json"
    "log"
    "sync"
    "time"
    "github.com/gorilla/websocket"
)

type SecurityEvent struct {
    Type      string      `json:"type"`      // "security_log", "login_attempt", "user_session"
    Severity  string      `json:"severity"`  // "critical", "warning", "info"
    Data      interface{} `json:"data"`
    Timestamp time.Time   `json:"timestamp"`
}

type Hub struct {
    clients    map[*websocket.Conn]bool
    broadcast  chan SecurityEvent
    register   chan *websocket.Conn
    unregister chan *websocket.Conn
    mu         sync.RWMutex
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[*websocket.Conn]bool),
        broadcast:  make(chan SecurityEvent, 256),
        register:   make(chan *websocket.Conn),
        unregister: make(chan *websocket.Conn),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client] = true
            h.mu.Unlock()
            
        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                client.Close()
            }
            h.mu.Unlock()
            
        case event := <-h.broadcast:
            h.mu.RLock()
            for client := range h.clients {
                client.WriteJSON(event)
            }
            h.mu.RUnlock()
        }
    }
}

// إرسال حدث أمني لجميع المشتركين
func (h *Hub) BroadcastSecurityEvent(eventType string, severity string, data interface{}) {
    event := SecurityEvent{
        Type:      eventType,
        Severity:  severity,
        Data:      data,
        Timestamp: time.Now(),
    }
    select {
    case h.broadcast <- event:
    default:
        log.Printf("WebSocket broadcast buffer full, dropping event")
    }
}
```

```go
// backend/internal/events/security_events.go
package events

import "thanawy-backend/internal/websocket"

var SecurityHub *websocket.Hub

func InitSecurityEvents() {
    SecurityHub = websocket.NewHub()
    go SecurityHub.Run()
}

// استدعاء عند حدوث حدث أمني
func OnSecurityLogCreated(log models.SecurityLog) {
    severity := "info"
    if log.EventType == models.SecurityEventLoginFailed {
        severity = "warning"
    }
    if log.EventType == models.SecurityEvent2FAFailed {
        severity = "critical"
    }
    
    SecurityHub.BroadcastSecurityEvent("security_log", severity, log)
}

func OnLoginAttemptCreated(attempt models.LoginAttempt) {
    severity := "info"
    if attempt.Status == "FAILED" {
        severity = "warning"
    }
    if attempt.Status == "BLOCKED" {
        severity = "critical"
    }
    
    SecurityHub.BroadcastSecurityEvent("login_attempt", severity, attempt)
}
```

```typescript
// src/hooks/use-security-websocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface SecurityWebSocketMessage {
  type: 'security_log' | 'login_attempt' | 'user_session';
  severity: 'critical' | 'warning' | 'info';
  data: any;
  timestamp: string;
}

export function useSecurityWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/security?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Security WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message: SecurityWebSocketMessage = JSON.parse(event.data);
      
      // إظهار تنبيه للأحداث الحرجة
      if (message.severity === 'critical') {
        toast({
          title: 'تنبيه أمني حرج',
          description: `${message.type}: حدث أمني يتطلب انتباهك`,
          variant: 'destructive',
        });
      }

      // تحديث البيانات في الخلفية
      if (message.type === 'security_log') {
        queryClient.invalidateQueries({ queryKey: ['admin', 'security-logs'] });
      } else if (message.type === 'login_attempt') {
        queryClient.invalidateQueries({ queryKey: ['admin', 'login-attempts'] });
      } else if (message.type === 'user_session') {
        queryClient.invalidateQueries({ queryKey: ['admin', 'user-sessions'] });
      }
    };

    ws.onclose = () => {
      console.log('Security WebSocket disconnected, reconnecting...');
      reconnectTimeoutRef.current = setTimeout(connect, Math.min(1000 * Math.pow(2, Date.now() / 1000), 30000));
    };

    ws.onerror = (error) => {
      console.error('Security WebSocket error:', error);
    };
  }, [toast]);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
}
```

```typescript
// src/app/(admin)/admin/security-logs/page.tsx
// إضافة في بداية المكون
import { useSecurityWebSocket } from '@/hooks/use-security-websocket';

export default function AdminSecurityLogsPage() {
  // إضافة هذا السطر
  useSecurityWebSocket();
  
  // ... باقي الكود
}
```

---

#### 2. تحسين الأداء بفهرسة قاعدة البيانات

**الهدف**: تسريع الاستعلامات الشائعة على الجداول الأمنية

**التنفيذ المطلوب**:

```sql
-- migrations/001_add_security_indexes.sql

-- فهرسة سجلات الأمان
CREATE INDEX CONCURRENTLY idx_security_logs_created_at 
ON "SecurityLog" (created_at DESC);

CREATE INDEX CONCURRENTLY idx_security_logs_user_id 
ON "SecurityLog" (user_id);

CREATE INDEX CONCURRENTLY idx_security_logs_event_type 
ON "SecurityLog" (event_type);

CREATE INDEX CONCURRENTLY idx_security_logs_created_at_event_type 
ON "SecurityLog" (created_at DESC, event_type);

-- فهرسة محاولات تسجيل الدخول
CREATE INDEX CONCURRENTLY idx_login_attempts_created_at 
ON "LoginAttempt" (created_at DESC);

CREATE INDEX CONCURRENTLY idx_login_attempts_ip_address 
ON "LoginAttempt" (ip_address);

CREATE INDEX CONCURRENTLY idx_login_attempts_status 
ON "LoginAttempt" (status);

CREATE INDEX CONCURRENTLY idx_login_attempts_risk_score 
ON "LoginAttempt" (risk_score DESC) 
WHERE risk_score > 50;

-- فهرسة جلسات المستخدمين
CREATE INDEX CONCURRENTLY idx_user_sessions_user_id 
ON "UserSession" (user_id);

CREATE INDEX CONCURRENTLY idx_user_sessions_is_active 
ON "UserSession" (is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_user_sessions_created_at 
ON "UserSession" (created_at DESC);

-- فهرسة سجل النشاطات
CREATE INDEX CONCURRENTLY idx_activity_logs_user_id 
ON "ActivityLog" (user_id);

CREATE INDEX CONCURRENTLY idx_activity_logs_created_at 
ON "ActivityLog" (created_at DESC);

CREATE INDEX CONCURRENTLY idx_activity_logs_action 
ON "ActivityLog" (action);

-- فهرسة MFA
CREATE INDEX CONCURRENTLY idx_mfa_user_id 
ON "MFA" (user_id);

CREATE INDEX CONCURRENTLY idx_mfa_is_enabled 
ON "MFA" (is_enabled);

-- فهرسة الأدوار
CREATE INDEX CONCURRENTLY idx_roles_is_system 
ON "Role" (is_system);

-- فهرسة مركبة للبحث
CREATE INDEX CONCURRENTLY idx_security_logs_search 
ON "SecurityLog" USING GIN (to_tsvector('arabic', COALESCE(ip_address, '') || ' ' || COALESCE(user_agent, '')));

-- تحليل الاستعلامات الشائعة
EXPLAIN ANALYZE SELECT * FROM "SecurityLog" 
WHERE created_at >= NOW() - INTERVAL '7 days' 
ORDER BY created_at DESC 
LIMIT 50;

-- تحديث إحصائيات PostgreSQL
ANALYZE "SecurityLog";
ANALYZE "LoginAttempt";
ANALYZE "UserSession";
ANALYZE "ActivityLog";
```

```go
// backend/internal/repository/security_repository.go
package repository

import (
    "time"
    "thanawy-backend/internal/models"
    "gorm.io/gorm"
)

type SecurityRepository struct {
    db *gorm.DB
}

// استعلام محسّن مع pagination
func (r *SecurityRepository) GetRecentLogs(limit int, offset int) ([]models.SecurityLog, error) {
    var logs []models.SecurityLog
    err := r.db.
        Select("id, user_id, event_type, ip_address, user_agent, status, risk_score, location, created_at").
        Where("created_at >= ?", time.Now().AddDate(0, 0, -30)).
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&logs).
        Error
    return logs, err
}

// استعلام مع filter محسّن
func (r *SecurityRepository) GetHighRiskLogs(threshold int) ([]models.SecurityLog, error) {
    var logs []models.SecurityLog
    err := r.db.
        Where("risk_score >= ? AND created_at >= ?", threshold, time.Now().AddDate(0, 0, -7)).
        Order("risk_score DESC").
        Limit(100).
        Find(&logs).
        Error
    return logs, err
}

// استخدام Prepared Statements للاستعلامات المتكررة
func (r *SecurityRepository) GetUserLoginHistory(userID string, limit int) ([]models.LoginAttempt, error) {
    var attempts []models.LoginAttempt
    stmt := r.db.
        Where("user_id = ?", userID).
        Order("created_at DESC").
        Limit(limit)
    
    // استخدام cache للنتائج
    cacheKey := fmt.Sprintf("user_login_history:%s:%d", userID, limit)
    if cached, err := cache.Get(cacheKey); err == nil {
        return cached.([]models.LoginAttempt), nil
    }
    
    if err := stmt.Find(&attempts).Error; err != nil {
        return nil, err
    }
    
    cache.Set(cacheKey, attempts, 5*time.Minute)
    return attempts, nil
}
```

---

#### 3. إضافة Cache للبيانات الأمنية المتكررة

**الهدف**: تقليل الحمل على قاعدة البيانات وتحسين سرعة الاستجابة

**التنفيذ المطلوب**:

```go
// backend/internal/cache/security_cache.go
package cache

import (
    "time"
    "thanawy-backend/internal/models"
    "github.com/patrickmn/go-cache"
)

type SecurityCache struct {
    cache *cache.Cache
}

func NewSecurityCache() *SecurityCache {
    // cache افتراضي: 5 دقائق TTL، تنظيف كل 10 دقائق
    c := cache.New(5*time.Minute, 10*time.Minute)
    return &SecurityCache{cache: c}
}

// cache لإحصائيات الأمان
func (sc *SecurityCache) GetSecurityStats() (*SecurityStats, error) {
    if cached, found := sc.cache.Get("security_stats"); found {
        return cached.(*SecurityStats), nil
    }
    
    // جلب من قاعدة البيانات
    stats, err := fetchSecurityStatsFromDB()
    if err != nil {
        return nil, err
    }
    
    sc.cache.Set("security_stats", stats, 1*time.Minute)
    return stats, nil
}

func (sc *SecurityCache) InvalidateSecurityStats() {
    sc.cache.Delete("security_stats")
}

// cache لقائمة المستخدمين مع MFA
func (sc *SecurityCache) GetMFAUsers(page int, limit int) ([]models.MFA, error) {
    key := fmt.Sprintf("mfa_users:%d:%d", page, limit)
    if cached, found := sc.cache.Get(key); found {
        return cached.([]models.MFA), nil
    }
    
    users, err := fetchMFAUsersFromDB(page, limit)
    if err != nil {
        return nil, err
    }
    
    sc.cache.Set(key, users, 2*time.Minute)
    return users, nil
}

func (sc *SecurityCache) InvalidateMFAUsers() {
    sc.cache.Delete("mfa_users:*")
}

// cache لصلاحيات المستخدمين
func (sc *SecurityCache) GetUserPermissions(userID string) ([]string, error) {
    key := fmt.Sprintf("user_permissions:%s", userID)
    if cached, found := sc.cache.Get(key); found {
        return cached.([]string), nil
    }
    
    perms, err := fetchUserPermissionsFromDB(userID)
    if err != nil {
        return nil, err
    }
    
    sc.cache.Set(key, perms, 10*time.Minute)
    return perms, nil
}

func (sc *SecurityCache) InvalidateUserPermissions(userID string) {
    key := fmt.Sprintf("user_permissions:%s", userID)
    sc.cache.Delete(key)
}

// cache للأدوار
func (sc *SecurityCache) GetAllRoles() ([]models.Role, error) {
    if cached, found := sc.cache.Get("all_roles"); found {
        return cached.([]models.Role), nil
    }
    
    roles, err := fetchAllRolesFromDB()
    if err != nil {
        return nil, err
    }
    
    sc.cache.Set("all_roles", roles, 30*time.Minute)
    return roles, nil
}

func (sc *SecurityCache) InvalidateAllRoles() {
    sc.cache.Delete("all_roles")
}
```

```go
// backend/internal/middleware/cache_middleware.go
package middleware

import (
    "thanawy-backend/internal/cache"
    "github.com/gin-gonic/gin"
)

// CacheMiddleware يضيف cache headers للبيانات الأمنية
func CacheMiddleware(securityCache *cache.SecurityCache) gin.HandlerFunc {
    return func(c *gin.Context) {
        // تطبيق cache على endpoints الأمنية
        if c.Request.URL.Path == "/api/admin/roles" && c.Request.Method == "GET" {
            // محاولة جلب من cache
            if roles, err := securityCache.GetAllRoles(); err == nil {
                c.JSON(200, gin.H{"roles": roles, "cached": true})
                c.Abort()
                return
            }
        }
        
        c.Next()
        
        // حفظ في cache بعد الاستجابة الناجحة
        if c.Writer.Status() == 200 && c.Request.URL.Path == "/api/admin/roles" {
            // حفظ في cache
        }
    }
}
```

```typescript
// src/lib/cache/security-cache.ts
// Frontend cache للبيانات الأمنية
export class SecurityCacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const securityCache = new SecurityCacheManager();

// استخدام في React Query
export const securityCacheKeys = {
  all: () => ['security'] as const,
  stats: () => [...securityCacheKeys.all(), 'stats'] as const,
  roles: () => [...securityCacheKeys.all(), 'roles'] as const,
  mfa: (page: number) => [...securityCacheKeys.all(), 'mfa', page] as const,
};
```

---

#### 4. تطبيق Circuit Breaker للخدمات الخارجية

**الهدف**: حماية النظام من فشل الخدمات الخارجية (Email, SMS, OAuth)

**التنفيذ المطلوب**:

```go
// backend/internal/circuitbreaker/circuit_breaker.go
package circuitbreaker

import (
    "errors"
    "sync"
    "time"
)

type State int

const (
    StateClosed State = iota      // عادي
    StateOpen                     // مفتوح (فشل)
    StateHalfOpen                 // نصف مفتوح (اختبار)
)

type CircuitBreaker struct {
    maxFailures     int
    resetTimeout    time.Duration
    failureCount    int
    lastFailureTime time.Time
    state           State
    mu              sync.RWMutex
}

func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        maxFailures:  maxFailures,
        resetTimeout: resetTimeout,
    }
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    cb.mu.RLock()
    state := cb.state
    cb.mu.RUnlock()

    if state == StateOpen {
        if time.Since(cb.lastFailureTime) > cb.resetTimeout {
            cb.mu.Lock()
            cb.state = StateHalfOpen
            cb.mu.Unlock()
        } else {
            return errors.New("circuit breaker is open")
        }
    }

    err := fn()
    
    cb.mu.Lock()
    defer cb.mu.Unlock()
    
    if err != nil {
        cb.failureCount++
        cb.lastFailureTime = time.Now()
        
        if cb.failureCount >= cb.maxFailures {
            cb.state = StateOpen
        }
    } else {
        if cb.state == StateHalfOpen {
            cb.state = StateClosed
        }
        cb.failureCount = 0
    }
    
    return err
}

// Circuit Breaker للخدمات المختلفة
var (
    EmailServiceCB    = NewCircuitBreaker(5, 30*time.Second)
    SMSServiceCB      = NewCircuitBreaker(5, 30*time.Second)
    OAuthServiceCB    = NewCircuitBreaker(3, 60*time.Second)
    PaymentServiceCB  = NewCircuitBreaker(3, 60*time.Second)
)
```

```go
// backend/internal/services/email_service.go
package services

import (
    "thanawy-backend/internal/circuitbreaker"
    "github.com/sendgrid/sendgrid-go"
)

type EmailService struct {
    client *sendgrid.Client
}

func (s *EmailService) SendEmail(to, subject, body string) error {
    return circuitbreaker.EmailServiceCB.Call(func() error {
        _, err := s.client.Send(s.buildMessage(to, subject, body))
        return err
    })
}

// معالجة حالة Circuit Breaker المفتوح
func (s *EmailService) SendEmailWithFallback(to, subject, body string) error {
    err := s.SendEmail(to, subject, body)
    if err != nil {
        if errors.Is(err, circuitbreaker.ErrCircuitOpen) {
            // حفظ في queue للإرسال لاحقاً
            go s.queueEmail(to, subject, body)
            return nil // لا نريد إيقاف العملية
        }
        return err
    }
    return nil
}
```

```go
// backend/internal/middleware/circuit_breaker.go
package middleware

import (
    "thanawy-backend/internal/circuitbreaker"
    "github.com/gin-gonic/gin"
    "net/http"
)

func CircuitBreakerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // تحديد الخدمة المطلوبة
        var cb *circuitbreaker.CircuitBreaker
        
        switch c.Request.URL.Path {
        case "/api/email/send":
            cb = circuitbreaker.EmailServiceCB
        case "/api/sms/send":
            cb = circuitbreaker.SMSServiceCB
        case "/api/oauth/*":
            cb = circuitbreaker.OAuthServiceCB
        case "/api/payment/*":
            cb = circuitbreaker.PaymentServiceCB
        default:
            c.Next()
            return
        }
        
        // تنفيذ مع Circuit Breaker
        err := cb.Call(func() error {
            c.Next()
            if c.Writer.Status() >= 500 {
                return errors.New("service error")
            }
            return nil
        })
        
        if err != nil {
            if errors.Is(err, circuitbreaker.ErrCircuitOpen) {
                c.JSON(http.StatusServiceUnavailable, gin.H{
                    "error": "Service temporarily unavailable",
                    "retry_after": 30,
                })
                c.Abort()
                return
            }
        }
    }
}
```

```go
// backend/internal/monitoring/circuit_breaker_metrics.go
package monitoring

import (
    "thanawy-backend/internal/circuitbreaker"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

var (
    circuitBreakerState = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "circuit_breaker_state",
            Help: "Current state of circuit breakers (0=closed, 1=open, 2=half-open)",
        },
        []string{"service"},
    )
    
    circuitBreakerFailures = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "circuit_breaker_failures_total",
            Help: "Total number of circuit breaker failures",
        },
        []string{"service"},
    )
)

func UpdateCircuitBreakerMetrics() {
    services := map[string]*circuitbreaker.CircuitBreaker{
        "email":    circuitbreaker.EmailServiceCB,
        "sms":      circuitbreaker.SMSServiceCB,
        "oauth":    circuitbreaker.OAuthServiceCB,
        "payment":  circuitbreaker.PaymentServiceCB,
    }
    
    for name, cb := range services {
        state := 0.0
        cbState := cb.GetState()
        if cbState == circuitbreaker.StateOpen {
            state = 1.0
        } else if cbState == circuitbreaker.StateHalfOpen {
            state = 2.0
        }
        
        circuitBreakerState.WithLabelValues(name).Set(state)
    }
}
```

```yaml
# docker-compose.yml - إضافة Prometheus
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

---

### 6.3 تجربة المستخدم

### 6.3 تجربة المستخدم
1. **لوحة معلومات أمنية** (Security Dashboard) مع رسوم بيانية
2. **تنبيهات فورية** للأحداث الأمنية الحرجة
3. **تقارير أمنية دورية** تلقائية
4. **دليل المستخدم** للأمان والصلاحيات

---

## 7. الخلاصة

### التقييم العام: ⭐⭐⭐⭐ (4/5)

**نقاط القوة**:
- بنية أمنية متينة ومتكاملة
- نظام صلاحيات متقدم جداً
- مراقبة وتسجيل شامل
- واجهات مستخدم احترافية

**الفجوات الرئيسية**:
- غياب Captcha
- عدم وجود SSO
- واجهة إدارة الدعوات مفقودة
- Risk Score غير مفعّل

**التوصية النهائية**:
النظام الحالي قوي جداً ويحتاج فقط لإضافة:
1. Captcha (أولوية عالية)
2. واجهة إدارة الدعوات (أولوية عالية)
3. SSO (أولوية متوسطة)
4. تحسين Risk Scoring (أولوية متوسطة)

مع هذه التحسينات، سيكون النظام جاهزاً للاستخدام الإنتاجي على نطاق واسع.

---

## 8. المراجع

### الملفات الرئيسية المُحلّلة:
- `src/contexts/auth-context.tsx`
- `src/lib/auth/auth-store.ts`
- `src/lib/permissions.ts`
- `src/app/(admin)/admin/mfa/page.tsx`
- `src/app/(admin)/admin/security-logs/page.tsx`
- `src/app/(admin)/admin/login-attempts/page.tsx`
- `src/app/(admin)/admin/user-sessions/page.tsx`
- `src/app/(admin)/admin/roles/page.tsx`
- `src/components/admin/layout/admin-sidebar.tsx`
- `../backend/internal/api/handlers/admin_system_handlers.go`
- `src/lib/api/admin-api.ts`

### الاختبارات:
- `src/__tests__/integration/api-endpoints.test.ts`
- `src/__tests__/integration/websocket.test.ts`

---

**تاريخ التحليل**: 2024-12-24
**الإصدار المُحلّل**: 1.0.0