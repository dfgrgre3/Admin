\echo === A. GENERAL ===
SELECT now() AS audit_time, version() AS version;
SELECT pg_size_pretty(pg_database_size('thanawy')) AS db_size;
SELECT name, setting FROM pg_settings WHERE name IN ('shared_buffers','work_mem','effective_cache_size','statement_timeout','log_min_duration_statement','idle_in_transaction_session_timeout','max_connections','autovacuum','wal_level','data_checksums','default_transaction_isolation','TimeZone') ORDER BY name;

\echo === B. TABLE INVENTORY ===
SELECT schemaname, count(*) AS tables FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema') GROUP BY 1 ORDER BY 2 DESC;
SELECT relkind, count(*) FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind IN ('r','p','v','m','S') GROUP BY 1;

\echo === C. TOP 30 TABLES BY SIZE ===
SELECT c.oid::regclass AS tbl, pg_size_pretty(pg_total_relation_size(c.oid)) AS total,
       pg_size_pretty(pg_relation_size(c.oid)) AS heap,
       pg_size_pretty(pg_indexes_size(c.oid)) AS idx,
       s.n_live_tup, s.n_dead_tup,
       ROUND(100.0*s.n_dead_tup/GREATEST(s.n_live_tup+s.n_dead_tup,1),1) AS dead_pct,
       s.last_autovacuum::date AS last_av, s.last_autoanalyze::date AS last_aa
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
LEFT JOIN pg_stat_all_tables s ON s.relid=c.oid
WHERE n.nspname='public' AND c.relkind IN ('r','p')
ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 30;

\echo === D. BLOAT / DEAD TUPLES HOTSPOTS ===
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_vacuum
FROM pg_stat_all_tables WHERE schemaname='public'
ORDER BY n_dead_tup DESC LIMIT 15;

\echo === E. NEVER VACUUMED / NEVER ANALYZED ===
SELECT s.relname, s.n_live_tup, s.last_autovacuum, s.last_autoanalyze
FROM pg_stat_all_tables s JOIN pg_class c ON c.oid=s.relid
WHERE s.schemaname='public'
AND s.last_autovacuum IS NULL AND s.last_vacuum IS NULL AND c.relkind='r'
ORDER BY s.n_live_tup DESC LIMIT 20;

\echo === F. INDEXES SUMMARY ===
SELECT count(*) AS total_indexes,
       count(*) FILTER (WHERE NOT indisvalid) AS invalid,
       count(*) FILTER (WHERE NOT indisready) AS not_ready
FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid
JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public';

\echo === F2. INVALID INDEXES ===
SELECT indexrelid::regclass AS invalid_index, indrelid::regclass AS tbl
FROM pg_index WHERE NOT indisvalid;

\echo === F3. DUPLICATE INDEXES ===
WITH idx AS (
  SELECT i.indrelid, i.indexrelid, i.indisunique, i.indpred, i.indnkeyatts,
         (SELECT string_agg(pg_get_indexdef(i.indexrelid, k+1, true), ',' ORDER BY k)
          FROM generate_series(0, i.indnkeyatts-1) k) AS cols
  FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid
  JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'
)
SELECT a.indrelid::regclass AS tbl, a.indexrelid::regclass AS idx_a, b.indexrelid::regclass AS idx_b
FROM idx a JOIN idx b ON a.indrelid=b.indrelid AND a.indexrelid<b.indexrelid
  AND a.cols=b.cols AND a.indisunique=b.indisunique
  AND COALESCE(a.indpred::text,'')=COALESCE(b.indpred::text,'')
  AND a.indnkeyatts=b.indnkeyatts LIMIT 50;

\echo === F4. LARGEST INDEXES ===
SELECT c.oid::regclass AS idx, c.relname, pg_size_pretty(pg_relation_size(c.oid)) AS size,
       s.idx_scan AS scans
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
JOIN pg_index i ON i.indexrelid=c.oid
LEFT JOIN pg_stat_all_indexes s ON s.indexrelid=c.oid
WHERE n.nspname='public' ORDER BY pg_relation_size(c.oid) DESC LIMIT 20;

