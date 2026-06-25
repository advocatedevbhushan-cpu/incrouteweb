@echo off
setlocal enabledelayedexpansion
title INCroute — Push to GitHub
color 0B

echo.
echo   ╔═══════════════════════════════════════╗
echo   ║   INCroute — Quick Push to GitHub     ║
echo   ╚═══════════════════════════════════════╝
echo.

:: ─── Pre-flight ───
git rev-parse --git-dir >nul 2>nul
if errorlevel 1 (
    color 0C
    echo   ERROR: Not a git repository.
    pause
    exit /b 1
)

:: ─── Stage all changes ───
echo   [1/3] Staging changes...
git add -A
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set CHANGED=%%i
if "!CHANGED!"=="0" (
    echo         No changes to push.
    pause
    exit /b 0
)
echo         %CHANGED% file(s) staged
echo.

:: ─── Commit ───
echo   [2/3] Committing...
set /p COMMIT_MSG="         Message (Enter for auto): "
if "!COMMIT_MSG!"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DSTAMP=%%c-%%b-%%a
    for /f "tokens=1-2 delims=:." %%a in ("%time: =0%") do set TSTAMP=%%a:%%b
    set COMMIT_MSG=deploy: !DSTAMP! !TSTAMP!
)
git commit -m "!COMMIT_MSG!"
if errorlevel 1 (
    echo         Nothing to commit.
    echo.
    goto :push
)
echo         Done.
echo.

:: ─── Push ───
:push
echo   [3/3] Pushing to origin/main...
git push origin main
if errorlevel 1 (
    color 0C
    echo.
    echo   PUSH FAILED — check connection or run manually:
    echo   git push origin main
    echo.
    pause
    exit /b 1
)

:: ─── Done ───
echo.
color 0A
echo   ✓ Pushed successfully. Hostinger will auto-deploy.
echo.
pause
