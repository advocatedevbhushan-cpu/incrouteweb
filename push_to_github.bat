@echo off
title INCroute statutory Git Publisher
echo ========================================================
echo          INCROUTE STATUTORY GIT PUBLISHER
echo ========================================================
echo.
echo Step 1: Staging files in local workspace...
git add .
echo.
echo Step 2: Committing pristine codebase upgrades...
git commit -m "feat: complete Client Portal purge, advanced blog editor upgrades, premium animations, and DeepSeek Name Advisor integration"
echo.
echo Step 3: Setting default branch to main...
git branch -M main
echo.
echo Step 4: Configuring remote origin to:
echo https://github.com/advocatedevbhushan-cpu/incrouteweb.git
git remote remove origin 2>nul
git remote add origin https://github.com/advocatedevbhushan-cpu/incrouteweb.git
echo.
echo Step 5: Pushing codebase up to GitHub...
git push -u origin main
echo.
echo ========================================================
echo          CODEBASE PUBLISHING COMPLETED!
echo ========================================================
echo.
pause
