@echo off
echo ========================================
echo Fixing Corrupted Node Modules
echo ========================================
echo.

echo Step 1: Stopping any Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Cleaning npm cache...
call npm cache clean --force

echo Step 3: Removing node_modules (this may take a while)...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules removed
) else (
    echo node_modules folder not found
)

echo Step 4: Removing package-lock.json...
if exist package-lock.json (
    del /f package-lock.json
    echo package-lock.json removed
) else (
    echo package-lock.json not found
)

echo Step 5: Installing dependencies (this will take 2-3 minutes)...
call npm install

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run: npm run dev
echo.
pause
