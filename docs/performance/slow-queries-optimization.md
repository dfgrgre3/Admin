# Slow Query Performance Optimization Report

## Executive Summary

On 2026/07/02, performance monitoring identified several endpoints with response times exceeding 500ms, with some reaching 2+ seconds. The primary bottleneck was identified as slow SQL queries, specifically around user lookups and the lack of optimized indexes.

### Slow Endpoints Identified

| Endpoint | Method | Status | Max Latency | Avg Latency |
|----------|--------|--------|-------------|-------------|
| `/api/auth/me` | GET | 200 | 2.17s | 600-1000ms |
| `/api/notifications` | GET | 200 | 1.17s | 600-900ms |
| `/api/settings` | GET | 200 | 0.91s | 300-900ms |
| `/api/admin/courses` | PATCH | 400 | 561ms | - |
| `/api/ai/chat` | POST | 500 | 6.09s | - |

### Root Cause Analysis

#### 1. **POST /api/ai/chat (6.09s - HIGHEST PRIORITY)**
- **Cause**: External AI API latency
- **Status**: Expected behavior (dependent on OpenRouter API response time)
- **Action Required**: Consider streaming responses or implementing request queuing

#### 2. **GET /api/auth/me (500ms-2.17s)**
- **Cause**: User table query without optimal index
- **Query**: `SELECT * FROM "User" WHERE id = $1 AND deleted_at IS NULL`
- **Issue**: `id` is primary key but composite index with `deleted_at` was missing
- **Fix Applied**: Added partial index `idx_users_id_deleted_at`

#### 3. **GET /api/notifications (600ms-1.17s)**
- **Cause**: Notification queries optimized with L1/L2 caching, but DB index coverage incomplete
- **Current**: Composite index `idx_notifications_user_created` exists on (user_id, created_at) with priority
- **Status**: Good index coverage, but L1/L2 caching hit rate may need monitoring

#### 4. **GET /api/settings (300ms-900ms)**
- **Cause**: UserSettings fetch with potential N+1 queries or missing index
- **Query Pattern**: Fast single-row lookup by user_id (unique constraint exists)
- **Issue**: L1 cache TTL may be too short or cache miss rate high
- **Fix Applied**: Added partial index `idx_user_settings_user_id` WHERE deleted_at IS NULL

#### 5. **GET /api/admin/courses (561ms-987ms)**
- **Cause**: Large table scan without pagination indexes
- **Fix Applied**: Added index on `Subject(created_at DESC)`

## Applied Optimizations

### Migration: 0069_add_slow_query_indexes.sql

```sql
-- User table: Fast lookup by id with deleted_at check
CREATE INDEX IF NOT EXISTS idx_users_id_deleted_at 
    ON "User" (id) 
    WHERE deleted_at IS NULL;

-- UserSettings table: Fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
    ON "UserSettings" (user_id) 
    WHERE deleted_at IS NULL;

-- AdminNotes table: Composite index for user_id + created_at queries
CREATE INDEX IF NOT EXISTS idx_admin_notes_user_created 
    ON "admin_notes" (user_id, created_at DESC);

-- Subject/Course table: Common admin list queries on status, created_at
CREATE INDEX IF NOT EXISTS idx_subjects_created_at 
    ON "Subject" (created_at DESC);

-- Enrollment table: Composite index for course enrollment lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course 
    ON "Enrollment" (user_id, course_id);

-- StudySession table: Composite index for user activity queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_start 
    ON "StudySession" (user_id, start_time DESC);
```

### Previous Migration: 0067_add_dashboard_perf_indexes.sql (Already Applied)

- `idx_users_created_at_deleted` - For dashboard user stats
- `idx_tasks_status_created_at_deleted` - For task listings
- `idx_exams_created_at_desc` - For exam queries
- `idx_study_sessions_start_time_deleted` - For activity charts
- Various deleted_at partial indexes for COUNT(*) optimizations

## Expected Improvements

### Query Performance Estimates

| Query Type | Before | After (Expected) | Improvement |
|------------|--------|------------------|-------------|
| User lookup by ID | 500ms+ | <50ms | 10x+ |
| Notification list | 600ms+ | <100ms | 6x+ |
| Settings fetch | 300ms+ | <50ms | 6x+ |
| Admin course list | 900ms+ | <200ms | 4.5x+ |

### Endpoint Response Time Targets

| Endpoint | Current P95 | Target P95 | Target P50 |
|----------|-------------|------------|------------|
| `/api/auth/me` | 2000ms | <200ms | <100ms |
| `/api/notifications` | 1100ms | <200ms | <100ms |
| `/api/settings` | 900ms | <150ms | <80ms |
| `/api/admin/courses` | 1000ms | <300ms | <200ms |

