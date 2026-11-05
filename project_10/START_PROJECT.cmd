@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Please install Node.js 24 first, then reopen this file.
 pause
 exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24)process.exit(1)"
if errorlevel 1 (
 echo Node.js 24 or newer is required. Please upgrade Node.js.
 pause
 exit /b 1
)
start "BookVerse Backend" cmd /k "cd /d ""%~dp0backend"" && npm start"
start "BookVerse Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm start"
echo Open http://localhost:5173 when both terminal windows show their URLs.
echo Keep both terminal windows open while using BookVerse.
pause
