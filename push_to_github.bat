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

:: Clear stale index.lock if present
if exist .git\index.lock (
    echo   [Pre-flight] Removing stale git index.lock...
    del /f /q .git\index.lock >nul 2>nul
)

:: ─── Stage all changes ───
echo   [1/4] Staging changes...
git add -A
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set CHANGED=%%i
if "!CHANGED!"=="0" (
    git status -sb | find "ahead" >nul
    if errorlevel 1 (
        echo         No changes to commit or push.
        pause
        exit /b 0
    )
)
echo         Staging completed.
echo.

:: ─── Commit ───
echo   [2/4] Committing...
set /p COMMIT_MSG="         Message (Enter for auto): "
if "!COMMIT_MSG!"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DSTAMP=%%c-%%b-%%a
    for /f "tokens=1-2 delims=:." %%a in ("%time: =0%") do set TSTAMP=%%a:%%b
    set COMMIT_MSG=deploy: !DSTAMP! !TSTAMP!
)
git commit -m "!COMMIT_MSG!" >nul 2>nul
if errorlevel 1 (
    echo         Nothing new to commit.
) else (
    echo         Done.
)
echo.

:: ─── Sync with Remote ───
echo   [3/4] Pulling remote changes (rebase)...
git pull origin main --rebase
if errorlevel 1 (
    color 0C
    echo.
    echo   PULL/REBASE FAILED — A file may be locked or there are conflicts.
    echo   Please make sure your dev server is stopped, or run:
    echo   git rebase --abort
    echo.
    pause
    exit /b 1
)
echo         Sync completed.
echo.

:: ─── Push ───
echo   [4/4] Pushing to origin/main...
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
