@echo off
setlocal enabledelayedexpansion
title INCroute — Deploy to GitHub
color 0B

echo.
echo   ┌─────────────────────────────────────────────────────┐
echo   │                                                     │
echo   │         ██╗███╗   ██╗ ██████╗                       │
echo   │         ██║████╗  ██║██╔════╝ route                 │
echo   │         ██║██╔██╗ ██║██║                            │
echo   │         ██║██║╚██╗██║╚██████╗  Deploy Pipeline      │
echo   │         ╚═╝╚═╝ ╚═══╝ ╚═════╝                       │
echo   │                                                     │
echo   │   github.com/advocatedevbhushan-cpu/incrouteweb     │
echo   └─────────────────────────────────────────────────────┘
echo.

:: ─── STEP 1: Pre-flight checks ───
echo   [1/5] Pre-flight checks...
where git >nul 2>nul
if errorlevel 1 (
    color 0C
    echo         ERROR: git is not installed or not in PATH.
    goto :fail
)

:: Check if we're in a git repo
git rev-parse --git-dir >nul 2>nul
if errorlevel 1 (
    color 0C
    echo         ERROR: Not a git repository.
    goto :fail
)
echo         ✓ Git repository verified
echo.

:: ─── STEP 2: Build project ───
echo   [2/5] Building project...
echo         Running: npm run build
call npm run build >nul 2>&1
if errorlevel 1 (
    color 0E
    echo         ⚠ Build had warnings/errors. Continuing anyway...
) else (
    echo         ✓ Build completed successfully
)
echo.

:: ─── STEP 3: Stage files ───
echo   [3/5] Staging changes...
:: Close OneDrive file locks by waiting briefly
timeout /t 2 /nobreak >nul 2>nul
git add -A
if errorlevel 1 (
    echo         ⚠ Some files couldn't be staged (OneDrive lock?)
    echo         Retrying in 3 seconds...
    timeout /t 3 /nobreak >nul
    git add -A
)
:: Show what changed
for /f %%i in ('git diff --cached --numstat ^| find /c /v ""') do set CHANGED=%%i
echo         ✓ %CHANGED% file(s) staged
echo.

:: ─── STEP 4: Commit ───
echo   [4/5] Creating commit...
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DSTAMP=%%c-%%b-%%a
for /f "tokens=1-2 delims=:." %%a in ("%time: =0%") do set TSTAMP=%%a:%%b

set /p COMMIT_MSG="         Enter message (Enter for auto): "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=deploy: !DSTAMP! !TSTAMP!

git commit -m "!COMMIT_MSG!" >nul 2>&1
if errorlevel 1 (
    echo         ℹ Nothing to commit (working tree clean)
    echo.
    goto :push
)
echo         ✓ Committed: "!COMMIT_MSG!"
echo.

:: ─── STEP 5: Push ───
:push
echo   [5/5] Pushing to GitHub...
echo.

:: Ensure remote is correct
git remote set-url origin https://github.com/advocatedevbhushan-cpu/incrouteweb.git 2>nul
if errorlevel 1 (
    git remote add origin https://github.com/advocatedevbhushan-cpu/incrouteweb.git 2>nul
)

:: Push with retry logic for OneDrive issues
git push -u origin main
if errorlevel 1 (
    echo.
    echo         ⚠ First push attempt failed. Retrying...
    timeout /t 3 /nobreak >nul
    git push -u origin main
    if errorlevel 1 (
        goto :fail
    )
)

:: ─── SUCCESS ───
echo.
color 0A
echo   ┌─────────────────────────────────────────────────────┐
echo   │                                                     │
echo   │   ✓ DEPLOYED SUCCESSFULLY                           │
echo   │                                                     │
echo   │   Remote: github.com/advocatedevbhushan-cpu/        │
echo   │           incrouteweb (main)                        │
echo   │                                                     │
echo   │   Hostinger will auto-deploy in ~60 seconds.        │
echo   │                                                     │
echo   └─────────────────────────────────────────────────────┘
echo.
goto :end

:fail
echo.
color 0C
echo   ┌─────────────────────────────────────────────────────┐
echo   │                                                     │
echo   │   ✗ PUSH FAILED                                     │
echo   │                                                     │
echo   │   Common fixes:                                     │
echo   │   • Close OneDrive sync temporarily                 │
echo   │   • Check internet connection                       │
echo   │   • Run: git push -u origin main  manually          │
echo   │                                                     │
echo   └─────────────────────────────────────────────────────┘
echo.

:end
endlocal
pause