\echo === F5. UNUSED INDEXES (0 scans >64KB) ===
SELECT s.relname AS tbl, s.indexrelname AS idx, pg_size_pretty(pg_relation_size(s.indexrelid)) AS size,
       s.idx_scan, i.indisunique AS is_unique, con.conname IS NOT NULL AS supports_constraint
FROM pg_stat_all_indexes s
JOIN pg_index i ON i.indexrelid=s.indexrelid
LEFT JOIN pg_constraint con ON con.conindid=s.indexrelid
WHERE s.schemaname='public' AND s.idx_scan=0 AND pg_relation_size(s.indexrelid)>65536
ORDER BY pg_relation_size(s.indexrelid) DESC LIMIT 30;

\echo === G. FK INTEGRITY ===
\echo G1. FKs WITHOUT supporting index on referencing table:
SELECT con.conrelid::regclass AS tbl, con.conname, pg_size_pretty(pg_relation_size(con.conrelid)) AS tbl_size
FROM pg_constraint con
WHERE con.contype='f' AND con.connamespace='public'::regnamespace
AND NOT EXISTS (
  SELECT 1 FROM pg_index i WHERE i.indrelid=con.conrelid
  AND i.indkey::int2[] @> con.conkey::int2[]
)
ORDER BY pg_relation_size(con.conrelid) DESC LIMIT 30;

\echo G2. FK delete/update actions:
SELECT count(*) AS total_fks,
 count(*) FILTER (WHERE confdeltype='a') AS no_action_on_delete,
 count(*) FILTER (WHERE confdeltype='c') AS cascade_on_delete,
 count(*) FILTER (WHERE confupdtype='a') AS no_action_on_update
FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace;

\echo G3. FKs with type mismatch:
SELECT con.conrelid::regclass AS from_tbl, con.conname,
       a.attname AS from_col, format_type(a.atttypid,a.atttypmod) AS from_type,
       rf.relname AS to_tbl, b.attname AS to_col, format_type(b.atttypid,b.atttypmod) AS to_type
FROM pg_constraint con
JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=con.conkey[1]
JOIN pg_class rf ON rf.oid=con.confrelid
JOIN pg_attribute b ON b.attrelid=con.confrelid AND b.attnum=con.confkey[1]
JOIN pg_type ta ON ta.oid=a.atttypid JOIN pg_type tb ON tb.oid=b.atttypid
WHERE con.contype='f' AND con.connamespace='public'::regnamespace
AND (a.atttypid<>b.atttypid OR a.atttypmod<>b.atttypmod)
AND NOT (ta.typcategory='I' AND tb.typcategory='I')
LIMIT 30;

\echo G4. FKs pointing to non-unique targets:
SELECT con.conrelid::regclass AS from_tbl, con.conname, con.confrelid::regclass AS to_tbl
FROM pg_constraint con
WHERE con.contype='f' AND con.connamespace='public'::regnamespace
AND NOT EXISTS (
  SELECT 1 FROM pg_constraint u
  WHERE u.conrelid=con.confrelid AND u.contype IN ('p','u')
  AND u.conkey @> con.confkey
) LIMIT 20;

\echo === H. PK COVERAGE ===
SELECT count(*) FILTER (WHERE c.relkind IN ('r','p')) AS tables,
       (SELECT count(*) FROM pg_constraint WHERE contype='p' AND connamespace='public'::regnamespace) AS pks,
       (SELECT count(*) FROM pg_class c2 JOIN pg_namespace n2 ON n2.oid=c2.relnamespace
         WHERE n2.nspname='public' AND c2.relkind IN ('r','p')
         AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype='p' AND conrelid=c2.oid)) AS tables_without_pk
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p');

