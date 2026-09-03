\echo === S. MIGRATIONS (last 15) ===
SELECT id, "appliedAt" FROM schema_migrations ORDER BY id DESC LIMIT 15;

\echo === S2. UserSession indexes vs FK ===
SELECT indexname, indexdef FROM pg_indexes WHERE tablename='UserSession';
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='"UserSession"'::regclass;

\echo === S3. app_user grants sample ===
SELECT count(*) AS total_grants FROM information_schema.role_table_grants WHERE grantee='app_user';
SELECT table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee='app_user' LIMIT 10;

\echo === S4. CASCADE RISK: FKs with CASCADE grouped by referencing table (top 20) ===
SELECT con.conrelid::regclass AS referencing_table, count(*) AS cascade_fks
FROM pg_constraint con WHERE con.contype='f' AND con.confdeltype='c' AND con.connamespace='public'::regnamespace
GROUP BY 1 ORDER BY 2 DESC LIMIT 20;

\echo === S5. EMPTY TABLES COUNT ===
SELECT count(*) AS empty_tables FROM pg_stat_all_tables WHERE schemaname='public' AND n_live_tup=0 AND relid IN (SELECT oid FROM pg_class WHERE relkind IN ('r','p'));

\echo === S6. shared_preload_libraries / data_checksums ===
SELECT name, setting FROM pg_settings WHERE name IN ('shared_preload_libraries','data_directory');

\echo === S7. DEFAULT PARTITION rows ===
SELECT count(*) FROM ONLY "ExamResult";

\echo === S8. MATVIEWS freshness ===
SELECT matviewname, ispopulated FROM pg_matviews WHERE schemaname='public';

\echo === S9. PascalCase tables that are EMPTY but have heavy index footprint (top 15 idx/heap ratio) ===
SELECT c.oid::regclass AS tbl, pg_size_pretty(pg_indexes_size(c.oid)) AS idx_size, pg_size_pretty(pg_relation_size(c.oid)) AS heap_size, s.n_live_tup
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
LEFT JOIN pg_stat_all_tables s ON s.relid=c.oid
WHERE n.nspname='public' AND c.relkind='r' AND s.n_live_tup=0 AND pg_indexes_size(c.oid)>32768
ORDER BY pg_indexes_size(c.oid) DESC LIMIT 15;

\echo === S10. Views shadowing tables (naming collisions case-insensitive) ===
SELECT lower(v.relname) AS name_lower, v.relkind, v.oid::regclass AS obj
FROM pg_class v JOIN pg_namespace n ON n.oid=v.relnamespace
WHERE n.nspname='public' AND v.relkind IN ('r','v')
ORDER BY 1;

\echo === S11. Orphan check sample: user_roles.user_id -> "User" ===
SELECT count(*) AS orphan_user_roles FROM user_roles ur WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id=ur.user_id);
\echo S12. role_permissions orphans:
SELECT count(*) AS orphan_role_permissions FROM role_permissions rp WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.id=rp.role_id);

\echo === S13. Autovacuum per-table reloptions ===
SELECT relname, reloptions FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind IN ('r','p') AND reloptions IS NOT NULL LIMIT 15;
