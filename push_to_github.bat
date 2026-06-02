@echo off
title INCroute — Push to GitHub
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║          INCROUTE — GITHUB AUTO PUBLISHER            ║
echo  ║   https://github.com/advocatedevbhushan-cpu/         ║
echo  ║                  incrouteweb.git                     ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: Set timestamp for commit message
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DATE=%%c-%%b-%%a
for /f "tokens=1-2 delims=:." %%a in ("%time%") do set TIME=%%a:%%b

echo  [1/4] Staging all changed files...
git add -A
echo  Done.
echo.

echo  [2/4] Enter a commit message (or press Enter for auto message):
set /p COMMIT_MSG="  > "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update: %DATE% %TIME%

git commit -m "%COMMIT_MSG%"
echo.

echo  [3/4] Verifying remote origin...
git remote set-url origin https://github.com/advocatedevbhushan-cpu/incrouteweb.git 2>nul
if errorlevel 1 (
    git remote add origin https://github.com/advocatedevbhushan-cpu/incrouteweb.git
)
echo  Remote: https://github.com/advocatedevbhushan-cpu/incrouteweb.git
echo.

echo  [4/4] Pushing to GitHub (main branch)...
git push -u origin main
echo.

if errorlevel 1 (
    color 0C
    echo  ╔══════════════════════════════════════════════════════╗
    echo  ║   ERROR: Push failed. Check your internet or auth.  ║
    echo  ╚══════════════════════════════════════════════════════╝
) else (
    color 0A
    echo  ╔══════════════════════════════════════════════════════╗
    echo  ║   SUCCESS! All files pushed to GitHub.              ║
    echo  ║   https://github.com/advocatedevbhushan-cpu/        ║
    echo  ║                  incrouteweb                        ║
    echo  ╚══════════════════════════════════════════════════════╝
)

echo.
pause