\echo H2. Tables without PK:
SELECT c.oid::regclass AS tbl, pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p')
AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE contype='p' AND conrelid=c.oid)
ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 30;

\echo === I. PARTITIONED TABLES ===
SELECT c.oid::regclass AS parent, part.partstrat, pg_get_partkeydef(c.oid) AS key
FROM pg_class c JOIN pg_partitioned_table part ON part.partrelid=c.oid
WHERE c.relnamespace='public'::regnamespace;

\echo I2. ExamResult partitions:
SELECT inhrelid::regclass AS partition, pg_size_pretty(pg_relation_size(inhrelid)) AS size,
       pg_get_expr(c.relpartbound,c.oid) AS bounds
FROM pg_inherits inh JOIN pg_class c ON c.oid=inh.inhrelid
WHERE inhparent='"ExamResult"'::regclass ORDER BY 1;

\echo === J. EXTENSIONS ===
SELECT extname, extversion FROM pg_extension ORDER BY 1;

\echo === K. VIEWS / MATVIEWS ===
SELECT c.relkind, c.oid::regclass AS name, pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('v','m') ORDER BY 1,2;

\echo === L. SEQUENCES (top by last_value) ===
SELECT schemaname, sequencename, data_type, last_value, COALESCE(last_value,0) AS val
FROM pg_sequences WHERE schemaname='public'
ORDER BY COALESCE(last_value,0) DESC LIMIT 20;

\echo === M. ROLES & SECURITY ===
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolbypassrls
FROM pg_roles WHERE rolname NOT LIKE 'pg_%' ORDER BY rolsuper DESC, rolname;

\echo M2. Grants to PUBLIC:
SELECT table_name, privilege_type FROM information_schema.role_table_grants
WHERE grantee='PUBLIC' AND table_schema='public' LIMIT 20;

\echo M3. Table owners:
SELECT pg_get_userbyid(c.relowner) AS owner, count(*) AS tables
FROM pg_class c WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('r','p')
GROUP BY 1 ORDER BY 2 DESC;

\echo M4. RLS status:
SELECT count(*) FILTER (WHERE relrowsecurity) AS rls_enabled,
       count(*) FILTER (WHERE relrowsecurity AND NOT relforcerowsecurity) AS rls_not_forced
FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind IN ('r','p');

\echo M5. Current connections:
SELECT usename, application_name, state, count(*) FROM pg_stat_activity
WHERE datname='thanawy' GROUP BY 1,2,3 ORDER BY 4 DESC;

\echo === N. MIGRATIONS STATE ===
SELECT count(*) AS migrations, max("appliedAt") AS last_applied FROM schema_migrations;
SELECT id, "appliedAt" FROM schema_migrations ORDER BY id DESC LIMIT 10;

\echo === O. NAMING CONVENTION MIX ===
SELECT count(*) FILTER (WHERE relname ~ '^[A-Z]') AS pascal_case,
       count(*) FILTER (WHERE relname ~ '^[a-z]') AS snake_case
FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind IN ('r','p');

\echo === P. pg_stat_statements ===
\echo NOT INSTALLED (finding): shared_preload_libraries lacks pg_stat_statements

\echo === Q. STALE STATS ===
SELECT relname, n_live_tup, n_mod_since_analyze,
       CASE WHEN n_mod_since_analyze > 0.2*GREATEST(n_live_tup,1) THEN 'STALE_STATS' ELSE '' END AS flag
FROM pg_stat_all_tables WHERE schemaname='public' AND n_mod_since_analyze > 0.2*GREATEST(n_live_tup,100)
ORDER BY n_mod_since_analyze DESC LIMIT 15;

\echo === R. LONG RUNNING TRANSACTIONS ===
SELECT pid, state, now()-xact_start AS xact_age, LEFT(query,60) AS query
FROM pg_stat_activity WHERE datname='thanawy' AND state<>'idle' AND xact_start < now()-interval '5 min';
