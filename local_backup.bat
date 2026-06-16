@echo off
title INCroute — Local Backup to D: Drive
color 0B
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║             INCROUTE — LOCAL BACKUP UTILITY            ║
echo  ║   Copies project to: D:\My Business related documents   ║
echo  ║                      \My website\My website            ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

set SRC=%~dp0
:: Remove trailing backslash if exists for clean robocopy path
if "%SRC:~-1%"=="\" set SRC=%SRC:~0,-1%
set DST=D:\My Business related documents\My website\My website

echo Source:      "%SRC%"
echo Destination: "%DST%"
echo.

echo  [1/2] Preparing copy...
echo  Note: To optimize speed and space, we are excluding:
echo        - node_modules (reinstall via 'npm install')
echo        - .git (git history)
echo        - dist (build output)
echo.

echo  [2/2] Running Robocopy...
echo.

:: Robocopy options used:
:: /E   : Copy subdirectories, including empty ones.
:: /XD  : Exclude directories matching these names (node_modules, .git, .vscode, dist)
:: /R:3 : Retry failed copies 3 times
:: /W:5 : Wait 5 seconds between retries
:: /MT:8: Multithreaded copy using 8 threads (very fast)
robocopy "%SRC%" "%DST%" /E /XD node_modules .git .vscode dist /R:3 /W:5 /MT:8

:: Robocopy exit codes:
:: 0 to 7 indicate success (files copied or already up to date).
:: 8 or higher indicates errors.
if errorlevel 8 (
    color 0C
    echo.
    echo  ╔══════════════════════════════════════════════════════╗
    echo  ║   ERROR: Backup failed or completed with errors.    ║
    echo  ╚══════════════════════════════════════════════════════╝
) else (
    color 0A
    echo.
    echo  ╔══════════════════════════════════════════════════════╗
    echo  ║   SUCCESS! Project backup completed successfully.    ║
    echo  ║   Location: D:\My Business related documents...     ║
    echo  ╚══════════════════════════════════════════════════════╝
)

echo.
pause
