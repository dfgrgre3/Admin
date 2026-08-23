@echo off
rem Detached Next.js dev-server launcher (spawned via WMI so it survives the parent shell)
rem NOTE: do NOT add -r/--require flags here — Next propagates execArgv into workers'
rem NODE_OPTIONS where -r is forbidden, which kills every compile worker instantly
rem ("Jest worker encountered N child process exceptions, exceeding retry limit").
cd /d d:\admin
node --max-old-space-size=4096 ./node_modules/next/dist/bin/next dev >> d:\admin\.dev-out.log 2>&1
