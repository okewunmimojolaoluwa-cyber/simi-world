@echo off
echo ================================
echo   ROQEEBAT'S BIRTHDAY WEBSITE
echo   Photo Copy Helper
echo ================================
echo.
echo This script will help you copy photos with the correct names.
echo.
echo STEP 1: Copy 4 photos for "Our Story" section
echo.
echo Where are your photos saved? (drag folder here and press Enter)
set /p SOURCE_FOLDER=
echo.

echo Creating folders...
if not exist "public\images\gallery" mkdir "public\images\gallery"
echo ✓ Folders created!
echo.

echo.
echo ================================
echo MANUAL STEPS:
echo ================================
echo.
echo 1. Copy 4 photos for "Our Story" to: public\images\
echo    Rename them:
echo    - memory1.jpg
echo    - memory2.jpg  
echo    - memory3.jpg
echo    - memory4.jpg
echo.
echo 2. Copy 9+ photos for gallery to: public\images\gallery\
echo    Rename them:
echo    - photo1.jpg
echo    - photo2.jpg
echo    - ... photo9.jpg (or more!)
echo.
echo TIP: Use the beautiful photos you showed me!
echo      - White hoodie photo
echo      - Black outfit photos
echo      - Yellow top photos
echo.
echo ================================
echo Opening folders for you...
echo ================================
start "" "%CD%\public\images"
start "" "%CD%\public\images\gallery"
echo.
echo ✓ Folders opened!
echo.
echo Now copy your photos there with the correct names!
echo.
pause
