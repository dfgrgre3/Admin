\echo === T1. ID column type distribution ===
SELECT format_type(a.atttypid,a.atttypmod) AS id_type, count(*) AS tables
FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p') AND a.attname='id' AND a.attnum>0
GROUP BY 1 ORDER BY 2 DESC;

\echo === T2. Nullable FK columns (integrity smell) ===
SELECT con.conrelid::regclass AS tbl, a.attname AS col
FROM pg_constraint con
JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=con.conkey[1]
WHERE con.contype='f' AND con.connamespace='public'::regnamespace AND NOT a.attnotnull
ORDER BY 1 LIMIT 25;

\echo === T3. Who is connected (role identity check) ===
SELECT usename, count(*), max(backend_start) AS oldest
FROM pg_stat_activity WHERE datname='thanawy' GROUP BY 1;

\echo === T4. app_user membership ===
SELECT r.rolname AS role, m.rolname AS member
FROM pg_auth_members am JOIN pg_roles r ON r.oid=am.roleid JOIN pg_roles m ON m.oid=am.member;

\echo === T5. Text-typed PKs (uuid as text smell) ===
SELECT con.conrelid::regclass AS tbl, format_type(a.atttypid,a.atttypmod) AS pk_type
FROM pg_constraint con JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=con.conkey[1]
WHERE con.contype='p' AND con.connamespace='public'::regnamespace AND a.atttypid NOT IN (SELECT oid FROM pg_type WHERE typname IN ('uuid','int4','int8','int2'))
ORDER BY 1 LIMIT 25;

\echo === T6. Records with isDeleted/deletedAt legacy columns count ===
SELECT count(*) AS tables_with_soft_delete
FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('r','p')
AND a.attname IN ('deletedAt','isDeleted') AND a.attnum>0;

\echo T6b. Breakdown:
SELECT a.attname AS col, count(*) AS tables
FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('r','p')
AND a.attname IN ('deletedAt','isDeleted') AND a.attnum>0
GROUP BY 1 ORDER BY 2 DESC;