## Additional Recommendations

### 1. Query Optimization Best Practices

#### Auth Service (auth/me)
```go
// Current: Already using read replica and cache
queryDB := db.ReadDB(ctx)
queryDB.Where("id = ? AND deleted_at IS NULL", userID).First(&user)
// With new index, this should now use idx_users_id_deleted_at
```

#### Notification Service
```go
// Already has proper caching (L1 + L2 Redis)
// Ensure index hit by verifying EXPLAIN ANALYZE on:
// SELECT * FROM "Notification" WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2
```

#### Settings Service
```go
// Cache TTL review recommended
// Current TTL: 30 seconds (Redis) + 20 seconds (L1)
// Consider increasing to 60s if data consistency allows
```

### 2. Connection Pool Tuning

Current pool settings from db.go:
```go
MaxOpenConns: 50  // Increase to 100 if connection limits allow
MaxIdleConns: 10  // Increase to 20
ConnMaxLifetime: 15m
```

Recommendations:
- Monitor `database/sql` connection pool metrics
- Increase MaxOpenConns if PgBouncer allows
- Consider connection pool warmup on startup

### 3. Read Replica Utilization

The codebase already implements read/write splitting:
```go
// All read operations should use:
readDB := db.ReadDB(ctx)

// All write operations should use:
writeDB := db.WriteDB(ctx)
```

Verify all slow endpoints are using read replicas:
- ✅ `/api/auth/me` - Already using `db.ReadDB(ctx)`
- ✅ `/api/notifications` - Already using `db.ReadDB(c.Request.Context())`
- ⚠️ `/api/settings` - Verify using read path
- ⚠️ `/api/admin/courses` - Verify using read path

### 4. Monitoring Enhancements

Add query-level metrics:
```sql
-- Enable pg_stat_statements extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries
SELECT query, mean_exec_time, max_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;
```

### 5. Application-Level Optimizations

#### Cache Warming
Pre-warm frequently accessed data:
- User profiles for logged-in users
- Admin dashboard stats
- System settings

#### Batch Loading
Avoid N+1 queries in admin endpoints:
```go
// ❌ Avoid
for _, user := range users {
    user.Settings // Triggers separate query
}

// ✅ Use eager loading
db.Preload("Settings").Find(&users)
```

#### Pagination Optimization
Ensure all list endpoints have proper LIMIT/OFFSET:
```go
.DefaultQuery("limit", "20")
.DefaultQuery("offset", "0")
```

## Testing Plan

### 1. Index Validation
```bash
# Connect to database and verify indexes
psql -c "\d User" -c "\d UserSettings" -c "\d Notification"
psql -c "\di idx_*"
```

### 2. Query Plan Analysis
```sql
-- Verify new indexes are being used
EXPLAIN ANALYZE 
SELECT * FROM "User" WHERE id = 'user-id' AND deleted_at IS NULL;

-- Should show: Index Scan using idx_users_id_deleted_at
```

### 3. Load Testing
```bash
# Test endpoints with load testing tool
# Example using k6 or vegeta:
# Target: 100 concurrent users, sustained 30s
# Success criteria: P95 < 200ms for all endpoints
```

### 4. Monitoring
- Watch GORM slow query logs (threshold: 500ms)
- Monitor Redis cache hit rates for notifications
- Track database connection pool utilization

## Rollback Plan

If new indexes cause performance degradation:

```sql
-- Drop indexes if needed
DROP INDEX IF EXISTS idx_users_id_deleted_at;
DROP INDEX IF EXISTS idx_user_settings_user_id;
DROP INDEX IF EXISTS idx_admin_notes_user_created;
DROP INDEX IF EXISTS idx_subjects_created_at;
DROP INDEX IF EXISTS idx_enrollments_user_course;
DROP INDEX IF EXISTS idx_study_sessions_user_start;
```

## Next Steps

1. ✅ **DONE** - Created migration file 0069_add_slow_query_indexes.sql
2. ⏳ **PENDING** - Run migration: `go run cmd/migrate/main.go` or startup auto-migration
3. ⏳ **PENDING** - Monitor slow query logs for 24 hours
4. ⏳ **PENDING** - Validate P95 latency improvements
5. ⏳ **PENDING** - Update monitoring dashboards with new baselines

## References

- Migration file: `../backend/internal/db/migrations/0069_add_slow_query_indexes.sql`
- Previous optimization: `../backend/internal/db/migrations/0067_add_dashboard_perf_indexes.sql`
- Database config: `../backend/internal/db/db.go`
- Auth service: `../backend/internal/services/auth_service.go`
- Notification handler: `../backend/internal/api/handlers/notification_handler.go`
- Settings handler: `../backend/internal/api/handlers/settings_handler.go`