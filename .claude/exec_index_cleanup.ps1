$ErrorActionPreference = 'Stop'
$names = Get-Content 'd:\admin\.claude\final_drop_names.txt' | Where-Object { $_ }
$q = [char]39
$in = ($names | ForEach-Object { $q + $_ + $q }) -join ','

# 1. recreate script (definitions of all to-be-dropped indexes)
$sqlDefs = "SELECT '-- RECREATE: ' || i.relname || E'\n' || pg_get_indexdef(i.oid) || ';' FROM pg_class i WHERE i.relname IN ($in) ORDER BY i.relname;"
docker exec thanawy-postgres-1 psql -U thanawy -d thanawy -At -c $sqlDefs | Out-File 'd:\admin\.claude\recreate_dropped_indexes_final.sql' -Encoding utf8
Write-Host "recreate definitions: $((Select-String -Path 'd:\admin\.claude\recreate_dropped_indexes_final.sql' -Pattern 'CREATE (UNIQUE )?INDEX' -AllMatches).Count)"

# 2. drop script (single transaction)
$hdr = "BEGIN;`nSET lock_timeout = '10s';"
$stmts = $names | ForEach-Object { "DROP INDEX IF EXISTS public.`"$($_)`";" }
$ftr = "COMMIT;"
($hdr, $stmts, $ftr) | Set-Content 'd:\admin\.claude\final_drop_script.sql' -Encoding ascii
Write-Host "drop statements: $($stmts.Count)"

# 3. verify pre-state
$before = docker exec thanawy-postgres-1 psql -U thanawy -d thanawy -At -c "SELECT count(*) FROM pg_indexes WHERE schemaname='public'"
Write-Host "indexes before: $before"

# 4. execute
cmd /c "docker exec -i thanawy-postgres-1 psql -U thanawy -d thanawy -v ON_ERROR_STOP=1 < d:\admin\.claude\final_drop_script.sql > d:\admin\.claude\drop_exec_out.txt 2>&1"
Get-Content 'd:\admin\.claude\drop_exec_out.txt' | Select-Object -Last 6

# 5. verify post-state
$after = docker exec thanawy-postgres-1 psql -U thanawy -d thanawy -At -c "SELECT count(*) FROM pg_indexes WHERE schemaname='public'"
Write-Host "indexes after: $after (dropped: $($before - $after))"
