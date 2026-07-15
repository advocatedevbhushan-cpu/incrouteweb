@echo off
title INCroute — Local Backup Utility
color 0B
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║             INCROUTE — LOCAL BACKUP UTILITY            ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

set SRC=%~dp0
:: Remove trailing backslash if exists for clean robocopy path
if "%SRC:~-1%"=="\" set SRC=%SRC:~0,-1%

set "DEFAULT_DST=D:\My Business related documents\My website\My website"

echo Select Backup Destination Option:
echo  [1] Default Folder: "%DEFAULT_DST%"
echo  [2] Select Folder via GUI Dialog (opens folder window)
echo  [3] Type Folder Path Manually
echo.
choice /c 123 /n /m "Enter choice (1, 2, or 3): "

if errorlevel 3 goto MANUAL
if errorlevel 2 goto GUI
if errorlevel 1 goto DEFAULT

:DEFAULT
set "DST=%DEFAULT_DST%"
goto RUN_BACKUP

:GUI
echo.
echo Opening folder selection dialog...
set "DST="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.FolderBrowserDialog; $dialog.Description = 'Select Backup Destination Folder'; $dialog.ShowNewFolderButton = $true; if ($dialog.ShowDialog() -eq 'OK') { $dialog.SelectedPath }"`) do set "DST=%%I"

if "%DST%"=="" (
    echo No folder selected or dialog canceled. Using default folder path.
    set "DST=%DEFAULT_DST%"
)
goto RUN_BACKUP

:MANUAL
echo.
set /p "DST=Enter backup folder path: "
if "%DST%"=="" (
    echo No path entered. Using default folder path.
    set "DST=%DEFAULT_DST%"
)
goto RUN_BACKUP

:RUN_BACKUP
:: Remove trailing backslash if exists in DST for clean robocopy path
if "%DST:~-1%"=="\" set DST=%DST:~0,-1%

echo.
echo Source:      "%SRC%"
echo Destination: "%DST%"
echo.

echo Press any key to start the backup, or Close this window to cancel...
pause >nul
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
    echo  ╚══════════════════════════════════════════════════════╝
    echo  Saved to: "%DST%"
)

echo.
pause
