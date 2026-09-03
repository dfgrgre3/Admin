-- ================= COMPREHENSIVE DB AUDIT =================
\echo === 1. SERVER INFO ===
SELECT version() AS pg_version,
       pg_postmaster_start_time() AS started_at,
       now() - pg_postmaster_start_time() AS uptime,
       pg_size_pretty(pg_database_size(current_database())) AS db_size,
       (SELECT count(*) FROM pg_stat_activity) AS connections,
       (SELECT setting FROM pg_settings WHERE name='max_connections') AS max_connections;

\echo === 2. TABLE INVENTORY (size + stats) ===
SELECT n.nspname AS sch, c.relname AS tbl, c.relkind,
       c.reltuples::bigint AS est_rows,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS total,
       pg_size_pretty(pg_relation_size(c.oid)) AS heap,
       pg_size_pretty(pg_indexes_size(c.oid)) AS idx
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE c.relkind IN ('r','p') AND n.nspname='public'
ORDER BY pg_total_relation_size(c.oid) DESC;

\echo === 3. VACUUM / DEAD TUPLES (bloat risk) ===
SELECT schemaname, relname, n_live_tup, n_dead_tup,
       round(n_dead_tup*100.0/GREATEST(n_live_tup+n_dead_tup,1),1) AS dead_pct,
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze, n_mod_since_analyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC NULLS LAST
LIMIT 25;

\echo === 4. CACHE HIT RATIO ===
SELECT sum(heap_blks_hit)::float/GREATEST(sum(heap_blks_hit)+sum(heap_blks_read),1)*100 AS cache_hit_pct
FROM pg_statio_user_tables;

\echo === 5. PARTITIONS (examresult etc) ===
SELECT c.relname AS partition, pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r'
  AND c.relname ~ '_p(2026|default)'
ORDER BY c.relname;

\echo === 6. PRISMA MIGRATIONS STATE ===
SELECT count(*) AS total_migrations,
       max(finished_at) AS last_finished
FROM _prisma_migrations;
SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC NULLS FIRST LIMIT 10;

\echo === 7. RAW schema_migrations (Go side) ===
SELECT count(*) AS n FROM schema_migrations;

\echo === 8. INDEX STATS ===
\echo --- unused indexes (idx_scan=0, >100KB) ---
SELECT n.nspname, i.relname AS index, pg_size_pretty(pg_relation_size(i.oid)) AS size
FROM pg_index x
JOIN pg_class i ON i.oid=x.indexrelid
JOIN pg_namespace n ON n.oid=i.relnamespace
LEFT JOIN pg_stat_user_indexes s ON s.indexrelid=i.oid
WHERE n.nspname='public' AND (s.idx_scan IS NULL OR s.idx_scan=0)
  AND pg_relation_size(i.oid) > 102400
ORDER BY pg_relation_size(i.oid) DESC
LIMIT 30;
\echo --- invalid indexes ---
SELECT n.nspname, i.relname FROM pg_index x JOIN pg_class i ON i.oid=x.indexrelid
JOIN pg_namespace n ON n.oid=i.relnamespace
WHERE NOT x.indisvalid;
\echo --- duplicate indexes (same table & columns) ---
SELECT t.relname AS tbl, x.indkey::text AS cols, count(*) AS dup_count,
       array_agg(i.relname ORDER BY i.relname) AS indexes
FROM pg_index x
JOIN pg_class i ON i.oid=x.indexrelid
JOIN pg_class t ON t.oid=x.indrelid
JOIN pg_namespace n ON n.oid=t.relnamespace
WHERE n.nspname='public'
GROUP BY t.relname, x.indkey, x.indclass
HAVING count(*) > 1
LIMIT 30;

\echo === 9. FK WITHOUT INDEX ON CHILD (full-scan risk) ===
SELECT c.conrelid::regclass AS child_table, c.conname AS fk_name, c.conkey
FROM pg_constraint c
JOIN pg_namespace n ON n.oid=c.connamespace
WHERE c.contype='f' AND n.nspname='public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid=c.conrelid AND (i.indkey::int2[] @> c.conkey::int2[])
      AND i.indisvalid
  )
LIMIT 40;

\echo === 10. FK / CONSTRAINT COUNTS ===
SELECT contype, count(*) FROM pg_constraint c
JOIN pg_namespace n ON n.oid=c.connamespace
WHERE n.nspname='public' GROUP BY contype;

\echo === 11. SEQUENCES NEAR EXHAUSTION ===
SELECT sequencename, last_value, max_value,
       round(100.0*last_value/max_value,2) AS pct_used
FROM pg_sequences WHERE last_value IS NOT NULL
ORDER BY 100.0*last_value/max_value DESC LIMIT 15;

\echo === 12. ENUM TYPES ===
SELECT t.typname, string_agg(e.enumlabel, ',') AS labels
FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
GROUP BY t.typname ORDER BY t.typname;

\echo === 13. MOST USED TABLES (seq scan vs idx scan) ===
SELECT relname, seq_scan, idx_scan, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC LIMIT 20;

\echo === 14. SLOW-ish STATS: tables by n_tup_hot_upd ratio ===
SELECT relname, n_tup_upd, n_tup_hot_upd,
       round(n_tup_hot_upd::float/GREATEST(n_tup_upd,1)*100,1) AS hot_pct
FROM pg_stat_user_tables WHERE n_tup_upd > 100
ORDER BY hot_pct ASC LIMIT 15;

\echo === 15. ROLES ===
SELECT rolname, rolsuper, rolcanlogin FROM pg_roles WHERE rolname NOT LIKE 'pg_%';
