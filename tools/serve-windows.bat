@echo off
REM Double-click this to view the site. Close this window to stop.
cd /d "%~dp0.."

echo.
echo   Memory Mug Company
echo   ------------------
echo   Opening http://localhost:8000
echo   Admin:  http://localhost:8000/#admin
echo.
echo   Leave this window open while you browse.
echo   Press Ctrl-C here when you're done.
echo.

start "" http://localhost:8000
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8000
) else (
  py -m http.server 8000
)
