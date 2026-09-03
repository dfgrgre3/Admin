$ErrorActionPreference = 'Stop'
$q = [char]39

# ---- 1. FK supporting indexes ----
$fk = Get-Content 'd:\admin\.claude\fk_missing.txt' | Where-Object { $_ -match '\|' }
$stmts = @('BEGIN;',"SET lock_timeout = '10s';")
foreach ($line in $fk) {
  $parts = $line -split '\|'
  $tbl = $parts[0].Trim()          # already quoted for PascalCase
  $cols = $parts[1].Trim()
  $tblClean = $tbl -replace '"',''
  $idxName = ('fkidx_' + $tblClean + '_' + $cols)
  if ($idxName.Length -gt 60) { $idxName = $idxName.Substring(0,60) }
  $stmts += "CREATE INDEX IF NOT EXISTS `"$idxName`" ON $tbl ($cols);"
}
$stmts += 'COMMIT;'
$stmts | Set-Content 'd:\admin\.claude\fk_indexes.sql' -Encoding ascii
cmd /c "docker exec -i thanawy-postgres-1 psql -U thanawy -d thanawy -v ON_ERROR_STOP=1 < d:\admin\.claude\fk_indexes.sql > d:\admin\.claude\fk_exec_out.txt 2>&1"
Get-Content 'd:\admin\.claude\fk_exec_out.txt' | Select-Object -Last 4

# ---- 2. app_user role + grants (idempotent) ----
$roleSql = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END
`$`$;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;
GRANT app_user TO thanawy;
"@
$roleSql | Out-File 'd:\admin\.claude\app_role.sql' -Encoding utf8
cmd /c "docker exec -i thanawy-postgres-1 psql -U thanawy -d thanawy -v ON_ERROR_STOP=1 < d:\admin\.claude\app_role.sql > d:\admin\.claude\role_exec_out.txt 2>&1"
Get-Content 'd:\admin\.claude\role_exec_out.txt' | Select-Object -Last 4

# ---- 3. drop empty prisma migrations table + vacuum roles ----
$maint = @"
BEGIN;
DO `$`$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_prisma_migrations') THEN
    IF NOT EXISTS (SELECT 1 FROM _prisma_migrations) THEN
      DROP TABLE _prisma_migrations;
    END IF;
  END IF;
END
`$`$;
COMMIT;
VACUUM (ANALYZE) roles;
VACUUM (ANALYZE) "UserSession";
"@
$maint | Out-File 'd:\admin\.claude\maintenance.sql' -Encoding utf8
cmd /c "docker exec -i thanawy-postgres-1 psql -U thanawy -d thanawy -v ON_ERROR_STOP=1 < d:\admin\.claude\maintenance.sql > d:\admin\.claude\maint_exec_out.txt 2>&1"
Get-Content 'd:\admin\.claude\maint_exec_out.txt' | Select-Object -Last 6
