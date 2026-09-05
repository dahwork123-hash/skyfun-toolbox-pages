@echo off
cd /d "%~dp0"
echo.
echo Local preview starting...
echo Keep this window open. Close it to stop.
echo.
node "%~dp0scripts\preview-local-server.mjs" 8787
if errorlevel 1 (
  echo.
  echo Failed. Is Node.js installed? https://nodejs.org
)
echo.
pause
